#!/usr/bin/env node
/**
 * Generate an index of markdown writeups for the frontend using Node.js.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WRITEUPS_DIR = path.join(ROOT, 'writeups');
const OUTPUT_DIR = path.join(ROOT, 'ui', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'writeups.json');
const COPIED_ROOT = path.join(OUTPUT_DIR, 'writeups');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp']);
const CODE_EXTS = new Set([
  '.py',
  '.c',
  '.cc',
  '.cpp',
  '.h',
  '.hpp',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.java',
  '.rb',
  '.go',
  '.php',
  '.rs',
  '.swift',
  '.kt',
  '.sh',
  '.bash',
  '.ps1',
  '.json',
  '.yml',
  '.yaml',
  '.toml',
  '.ini',
  '.txt',
  '.md',
  '.sql',
  '.lua',
]);
const PDF_EXTS = new Set(['.pdf']);
const HTML_EXTS = new Set(['.html', '.htm']);

const LEGACY_META_PATTERN = /^\s*\[\]\(([^=()]+)=(.*)\)\s*$/;
const LIST_FIELDS = new Set(['tags', 'files', 'tools', 'techniques']);
const MAX_CONTENT_CHARS = 20_000;
const SUMMARY_PREVIEW_CHARS = 240;

const requireFromUi = createRequire(new URL('../ui/package.json', import.meta.url));
let matter;
try {
  matter = requireFromUi('gray-matter');
} catch (error) {
  console.error(
    "Missing dependency 'gray-matter'. Install it by running 'cd ui && npm install'.",
  );
  process.exit(1);
}

async function main() {
  if (!(await exists(WRITEUPS_DIR))) {
    console.error(`Writeups directory not found: ${WRITEUPS_DIR}`);
    process.exit(1);
  }

  await fs.rm(COPIED_ROOT, { recursive: true, force: true });

  const markdownFiles = await collectMarkdownFiles(WRITEUPS_DIR);
  const entries = [];

  for (const mdPath of markdownFiles) {
    if (path.basename(mdPath).startsWith('.')) {
      continue;
    }
    const entry = await processMarkdown(mdPath);
    if (entry) {
      entries.push(entry);
    }
  }

  entries.sort((a, b) => {
    return (
      compareNormalized(a.ctf, b.ctf) ||
      compareNormalized(a.category, b.category) ||
      compareNormalized(a.problem, b.problem)
    );
  });

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(entries, null, 2), 'utf8');
  const relativeOutput = path.relative(ROOT, OUTPUT_FILE) || OUTPUT_FILE;
  console.log(`Discovered ${entries.length} writeup(s). Index written to ${relativeOutput}`);
}

async function processMarkdown(mdPath) {
  const relMdPath = toPosixPath(path.relative(ROOT, mdPath));
  let fileContent;
  try {
    fileContent = await fs.readFile(mdPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read ${relMdPath}: ${error.message}`);
    return null;
  }

  let parsed;
  try {
    parsed = matter(fileContent);
  } catch (error) {
    console.error(`Failed to parse frontmatter for ${relMdPath}: ${error.message}`);
    return null;
  }

  const frontmatterMetadata = parsed.data ?? {};
  const legacyRaw = parseLegacyMetadata(fileContent);
  const legacyMetadata = convertLegacyMetadata(legacyRaw);
  const metadata = mergeMetadata(frontmatterMetadata, legacyMetadata);

  const [ctfGuess, categoryGuess, problemGuess] = deriveMetadataFromPath(mdPath);
  const bodyText = typeof parsed.content === 'string' ? parsed.content : '';

  const entry = {
    path: relMdPath,
    ctf: metadata.ctf ?? ctfGuess ?? null,
    category: metadata.category ?? categoryGuess ?? null,
    problem: metadata.problem ?? metadata.title ?? problemGuess ?? relMdPath,
    author: normalizeAuthor(metadata.author ?? metadata.authors),
    date: metadata.date != null ? String(metadata.date) : null,
    tags: sanitizeStringList(normalizeList(metadata.tags)),
    difficulty: metadata.difficulty ?? null,
    points: normalizePoints(metadata.points),
    files: sanitizeStringList(normalizeList(metadata.files)),
    tools: sanitizeStringList(normalizeList(metadata.tools)),
    techniques: sanitizeStringList(normalizeList(metadata.techniques)),
    summary: extractSummary(bodyText, metadata),
    contentText: prepareContentText(bodyText),
  };

  if (!entry.author) {
    entry.author = normalizeAuthor(metadata.team) ?? 'unknown';
  }

  const attachments = await discoverAttachments(mdPath);
  if (attachments.length > 0) {
    entry.attachments = attachments;
  }

  if (!entry.summary) {
    entry.summary = entry.problem || relMdPath;
  }

  await copyAsset(mdPath);

  return entry;
}

async function discoverAttachments(mdPath) {
  const attachments = [];
  const baseDir = path.dirname(mdPath);
  const stem = path.basename(mdPath, path.extname(mdPath));
  const candidateDirs = [
    path.join(baseDir, `${stem}_files`),
    path.join(baseDir, stem),
  ];
  const seen = new Set();

  for (const directory of candidateDirs) {
    if (!(await exists(directory))) {
      continue;
    }
    const stats = await fs.stat(directory);
    if (!stats.isDirectory()) {
      continue;
    }
    const files = await collectFiles(directory);
    for (const filePath of files) {
      const relPath = toPosixPath(path.relative(ROOT, filePath));
      if (seen.has(relPath)) {
        continue;
      }
      seen.add(relPath);
      const attachment = await describeAttachment(filePath);
      attachments.push(attachment);
      await copyAsset(filePath);
    }
  }

  return attachments;
}

async function describeAttachment(filePath) {
  const relPath = toPosixPath(path.relative(ROOT, filePath));
  const stat = await fs.stat(filePath);
  return {
    name: path.basename(filePath),
    path: relPath,
    size: stat.size,
    type: inferType(filePath),
  };
}

function inferType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (PDF_EXTS.has(ext)) return 'pdf';
  if (HTML_EXTS.has(ext)) return 'html';
  if (CODE_EXTS.has(ext)) return 'code';
  return 'binary';
}

async function copyAsset(filePath) {
  const relPath = toPosixPath(path.relative(ROOT, filePath));
  const targetPath = path.join(OUTPUT_DIR, relPath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(filePath, targetPath);
}

async function collectMarkdownFiles(dir) {
  const result = [];
  const entries = await readDirSafe(dir);
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectMarkdownFiles(fullPath);
      result.push(...nested);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      result.push(fullPath);
    }
  }
  result.sort((a, b) => toPosixPath(path.relative(dir, a)).localeCompare(toPosixPath(path.relative(dir, b))));
  return result;
}

async function collectFiles(dir) {
  const result = [];
  const entries = await readDirSafe(dir);
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectFiles(fullPath);
      result.push(...nested);
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  result.sort((a, b) => toPosixPath(path.relative(dir, a)).localeCompare(toPosixPath(path.relative(dir, b))));
  return result;
}

async function readDirSafe(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`Failed to read directory ${dir}: ${error.message}`);
    return [];
  }
}

function parseLegacyMetadata(text) {
  const metadata = {};
  const lines = text.split(/\r?\n/);
  let started = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const match = LEGACY_META_PATTERN.exec(trimmed);
    if (match) {
      started = true;
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      if (key && value) {
        metadata[key] = value;
      }
      continue;
    }
    if (!started) {
      break;
    }
    break;
  }
  return metadata;
}

function convertLegacyMetadata(raw) {
  const metadata = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!value) continue;
    switch (key) {
      case 'ctf':
        metadata.ctf = value;
        break;
      case 'type':
      case 'category': {
        const typeValues = splitMetadataValues(value);
        if (typeValues.length > 0) {
          metadata.category = typeValues[0];
          const extra = typeValues.slice(1);
          if (extra.length > 0) {
            metadata.tags = [...(metadata.tags ?? []), ...extra];
          }
        }
        break;
      }
      case 'tags':
        metadata.tags = splitMetadataValues(value);
        break;
      case 'files':
        metadata.files = splitMetadataValues(value);
        break;
      case 'tools':
      case 'techniques':
        metadata[key] = splitMetadataValues(value);
        break;
      case 'author':
      case 'authors':
        metadata.author = value;
        break;
      case 'points':
        metadata.points = value;
        break;
      case 'difficulty':
        metadata.difficulty = value;
        break;
      case 'problem':
        metadata.problem = value;
        break;
      case 'date':
        metadata.date = value;
        break;
      default:
        break;
    }
  }
  return metadata;
}

function splitMetadataValues(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function mergeMetadata(primary = {}, override = {}) {
  const merged = { ...primary };
  for (const [key, value] of Object.entries(override)) {
    if (LIST_FIELDS.has(key)) {
      const baseValues = normalizeList(merged[key]) ?? [];
      const overrideValues = normalizeList(value) ?? [];
      merged[key] = dedupePreserveOrder([...baseValues, ...overrideValues]);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function dedupePreserveOrder(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = String(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function normalizeList(value) {
  if (value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => (Array.isArray(item) ? item : item));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [value];
}

function sanitizeStringList(values) {
  if (!values || values.length === 0) {
    return null;
  }
  const seen = new Set();
  const sanitized = [];
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    sanitized.push(text);
  }
  return sanitized.length > 0 ? sanitized : null;
}

function normalizeAuthor(authorValue) {
  if (authorValue == null) {
    return null;
  }
  if (Array.isArray(authorValue)) {
    return authorValue.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }
  return String(authorValue).trim() || null;
}

function normalizePoints(points) {
  if (points == null) {
    return null;
  }
  if (typeof points === 'number' && Number.isFinite(points)) {
    return Math.trunc(points);
  }
  const parsed = parseInt(String(points).trim(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function prepareContentText(bodyText) {
  if (!bodyText) {
    return null;
  }
  const cleanedLines = bodyText
    .split(/\r?\n/)
    .filter((line) => !LEGACY_META_PATTERN.test(line.trim()));
  const cleanedText = cleanedLines.join('\n').replace(/^\s*#+\s*/gm, '');
  const normalized = collapseWhitespace(cleanedText);
  if (!normalized) {
    return null;
  }
  return truncateText(normalized, MAX_CONTENT_CHARS);
}

