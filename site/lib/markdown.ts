import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { renderFilePreview, type FilePreview } from "./attachments";

const REPO_ROOT = resolve(process.cwd(), "..");
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);

const META_LINE = /^\[\]\([^)=]+=[^)]*\)\s*$/;

const META_HREF = /^[^\s/=?]+=[^)]*$/; // parsed meta links: href "ctf=x"
const META_TEXT = /^\[\]\([^\s)]*=[^)]*\)\s*$/; // unparseable meta lines (commas/spaces)

/**
 * drop the ctfs/write-ups metadata lines ([](ctf=...) etc.).
 * Lines with comma-space values don't parse as links, so meta must be
 * stripped child-by-child (link hrefs and literal text), not per-paragraph.
 */
function remarkStripMeta() {
  return (tree: any) => {
    tree.children = tree.children
      .map((node: any) => {
        if (node.type !== "paragraph") return node;
        node.children = (node.children ?? [])
          .map((c: any) => {
            if (c.type === "text") {
              const kept = c.value
                .split("\n")
                .filter((l: string) => !META_TEXT.test(l.trim()));
              return { ...c, value: kept.join("\n") };
            }
            return c;
          })
          .filter((c: any) => {
            if (c.type === "link" && (c.children?.length ?? 0) === 0)
              return !META_HREF.test(c.url ?? "");
            return true;
          });
        return node;
      })
      .filter((node: any) => {
        if (node.type !== "paragraph") return true;
        return (node.children ?? []).some(
          (c: any) => !(c.type === "text" && !c.value.trim())
        );
      });
  };
}

