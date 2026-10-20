"use client";

import { useMemo, useState } from "react";
import { CATEGORY_COLORS } from "@/lib/categories";

export interface BrowseItem {
  title: string;
  url: string;
  ctf: string;
  category: string;
  author: string;
  updated?: string;
}

const FALLBACK_COLOR = "#8b949e";

export function BrowseGrid({ writeups }: { writeups: BrowseItem[] }) {
  const [type, setType] = useState("");
  const [ctf, setCtf] = useState("");
  const [author, setAuthor] = useState("");

  const options = useMemo(() => {
    const collect = (key: keyof Pick<BrowseItem, "category" | "ctf" | "author">) => {
      const m = new Map<string, number>();
      for (const w of writeups) m.set(w[key], (m.get(w[key]) ?? 0) + 1);
      return [...m.entries()].sort((a, b) =>
        key === "category" ? b[1] - a[1] : a[0].localeCompare(b[0])
      );
    };
    return { types: collect("category"), ctfs: collect("ctf"), authors: collect("author") };
  }, [writeups]);

  const filtered = writeups.filter(
    (w) =>
      (!type || w.category === type) &&
      (!ctf || w.ctf === ctf) &&
      (!author || w.author === author)
  );

  return (
    <>
      <div className="filters">
        <label>
          type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">all</option>
            {options.types.map(([v, n]) => (
              <option key={v} value={v}>
                {v} ({n})
              </option>
            ))}
          </select>
        </label>
        <label>
          ctf
          <select value={ctf} onChange={(e) => setCtf(e.target.value)}>
            <option value="">all</option>
            {options.ctfs.map(([v, n]) => (
              <option key={v} value={v}>
                {v} ({n})
              </option>
            ))}
          </select>
        </label>
        <label>
          author
          <select value={author} onChange={(e) => setAuthor(e.target.value)}>
            <option value="">all</option>
            {options.authors.map(([v, n]) => (
              <option key={v} value={v}>
                {v} ({n})
              </option>
            ))}
          </select>
        </label>
        <span className="filters-count">
          {filtered.length} / {writeups.length}
        </span>
      </div>

      <div className="cardgrid">
        {filtered.map((w) => {
          const color = CATEGORY_COLORS[w.category] ?? FALLBACK_COLOR;
          return (
            <a
              className="wcard"
              key={w.url}
              href={w.url}
              style={{ borderLeftColor: color }}
            >
              <div className="wcard-title">{w.title}</div>
              <div className="wcard-cat" style={{ color }}>
                {w.category}
              </div>
              <div className="wcard-meta">{w.ctf}</div>
              <div className="wcard-meta author">{w.author}</div>
            </a>
          );
        })}
      </div>
    </>
  );
}
