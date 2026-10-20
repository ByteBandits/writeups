"use client";

import { useEffect, useRef, useState } from "react";

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  filters: Record<string, string[]>;
}

type Status = "idle" | "loading" | "ready" | "unavailable";

let pfPromise: Promise<any> | null = null;

const PF_URL = "/pagefind/pagefind.js";

function loadPagefind(): Promise<any> {
  if (!pfPromise) {
    pfPromise = import(/* webpackIgnore: true */ PF_URL).then((pf: any) =>
      pf.init().then(() => pf)
    );
  }
  return pfPromise;
}

const FILTER_KEYS = new Set(["tag", "author", "ctf", "category", "tool", "technique"]);

export function parseQuery(q: string): {
  term: string;
  filters: Record<string, string[]>;
} {
  const filters: Record<string, string[]> = {};
  const rest: string[] = [];
  for (const tok of q.split(/\s+/)) {
    const m = tok.match(/^(tag|author|ctf|category|tool|technique):(.+)$/i);
    if (m && FILTER_KEYS.has(m[1].toLowerCase())) {
      const key = m[1].toLowerCase();
      (filters[key] ??= []).push(m[2]);
    } else if (tok) rest.push(tok);
  }
  return { term: rest.join(" "), filters };
}

export function usePagefind(query: string, limit = 8) {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    loadPagefind()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("unavailable"));
  }, []);

  useEffect(() => {
    const { term, filters } = parseQuery(query);
    if (!term && Object.keys(filters).length === 0) {
      setResults([]);
      return;
    }
    if (status !== "ready") return;
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const pf = await loadPagefind();
        const out = await pf.search(term || null, { filters });
        const top = await Promise.all(
          out.results.slice(0, limit).map((r: any) => r.data())
        );
        if (seq.current !== id) return;
        setResults(
          top.map((d: any) => ({
            url: d.url,
            title: d.meta?.title || d.url,
            excerpt: d.excerpt,
            filters: d.filters ?? {},
          }))
        );
      } catch {
        if (seq.current === id) setResults([]);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query, status, limit]);

  return { results, status };
}

export function ResultCard({
  r,
  selected,
  onClick,
}: {
  r: SearchResult;
  selected?: boolean;
  onClick?: () => void;
}) {
  const chips = [
    r.filters.ctf?.[0],
    r.filters.category?.[0],
    r.filters.author?.[0],
    ...(r.filters.tag ?? []).slice(0, 2),
  ].filter(Boolean);
  return (
    <a
      className={`result${selected ? " sel" : ""}`}
      href={r.url}
      onClick={onClick}
    >
      <div className="rtitle">{r.title}</div>
      <div
        className="rexcerpt"
        dangerouslySetInnerHTML={{ __html: r.excerpt }}
      />
      {chips.length > 0 && (
        <div className="rmeta">
          {chips.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      )}
    </a>
  );
}
