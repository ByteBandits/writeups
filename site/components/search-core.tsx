"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routePath, siteUrl } from "@/lib/url";
import { scoreToken } from "@/lib/fuzzy";

export interface SearchResult {
  /** route path — use with <Link>/router, never a raw <a> */
  url: string;
  title: string;
  excerpt: string;
  filters: Record<string, string[]>;
}

/** a filter value auto-corrected to its single best entity match */
export interface FilterCorrection {
  key: string;
  from: string;
  to: string;
}

/** a filter value with no unique match — searched verbatim (honest 0 results) */
export interface UnresolvedFilter {
  key: string;
  value: string;
  candidates: string[];
}

type Status = "idle" | "ready" | "unavailable";

let pfPromise: Promise<any> | null = null;

export function loadPagefind(): Promise<any> {
  if (!pfPromise) {
    pfPromise = import(/* webpackIgnore: true */ siteUrl("/pagefind/pagefind.js")).then(
      (pf: any) => pf.init().then(() => pf)
    );
  }
  return pfPromise;
}

type Filters = Record<string, Record<string, number>>;
let filtersPromise: Promise<Filters> | null = null;

/** filter universe, key -> (canonical value -> page count); shared by search + entity suggestions */
export function getFilters(): Promise<Filters> {
  if (!filtersPromise) {
    filtersPromise = loadPagefind().then(async (pf) => ((await pf.filters()) ?? {}) as Filters);
  }
  return filtersPromise;
}

const AUTO_CORRECT_MIN = 0.7;

function resolveFilters(filters: Record<string, string[]>, universe: Filters) {
  const out: Record<string, string[]> = {};
  const corrections: FilterCorrection[] = [];
  const unresolved: UnresolvedFilter[] = [];
  for (const [key, values] of Object.entries(filters)) {
    const names = Object.keys(universe[key] ?? {});
    for (const v of values) {
      const lv = v.toLowerCase();
      const exact = names.find((n) => n.toLowerCase() === lv);
      if (exact) {
        (out[key] ??= []).push(exact);
        continue;
      }
      const ranked = names
        .map((name) => ({ name, s: scoreToken(lv, name.toLowerCase()) }))
        .filter((c) => c.s > 0)
        .sort((a, b) => b.s - a.s);
      const [best, second] = ranked;
      // auto-correct only an unambiguous strong match; ties (e.g. a short prefix) ask instead
      if (best && best.s >= AUTO_CORRECT_MIN && (!second || second.s < best.s)) {
        (out[key] ??= []).push(best.name);
        corrections.push({ key, from: v, to: best.name });
      } else {
        // never drop an unknown value — that would silently widen the search to everything
        (out[key] ??= []).push(v);
        unresolved.push({ key, value: v, candidates: ranked.slice(0, 3).map((c) => c.name) });
      }
    }
  }
  return { filters: out, corrections, unresolved };
}

export const FILTER_KEYS = ["tag", "author", "ctf", "category", "tool", "technique"] as const;
const FILTER_TOKEN = new RegExp(`^(${FILTER_KEYS.join("|")}):(\\S*)$`, "i");

export function parseQuery(q: string): { term: string; filters: Record<string, string[]> } {
  const filters: Record<string, string[]> = {};
  const rest: string[] = [];
  for (const tok of q.split(/\s+/)) {
    const m = tok.match(FILTER_TOKEN);
    if (m) {
      // "author:" with no value yet is a filter being typed — not a search word
      if (m[2]) (filters[m[1].toLowerCase()] ??= []).push(m[2]);
    } else if (tok) rest.push(tok);
  }
  return { term: rest.join(" "), filters };
}

/** swap one filter token's value, case-insensitively on the key */
export function replaceFilter(q: string, key: string, from: string, to: string): string {
  const esc = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return q.replace(new RegExp(`(^|\\s)${key}:${esc}(?=\\s|$)`, "i"), `$1${key}:${to}`);
}

export function usePagefind(query: string, limit = 8) {
  const [status, setStatus] = useState<Status>("idle");
  const [state, setState] = useState({
    for: "",
    results: [] as SearchResult[],
    total: 0,
    corrections: [] as FilterCorrection[],
    unresolved: [] as UnresolvedFilter[],
  });
  const seq = useRef(0);

  useEffect(() => {
    loadPagefind()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("unavailable"));
  }, []);

  useEffect(() => {
    const { term, filters } = parseQuery(query);
    const empty = { for: query, results: [], total: 0, corrections: [], unresolved: [] };
    if (!term && Object.keys(filters).length === 0) {
      setState(empty);
      return;
    }
    if (status !== "ready") return;
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const pf = await loadPagefind();
        const resolved = resolveFilters(filters, await getFilters());
        const out = await pf.search(term || null, { filters: resolved.filters });
        const top = await Promise.all(out.results.slice(0, limit).map((r: any) => r.data()));
        if (seq.current !== id) return;
        setState({
          for: query,
          total: out.results.length,
          corrections: resolved.corrections,
          unresolved: resolved.unresolved,
          results: top.map((d: any) => ({
            url: routePath(d.url),
            title: d.meta?.title || d.url,
            excerpt: d.excerpt,
            filters: d.filters ?? {},
          })),
        });
      } catch {
        if (seq.current === id) setState(empty);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query, status, limit]);

  return { ...state, status, settled: state.for === query };
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
    <Link className={`result${selected ? " sel" : ""}`} href={r.url} prefetch={false} onClick={onClick}>
      <div className="rtitle">{r.title}</div>
      <div className="rexcerpt" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
      {chips.length > 0 && (
        <div className="rmeta">
          {chips.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
