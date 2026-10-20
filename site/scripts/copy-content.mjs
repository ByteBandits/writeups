// Copies the writeup content tree (repo root) into public/content so the
// static export can serve images, scripts and attachments next to the pages.
import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const dest = resolve(import.meta.dirname, "..", "public", "content");

const SKIP = new Set([".git", "site", "node_modules"]);

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

for (const entry of readdirSync(repoRoot)) {
  if (SKIP.has(entry) || entry.startsWith(".")) continue;
  const src = join(repoRoot, entry);
  if (!statSync(src).isDirectory()) continue;
  cpSync(src, join(dest, entry), { recursive: true });
}

console.log(`content copied -> public/content`);
