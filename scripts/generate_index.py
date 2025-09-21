#!/usr/bin/env python3
"""Generate an index of markdown writeups for the frontend."""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List

import frontmatter

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

    metadata = post.metadata or {}

    ctf, category, problem_guess = derive_metadata_from_path(md_path)

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
    for value in values:
        if value is None:
            continue
        sanitized.append(str(value))
    return sanitized or None


def copy_asset(file_path: Path) -> None:
    rel_path = file_path.relative_to(ROOT)
    target_path = OUTPUT_DIR / rel_path.as_posix()
    target_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file_path, target_path)


if __name__ == "__main__":
    main()
