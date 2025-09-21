#!/usr/bin/env python3
"""Generate an index of markdown writeups for the frontend."""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List

try:
    import frontmatter
except ModuleNotFoundError as exc:  # pragma: no cover - defensive
    sys.exit(
        "Missing dependency 'python-frontmatter'. Install it with 'pip install python-frontmatter'."
    )

ROOT = Path(__file__).resolve().parent.parent
WRITEUPS_DIR = ROOT / "writeups"
OUTPUT_DIR = ROOT / "ui" / "public"
OUTPUT_FILE = OUTPUT_DIR / "writeups.json"
COPIED_ROOT = OUTPUT_DIR / "writeups"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"}
CODE_EXTS = {
    ".py",
    ".c",
    ".cc",
    ".cpp",
    ".h",
    ".hpp",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".java",
    ".rb",
    ".go",
    ".php",
    ".rs",
    ".swift",
    ".kt",
    ".sh",
    ".bash",
    ".ps1",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".txt",
    ".md",
    ".sql",
    ".lua",
}
PDF_EXTS = {".pdf"}
HTML_EXTS = {".html", ".htm"}

LEGACY_META_PATTERN = re.compile(r"^\s*\[\]\(([^=()]+)=(.*)\)\s*$")
LIST_FIELDS = {"tags", "files", "tools", "techniques"}
MAX_CONTENT_CHARS = 20000
SUMMARY_PREVIEW_CHARS = 240


def main() -> None:
    if not WRITEUPS_DIR.exists():
        sys.exit(f"Writeups directory not found: {WRITEUPS_DIR}")

    if COPIED_ROOT.exists():
        shutil.rmtree(COPIED_ROOT)

    entries: List[Dict[str, Any]] = []
    for md_path in sorted(WRITEUPS_DIR.rglob("*.md")):
        if md_path.name.startswith("."):
            continue
        entry = process_markdown(md_path)
        if entry:
            entries.append(entry)

    entries.sort(key=lambda item: (
        (item.get("ctf") or "").lower(),
        (item.get("category") or "").lower(),
        (item.get("problem") or "").lower(),
    ))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(entries, indent=2, sort_keys=False), encoding="utf-8")
    print(f"Discovered {len(entries)} writeup(s). Index written to {OUTPUT_FILE.relative_to(ROOT)}")


def process_markdown(md_path: Path) -> Dict[str, Any] | None:
    rel_md_path = md_path.relative_to(ROOT).as_posix()
    try:
        post = frontmatter.load(md_path)
    except Exception as exc:  # pragma: no cover - defensive
        print(f"Failed to parse frontmatter for {rel_md_path}: {exc}", file=sys.stderr)
        return None

    frontmatter_metadata = post.metadata or {}
    legacy_raw = parse_legacy_metadata(md_path)
    legacy_metadata = convert_legacy_metadata(legacy_raw)
    metadata = merge_metadata(frontmatter_metadata, legacy_metadata)

    ctf, category, problem_guess = derive_metadata_from_path(md_path)

    body_text = str(post.content or "")

    entry: Dict[str, Any] = {
        "path": rel_md_path,
        "ctf": metadata.get("ctf") or ctf,
        "category": metadata.get("category") or category,
        "problem": metadata.get("problem") or metadata.get("title") or problem_guess,
        "author": normalize_author(metadata.get("author") or metadata.get("authors")),
        "date": metadata.get("date"),
        "tags": sanitize_string_list(normalize_list(metadata.get("tags"))),
        "difficulty": metadata.get("difficulty"),
        "points": metadata.get("points"),
        "files": sanitize_string_list(normalize_list(metadata.get("files"))),
        "tools": sanitize_string_list(normalize_list(metadata.get("tools"))),
        "techniques": sanitize_string_list(normalize_list(metadata.get("techniques"))),
        "summary": extract_summary(body_text, metadata),
        "contentText": prepare_content_text(body_text),
    }

    if not entry["author"]:
        entry["author"] = normalize_author(metadata.get("team")) or "unknown"

    if entry["date"] is not None:
        entry["date"] = str(entry["date"])

    if isinstance(entry["points"], (int, float)):
        entry["points"] = int(entry["points"])
    elif isinstance(entry["points"], str):
        try:
            entry["points"] = int(entry["points"].strip())
        except ValueError:
            pass

    attachments = discover_attachments(md_path)
    if attachments:
        entry["attachments"] = attachments

    if not entry["summary"]:
        entry["summary"] = entry["problem"] or rel_md_path

    copy_asset(md_path)

    return entry


def derive_metadata_from_path(md_path: Path) -> tuple[str | None, str | None, str]:
    try:
        relative_parts = md_path.relative_to(WRITEUPS_DIR).parts
    except ValueError:
        relative_parts = md_path.parts

    ctf = relative_parts[0] if len(relative_parts) >= 1 else None
    category = relative_parts[1] if len(relative_parts) >= 2 else None
    problem = md_path.stem
    return ctf, category, problem


def normalize_list(value: Any) -> List[Any] | None:
    if value is None:
        return None
    if isinstance(value, (list, tuple)):
        return list(value)
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return [value]


