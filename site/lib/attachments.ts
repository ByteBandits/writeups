import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { codeToHtml } from "shiki";
import type { Writeup } from "./content";
import { siteUrl } from "./url";

const REPO_ROOT = resolve(process.cwd(), "..");
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);

const TEXT_LANG: Record<string, string> = {
  py: "python", c: "c", h: "c", cpp: "cpp", cc: "cpp", hpp: "cpp",
  js: "javascript", ts: "typescript", sh: "bash", bash: "bash",
  txt: "text", md: "markdown", json: "json", xml: "xml", html: "html",
  css: "css", yml: "yaml", yaml: "yaml", csv: "csv", dot: "dot",
  java: "java", rb: "ruby", go: "go", rs: "rust", php: "php",
  pl: "perl", lua: "lua", asm: "asm", s: "asm", gdb: "gdb",
  ini: "ini", toml: "toml", sql: "sql", dockerfile: "docker",
  makefile: "makefile", sol: "solidity", kt: "kotlin", swift: "swift",
  pem: "text", key: "text", crt: "text", asc: "text", log: "text",
  conf: "text", cfg: "text", nasm: "nasm",
};

/** these are never previewed — containers/binaries meant for real tools */
const DOWNLOAD_EXT = new Set([
  "zip", "xz", "tgz", "gz", "bz2", "7z", "rar", "tar", "jar", "apk",
  "pcap", "pcapng", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "odt", "ods", "odp",
]);

const MAX_TEXT_BYTES = 128 * 1024;
const HEX_HEAD_BYTES = 256;

export interface AttachmentItem {
  name: string;
  url: string;
  size: string;
  kind: "text" | "hex" | "pdf" | "download";
  html?: string;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function hexdump(buf: Buffer): string {
  const lines: string[] = [];
  for (let off = 0; off < buf.length; off += 16) {
    const slice = buf.subarray(off, off + 16);
    const hex = [...slice]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
      .padEnd(47, " ");
    const ascii = [...slice]
      .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "."))
      .join("");
    lines.push(`${off.toString(16).padStart(8, "0")}: ${hex}  ${ascii}`);
  }
  return `<pre class="hexdump">${esc(lines.join("\n"))}</pre>`;
}

const looksBinary = (buf: Buffer) => buf.includes(0);

export interface FilePreview {
  kind: "text" | "hex" | "pdf";
  html: string;
}

export async function renderFilePreview(
  full: string
): Promise<FilePreview | null> {
  const name = full.split("/").pop() ?? "";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const st = statSync(full);

  if (DOWNLOAD_EXT.has(ext)) return null;
  if (ext === "pdf") return { kind: "pdf", html: "" };

  const buf = readFileSync(full);
  const isText = st.size <= MAX_TEXT_BYTES && !looksBinary(buf.subarray(0, 8192));
  const lang =
    TEXT_LANG[ext] ??
    (/^(makefile|dockerfile)$/i.test(name) ? TEXT_LANG[name.toLowerCase()] : undefined) ??
    (isText ? "text" : undefined);

  if (lang && isText) {
    try {
      const html = await codeToHtml(buf.toString("utf8"), {
        lang,
        theme: "github-dark-dimmed",
      });
      return { kind: "text", html };
    } catch {
      // unknown grammar — fall through to hex
    }
  }
  return { kind: "hex", html: hexdump(buf.subarray(0, HEX_HEAD_BYTES)) };
}

export const contentUrl = (absPath: string) =>
  siteUrl(
    "/content/" +
      relative(REPO_ROOT, absPath)
        .split("/")
        .map(encodeURIComponent)
        .join("/")
  );

async function buildItem(dir: string, full: string): Promise<AttachmentItem> {
  const rel = relative(REPO_ROOT, full);
  const st = statSync(full);
  const name = relative(dir, full);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const base: AttachmentItem = {
    name,
    url: "/content/" + rel.split("/").map(encodeURIComponent).join("/"),
    size: fmtSize(st.size),
    kind: "download",
  };

  const preview = await renderFilePreview(full);
  if (!preview) return base;
  if (preview.kind === "pdf") return { ...base, kind: "pdf" };
  return { ...base, kind: preview.kind, html: preview.html };
}

export async function getAttachments(w: Writeup): Promise<AttachmentItem[]> {
  const dir = join(REPO_ROOT, w.relDir);
  const files: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      if (name.startsWith(".")) continue;
      const full = join(d, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (!/^readme\.md$/i.test(name)) {
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (!IMAGE_EXT.has(ext)) files.push(full);
      }
    }
  };
  try {
    walk(dir);
  } catch {
    return [];
  }
  const items = await Promise.all(
    files.sort().map((f) => buildItem(dir, f))
  );
  return items;
}