function resolvePath(relDir: string, url: string): string[] | null {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(url)) return null; // any scheme, anchors, absolute
  const [pathPart] = url.split(/(?=[#?])/);
  if (!pathPart) return null;
  const stack = relDir.split("/");
  for (const seg of pathPart.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") stack.pop(); // pop on empty stack is a no-op — cannot escape repo root
    else stack.push(seg);
  }
  return stack;
}

/** dead relative links/images found at build time, for the build report */
export const deadLinks: { from: string; target: string }[] = [];

function noteDead(from: string, target: string) {
  deadLinks.push({ from, target });
  console.warn(`[dead-link] ${from} -> ${target}`);
}

const toUrl = (segments: string[], suffix = "") =>
  "/content/" + segments.map(encodeURIComponent).join("/") + suffix;

export interface LinkedFile {
  url: string;
  name: string;
  kind: "text" | "hex" | "pdf" | "download";
  html: string;
}

/** rewrite relative asset refs; tag file links; inline ![](file) embeds */
function rehypeAssets(relDir: string, linkedFiles: Map<string, LinkedFile>) {
  return () => async (tree: any) => {
    const embeds: { node: any; parent: any; index: number }[] = [];
    const jobs: (() => Promise<void>)[] = [];

    visit(tree, "element", (node: any, index: any, parent: any) => {
      if (node.tagName === "a") {
        const href = node.properties?.href;
        if (typeof href !== "string") return;
        const segments = resolvePath(relDir, href);
        if (!segments) return;
        const suffix = href.split(/(?=[#?])/).slice(1).join("");
        if (!existsSync(join(REPO_ROOT, ...segments))) {
          noteDead(relDir, href);
          return; // leave the original href untouched
        }
        const url = toUrl(segments, suffix);
        node.properties.href = url;
        const name = segments[segments.length - 1];
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (!IMAGE_EXT.has(ext) && !suffix) {
          node.properties.className = [
            ...(node.properties.className ?? []),
            "filelink",
          ];
          node.properties["data-file"] = url;
          jobs.push(async () => {
            if (linkedFiles.has(url)) return;
            try {
              const preview = await renderFilePreview(
                join(REPO_ROOT, ...segments)
              );
              if (!preview) {
                linkedFiles.delete(url);
                delete node.properties["data-file"];
                node.properties.className = (
                  node.properties.className ?? []
                ).filter((c: string) => c !== "filelink");
                node.properties.download = true;
                return;
              }
              linkedFiles.set(url, { url, name, ...preview });
            } catch {
              linkedFiles.delete(url);
              delete node.properties["data-file"];
            }
          });
        }
      }
      if (node.tagName === "img") {
        const src = node.properties?.src;
        if (typeof src !== "string") return;
        const segments = resolvePath(relDir, src);
        if (!segments) {
          return;
        }
        if (!existsSync(join(REPO_ROOT, ...segments))) {
          noteDead(relDir, src);
          node.properties.className = [
            ...(node.properties.className ?? []),
            "img-missing",
          ];
          node.properties.alt = `[missing image: ${src}]`;
          delete node.properties.src;
          return;
        }
        const name = segments[segments.length - 1];
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (IMAGE_EXT.has(ext)) {
          node.properties.src = toUrl(segments);
        } else if (index != null && parent) {
          const url = toUrl(segments);
          embeds.push({ node, parent, index });
          jobs.push(async () => {
            try {
              const preview = await renderFilePreview(
                join(REPO_ROOT, ...segments)
              );
              linkedFiles.set(
                url,
                preview
                  ? { url, name, ...preview }
                  : { url, name, kind: "download", html: "" }
              );
            } catch {
              /* missing file — placeholder removed below if no preview */
            }
          });
          node.properties["data-embed-url"] = url;
        }
      }
    });

    await Promise.all(jobs.map((j) => j()));

    // swap embed placeholder imgs for rendered preview figures
    for (const { node, parent, index } of embeds) {
      const url = node.properties["data-embed-url"];
      const preview = linkedFiles.get(url);
      if (!preview) {
        parent.children[index] = {
          type: "element",
          tagName: "p",
          properties: { className: ["fileembed-missing"] },
          children: [{ type: "text", value: `[missing file: ${url}]` }],
        };
        continue;
      }
      const figureChildren: any[] = [
        {
          type: "element",
          tagName: "figcaption",
          properties: { className: ["fileembed-head"] },
          children: [
            { type: "text", value: preview.name },
            {
              type: "element",
              tagName: "a",
              properties: { href: url, className: ["av-dl"], download: true },
              children: [{ type: "text", value: "⬇ download" }],
            },
          ],
        },
      ];
      if (preview.kind === "pdf") {
        figureChildren.push({
          type: "element",
          tagName: "embed",
          properties: { src: url, type: "application/pdf", className: ["av-pdf"] },
        });
      } else if (preview.kind !== "download") {
        figureChildren.push({
          type: "raw",
          value: `<div class="av-body">${preview.html}</div>`,
        });
      }
      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["fileembed"] },
        children: figureChildren,
      };
    }
  };
}

export interface TocEntry {
  depth: number;
  text: string;
  id: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

const textOf = (node: any): string =>
  node.type === "text"
    ? node.value
    : (node.children ?? []).map(textOf).join("");

/** add ids + hover anchor links to headings; collect h2/h3 for the TOC */
function rehypeHeadings(toc: TocEntry[]) {
  return () => (tree: any) => {
    const seen = new Map<string, number>();
    visit(tree, "element", (node: any) => {
      const depth = ({ h1: 1, h2: 2, h3: 3, h4: 4 } as Record<string, number>)[
        node.tagName
      ];
      if (!depth) return;
      const text = textOf(node).trim();
      let id = slugify(text) || "section";
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n > 0) id = `${id}-${n}`;
      node.properties ??= {};
      node.properties.id = id;
      (node.children ??= []).push({
        type: "element",
        tagName: "a",
        properties: {
          href: `#${id}`,
          className: ["hanchor"],
          ariaLabel: `Link to ${text}`,
        },
        children: [{ type: "text", value: "#" }],
      });
      if (depth === 2 || depth === 3) toc.push({ depth, text, id });
    });
  };
}

/** remove the README's own leading h1 when it duplicates the page header */
function rehypeStripTitleH1(title?: string) {
  if (!title) return () => () => {};
  const wanted = title.trim().toLowerCase();
  return () => (tree: any) => {
    const kids = tree.children ?? [];
    for (let i = 0; i < kids.length; i++) {
      const n = kids[i];
      if (n.type !== "element") continue;
      if (n.tagName === "h1" && textOf(n).trim().toLowerCase() === wanted) {
        kids.splice(i, 1);
      }
      break; // only inspect the first element
    }
  };
}

export interface Rendered {
  html: string;
  toc: TocEntry[];
  /** files linked from the body, pre-rendered for the click-to-expand viewer */
  linkedFiles: Record<string, LinkedFile>;
}

export async function renderMarkdown(
  raw: string,
  relDir: string,
  title?: string
): Promise<Rendered> {
  const toc: TocEntry[] = [];
  const linkedFiles = new Map<string, LinkedFile>();
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStripMeta)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeAssets(relDir, linkedFiles))
    .use(rehypeStripTitleH1(title))
    .use(rehypePrettyCode, {
      theme: "github-dark-dimmed",
      keepBackground: false,
    })
    .use(rehypeHeadings(toc))
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(raw);
  return {
    html: String(file),
    toc,
    linkedFiles: Object.fromEntries(linkedFiles),
  };
}