def parse_legacy_metadata(md_path: Path) -> Dict[str, str]:
    metadata: Dict[str, str] = {}
    try:
        text = md_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = md_path.read_text(encoding="utf-8", errors="ignore")

    started = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        match = LEGACY_META_PATTERN.match(stripped)
        if match:
            started = True
            key = match.group(1).strip().lower()
            value = match.group(2).strip()
            if key and value:
                metadata[key] = value
            continue

        if not started:
            break
        break

    return metadata


def convert_legacy_metadata(raw: Dict[str, str]) -> Dict[str, Any]:
    metadata: Dict[str, Any] = {}
    for key, value in raw.items():
        if not value:
            continue
        if key == "ctf":
            metadata["ctf"] = value
        elif key in {"type", "category"}:
            type_values = split_metadata_values(value)
            if type_values:
                metadata["category"] = type_values[0]
                extra_types = type_values[1:]
                if extra_types:
                    metadata.setdefault("tags", [])
                    metadata["tags"].extend(extra_types)
        elif key == "tags":
            metadata["tags"] = split_metadata_values(value)
        elif key == "files":
            metadata["files"] = split_metadata_values(value)
        elif key in {"tools", "techniques"}:
            metadata[key] = split_metadata_values(value)
        elif key in {"author", "authors"}:
            metadata["author"] = value
        elif key == "points":
            metadata["points"] = value
        elif key == "difficulty":
            metadata["difficulty"] = value
        elif key == "problem":
            metadata["problem"] = value
        elif key == "date":
            metadata["date"] = value
    return metadata


def split_metadata_values(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def merge_metadata(primary: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    merged: Dict[str, Any] = dict(primary)
    for key, value in override.items():
        if key in LIST_FIELDS:
            base_values = normalize_list(merged.get(key)) or []
            override_values = normalize_list(value) or []
            merged[key] = dedupe_preserve_order([*base_values, *override_values])
        else:
            merged[key] = value
    return merged


def dedupe_preserve_order(values: Iterable[Any]) -> List[Any]:
    seen: set[str] = set()
    result: List[Any] = []
    for value in values:
        key = str(value)
        if key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def discover_attachments(md_path: Path) -> List[Dict[str, Any]]:
    attachments: List[Dict[str, Any]] = []
    base_dir = md_path.parent
    candidate_dirs = [base_dir / f"{md_path.stem}_files", base_dir / md_path.stem]

    seen = set()
    for directory in candidate_dirs:
        if not directory.exists() or not directory.is_dir():
            continue
        for file_path in sorted(directory.rglob("*")):
            if not file_path.is_file():
                continue
            if file_path in seen:
                continue
            seen.add(file_path)
            attachments.append(describe_attachment(file_path))
            copy_asset(file_path)
    return attachments


def describe_attachment(file_path: Path) -> Dict[str, Any]:
    rel_path = file_path.relative_to(ROOT).as_posix()
    file_type = infer_type(file_path)
    size = file_path.stat().st_size
    return {
        "name": file_path.name,
        "path": rel_path,
        "size": size,
        "type": file_type,
    }


def infer_type(file_path: Path) -> str:
    ext = file_path.suffix.lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext in PDF_EXTS:
        return "pdf"
    if ext in HTML_EXTS:
        return "html"
    if ext in CODE_EXTS:
        return "code"
    return "binary"


def normalize_author(author_value: Any) -> str | None:
    if author_value is None:
        return None
    if isinstance(author_value, str):
        return author_value
    if isinstance(author_value, (list, tuple)):
        return ", ".join(str(item) for item in author_value)
    return str(author_value)


def sanitize_string_list(values: List[Any] | None) -> List[str] | None:
    if not values:
        return None
    sanitized: List[str] = []
    seen: set[str] = set()
    for value in values:
        if value is None:
            continue
        text = str(value)
        if text in seen:
            continue
        seen.add(text)
        sanitized.append(text)
    return sanitized or None


def copy_asset(file_path: Path) -> None:
    rel_path = file_path.relative_to(ROOT)
    target_path = OUTPUT_DIR / rel_path.as_posix()
    target_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file_path, target_path)


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def truncate_text(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    truncated = text[:limit]
    last_space = truncated.rfind(" ")
    if last_space > limit * 0.6:
        truncated = truncated[:last_space]
    return truncated.rstrip() + "…"


def prepare_content_text(body_text: str) -> str | None:
    if not body_text:
        return None
    cleaned_lines = [
        line for line in body_text.splitlines() if not LEGACY_META_PATTERN.match(line.strip())
    ]
    cleaned_text = "\n".join(cleaned_lines)
    cleaned_text = re.sub(r"^\s*#+\s*", "", cleaned_text, flags=re.MULTILINE)
    normalized = collapse_whitespace(cleaned_text)
    if not normalized:
        return None
    return truncate_text(normalized, MAX_CONTENT_CHARS)


def extract_summary(body_text: str, metadata: Dict[str, Any]) -> str | None:
    for key in ("summary", "description"):
        value = metadata.get(key)
        if value:
            return str(value)

    for line in body_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if LEGACY_META_PATTERN.match(stripped):
            continue
        if stripped.startswith("#"):
            heading = stripped.lstrip("# ").strip()
            if heading:
                return truncate_text(heading, SUMMARY_PREVIEW_CHARS)
            continue
        return truncate_text(collapse_whitespace(stripped), SUMMARY_PREVIEW_CHARS)

    fallback = metadata.get("problem") or metadata.get("title")
    if fallback:
        return str(fallback)
    return None


if __name__ == "__main__":
    main()
