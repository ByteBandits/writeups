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

/** filterKey -> (lowercase value -> canonical value), for case-insensitive filters */
let filterUniverse: Record<string, Record<string, string>> | null = null;

async function getFilterUniverse(pf: any) {
  if (!filterUniverse) {
    const raw = await pf.filters();
    filterUniverse = {};
    for (const [key, values] of Object.entries(raw ?? {})) {
      const map: Record<string, string> = {};
      for (const v of Object.keys(values as object)) map[v.toLowerCase()] = v;
      filterUniverse[key] = map;
    }
  }
  return filterUniverse;
}

function normalizeFilters(
  filters: Record<string, string[]>,
  universe: Record<string, Record<string, string>>
) {
  const out: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(filters)) {
    const map = universe[key] ?? {};
    const mapped = values
      .map((v) => map[v.toLowerCase()])
      .filter((v): v is string => !!v);
    if (mapped.length) out[key] = mapped;
  }
  return out;
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
  const [total, setTotal] = useState(0);
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
      setTotal(0);
      return;
    }
    if (status !== "ready") return;
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const pf = await loadPagefind();
        const universe = await getFilterUniverse(pf);
        const out = await pf.search(term || null, {
          filters: normalizeFilters(filters, universe),
        });
        const top = await Promise.all(
          out.results.slice(0, limit).map((r: any) => r.data())
        );
        if (seq.current !== id) return;
        setTotal(out.results.length);
        setResults(
          top.map((d: any) => ({
            url: d.url,
            title: d.meta?.title || d.url,
            excerpt: d.excerpt,
            filters: d.filters ?? {},
          }))
        );
      } catch {
        if (seq.current === id) {
          setResults([]);
          setTotal(0);
        }
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query, status, limit]);

  return { results, total, status };
}

// "/" — the universal search key (github/google/youtube convention).
// Cmd+K (mac) and Ctrl+K (windows/linux) also work, unlabeled.
export function KbdK() {
  return <kbd>/</kbd>;
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
