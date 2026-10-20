import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export interface Writeup {
  /** path segments below repo root, e.g. [csaw-quals-2023, pwn, heap, sudhackar] */
  parts: string[];
  ctf: string;
  category: string;
  problem: string;
  author: string;
  title: string;
  tags: string[];
  tools: string[];
  techniques: string[];
  /** absolute path to the readme file */
  file: string;
  /** dir of the writeup relative to repo root, for asset resolution */
  relDir: string;
  /** ISO date of last commit touching the writeup, if known */
  updated?: string;
}

const REPO_ROOT = resolve(process.cwd(), "..");
const SKIP = new Set([".git", "site", "node_modules"]);

const META_RE = /^\[\]\(([^)=]+)=([^)]*)\)\s*$/;

function findReadmes(dir: string, depth: number, out: string[] = []): string[] {
  if (depth > 5) return out;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) findReadmes(full, depth + 1, out);
    else if (/^readme\.md$/i.test(name) && depth >= 3) out.push(full);
  }
  return out;
}

function parseMetadata(raw: string): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(META_RE);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return meta;
}

function extractTitle(raw: string): string | undefined {
  for (const line of raw.split("\n")) {
    const m = line.match(/^#\s+(?:\[([^\]]+)\]\([^)]*\)|(.+?))\s*$/);
    if (m) return (m[1] ?? m[2]).trim();
  }
  return undefined;
}

const list = (v?: string) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

let dateCache: Map<string, string> | null = null;
function commitDates(): Map<string, string> {
  if (dateCache) return dateCache;
  const map = new Map<string, string>();
  try {
    const out = execFileSync(
      "git",
      ["log", "--format=__C__%cI", "--name-only", "--", "*.md"],
      { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 }
    ).toString();
    let date = "";
    for (const line of out.split("\n")) {
      if (line.startsWith("__C__")) date = line.slice(5);
      else if (line && date && !map.has(line)) map.set(line, date);
    }
  } catch {
    // not a git checkout — dates stay undefined
  }
  dateCache = map;
  return map;
}

let cache: Writeup[] | null = null;

export function getAllWriteups(): Writeup[] {
  if (cache) return cache;
  const dates = commitDates();
  const writeups: Writeup[] = [];
  for (const file of findReadmes(REPO_ROOT, 0)) {
    const rel = relative(REPO_ROOT, file);
    const segments = rel.split(sep);
    segments.pop(); // drop readme.md
    const [ctf = "", category = "", problem = "", ...rest] = segments;
    const author = rest.join("/") || "unknown";
    const raw = readFileSync(file, "utf8");
    const meta = parseMetadata(raw);
    writeups.push({
      parts: segments,
      ctf,
      category: meta.type || category,
      problem,
      author,
      title: extractTitle(raw) || problem,
      tags: list(meta.tags),
      tools: list(meta.tools),
      techniques: list(meta.techniques),
      file,
      relDir: segments.join("/"),
      updated: dates.get(rel),
    });
  }
  writeups.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
  cache = writeups;
  return writeups;
}

export const writeupUrl = (w: Writeup) =>
  "/writeups/" + w.parts.map(encodeURIComponent).join("/") + "/";

const count = (ws: Writeup[], key: (w: Writeup) => string[]) => {
  const m = new Map<string, number>();
  for (const w of ws) for (const k of key(w)) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export const getTags = (ws = getAllWriteups()) => count(ws, (w) => w.tags);
export const getAuthors = (ws = getAllWriteups()) => count(ws, (w) => [w.author]);
export const getCategories = (ws = getAllWriteups()) =>
  count(ws, (w) => [w.category]);
export const getCtfs = (ws = getAllWriteups()) => count(ws, (w) => [w.ctf]);
