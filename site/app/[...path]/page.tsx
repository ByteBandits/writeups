import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { readFileSync } from "node:fs";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { getAttachments } from "@/lib/attachments";
import { ContentEnhancer } from "@/components/ContentEnhancer";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups, writeupUrl, type Writeup } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export function generateStaticParams() {
  const seen = new Set<string>();
  const out: { path: string[] }[] = [];
  for (const w of getAllWriteups()) {
    for (const p of [w.parts, w.parts.slice(0, -1)]) {
      const key = p.join("/");
      if (p.length > 0 && !seen.has(key)) {
        seen.add(key);
        out.push({ path: p });
      }
    }
  }
  return out;
}

const decodeSeg = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const w = findWriteup((await params).path.map(decodeSeg));
  if (!w) return {};
  return {
    title: w.title,
    description: `${w.title} — ${w.category} writeup from ${w.ctf} by ${w.author}`,
  };
}

function findWriteup(parts: string[]): Writeup | undefined {
  return getAllWriteups().find(
    (w) => w.parts.join("/") === parts.join("/")
  );
}

const escHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** hidden filter spans for search facets (visible header covers full-text) */
function filterMetaHtml(w: Writeup): string {
  const span = (key: string, val: string) =>
    `<span class="sr-only" data-pagefind-filter="${key}">${escHtml(val)}</span>`;
  return [
    span("ctf", w.ctf),
    span("category", w.category),
    span("author", w.author),
    ...w.tags.map((t) => span("tag", t)),
    ...w.tools.map((t) => span("tool", t)),
    ...w.techniques.map((t) => span("technique", t)),
  ].join("");
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: rawPath } = await params;
  const path = rawPath.map(decodeSeg);
  const w = findWriteup(path);
  if (!w) {
    // problem-level URL (no author segment): redirect to the single
    // writeup, or list the author variants when several exist
    const prefix = path.join("/") + "/";
    const matches = getAllWriteups().filter((x) =>
      (x.parts.join("/") + "/").startsWith(prefix)
    );
    if (matches.length === 1) redirect(writeupUrl(matches[0]));
    if (matches.length > 1) {
      return (
        <div className="listwrap">
          <h1>{path[path.length - 1]}</h1>
          <WriteupIndex writeups={matches} />
        </div>
      );
    }
    notFound();
  }

  const raw = readFileSync(w.file, "utf8");
  const { html, toc, linkedFiles } = await renderMarkdown(raw, w.relDir, w.title);
  const attachments = await getAttachments(w);
  const all = getAllWriteups();
  const moreCtf = all.find((x) => x.ctf === w.ctf && x.relDir !== w.relDir);
  const moreAuthor = all.find(
    (x) => x.author === w.author && x.relDir !== w.relDir
  );

  const crumbs = w.parts.slice(0, -1);

  return (
    <div className={`wrap${toc.length > 1 ? "" : " no-toc"}`}>
      <main data-pagefind-body>
        <div className="crumbs">
          <Link href="/">~</Link>
          {crumbs.map((seg, i) => {
            const isLast = i === crumbs.length - 1;
            const href = isLast
              ? `/${crumbs.map(encodeURIComponent).join("/")}/`
              : i === 0
                ? `/ctfs/${encodeURIComponent(seg)}/`
                : `/ctfs/${encodeURIComponent(w.ctf)}/#${encodeURIComponent(seg)}`;
            return (
              <span key={i}>
                <span className="sep">/</span>
                <Link href={href}>{seg}</Link>
              </span>
            );
          })}
          <span className="sep">/</span>
          <span className="cur">{w.author}</span>
        </div>

        <div className="whead">
          <h1 data-pagefind-meta="title" data-pagefind-weight="10">
            {w.title}
          </h1>
          <div className="meta">
            <span className="mchip cat">
              <Link href={`/categories/${encodeURIComponent(w.category)}/`}>
                {w.category}
              </Link>
            </span>
            {w.tags.map((t) => (
              <span className="mchip" key={t}>
                <Link href={`/tags/${encodeURIComponent(t)}/`}>{t}</Link>
              </span>
            ))}
            {w.tools.map((t) => (
              <span className="mchip" key={t}>
                tool: {t}
              </span>
            ))}
            {w.techniques.map((t) => (
              <span className="mchip" key={t}>
                {t}
              </span>
            ))}
            <span className="byline">
              by{" "}
              <Link href={`/authors/${encodeURIComponent(w.author)}/`}>
                {w.author}
              </Link>
              {w.updated &&
                ` · ${new Date(w.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              {" · "}
              <a
                href={`https://github.com/ByteBandits/writeups/tree/master/${w.relDir}`}
                target="_blank"
                rel="noreferrer"
              >
                view source ⎇
              </a>
            </span>
          </div>
        </div>
        <hr className="rule" />

        <article
          className="content"
          dangerouslySetInnerHTML={{ __html: filterMetaHtml(w) + html }}
        />
        <ContentEnhancer selector=".content" files={linkedFiles} />

        {attachments.length > 0 && (
          <>
            <h2 style={{ color: "var(--green)", fontSize: 18, margin: "34px 0 12px" }}>
              <span style={{ color: "var(--green-dim)" }}>## </span>attachments
            </h2>
            <AttachmentViewer items={attachments} />
          </>
        )}

        <div className="prevnext">
          <div>
            {moreCtf && (
              <>
                <span>← more from {w.ctf}</span>
                <Link href={writeupUrl(moreCtf)}>{moreCtf.title}</Link>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {moreAuthor && (
              <>
                <span>more by {w.author} →</span>
                <Link href={writeupUrl(moreAuthor)}>{moreAuthor.title}</Link>
              </>
            )}
          </div>
        </div>
      </main>

      {toc.length > 1 && (
        <aside className="toc">
          <div className="thead">on this page</div>
          {toc.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={t.depth === 3 ? "h3" : ""}>
              {t.text}
            </a>
          ))}
        </aside>
      )}
    </div>
  );
}