function extractSummary(bodyText, metadata = {}) {
  for (const key of ['summary', 'description']) {
    if (metadata[key]) {
      return String(metadata[key]);
    }
  }
  const lines = bodyText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    if (LEGACY_META_PATTERN.test(trimmed)) {
      continue;
    }
    if (trimmed.startsWith('#')) {
      const heading = trimmed.replace(/^#+\s*/, '').trim();
      if (heading) {
        return truncateText(heading, SUMMARY_PREVIEW_CHARS);
      }
      continue;
    }
    return truncateText(collapseWhitespace(trimmed), SUMMARY_PREVIEW_CHARS);
  }
  const fallback = metadata.problem ?? metadata.title;
  return fallback ? String(fallback) : null;
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function truncateText(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > limit * 0.6) {
    return `${truncated.slice(0, lastSpace)}…`;
  }
  return `${truncated}…`;
}

function deriveMetadataFromPath(mdPath) {
  let relativeParts;
  const relativeToWriteups = path.relative(WRITEUPS_DIR, mdPath);
  if (!relativeToWriteups.startsWith('..')) {
    relativeParts = relativeToWriteups.split(path.sep);
  } else {
    relativeParts = path.relative(ROOT, mdPath).split(path.sep);
  }
  const ctf = relativeParts[0] || null;
  const category = relativeParts[1] || null;
  const problem = path.basename(mdPath, path.extname(mdPath));
  return [ctf, category, problem];
}

function compareNormalized(a, b) {
  const left = a ? String(a).toLowerCase() : '';
  const right = b ? String(b).toLowerCase() : '';
  return left.localeCompare(right);
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

await main();
