"use client";

import { useEffect, useState } from "react";

export interface Entity {
  kind: "author" | "tag" | "ctf" | "category" | "tool" | "technique";
  name: string;
  count: number;
}

const KIND_ORDER: Record<Entity["kind"], number> = {
  author: 0,
  tag: 1,
  ctf: 2,
  category: 3,
  tool: 4,
  technique: 5,
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const entityUrl = (e: Entity) =>
  e.kind === "tool" || e.kind === "technique"
    ? `${BASE}/search/?q=${encodeURIComponent(`${e.kind}:${e.name}`)}`
    : `${BASE}/${{ author: "authors", tag: "tags", ctf: "ctfs", category: "categories" }[e.kind]}/${encodeURIComponent(e.name)}/`;

function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

const isSubsequence = (t: string, e: string) => {
  let i = 0;
  for (const ch of e) if (ch === t[i]) i++;
  return i === t.length;
};

function scoreToken(t: string, e: string): number {
  if (e === t) return 1.0;
  if (e.startsWith(t)) return 0.9;
  if (e.includes(t)) return 0.8;
  if (lev(t, e) <= Math.max(1, Math.floor(e.length / 4))) return 0.7;
  if (t.length >= 3 && isSubsequence(t, e)) return 0.5;
  return 0;
}

export function matchEntities(term: string, universe: Entity[]): Entity[] {
  const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const scored: { e: Entity; s: number }[] = [];
  for (const e of universe) {
    const name = e.name.toLowerCase();
    const s = Math.max(...tokens.map((t) => scoreToken(t, name)));
    if (s >= 0.7) scored.push({ e, s });
  }
  return scored
    .sort((a, b) => b.s - a.s || KIND_ORDER[a.e.kind] - KIND_ORDER[b.e.kind] || b.e.count - a.e.count)
    .slice(0, 5)
    .map((x) => x.e);
}

// ── shared universe loading (piggybacks on search-core's pagefind) ──
import { loadPagefind } from "./search-core";

let universePromise: Promise<Entity[]> | null = null;

export function loadUniverse(): Promise<Entity[]> {
  if (!universePromise) {
    universePromise = (async () => {
      const pf = await loadPagefind();
      const raw = await pf.filters();
      const out: Entity[] = [];
      for (const [kind, values] of Object.entries(raw ?? {})) {
        for (const [name, count] of Object.entries(values as Record<string, number>)) {
          out.push({ kind: kind as Entity["kind"], name, count });
        }
      }
      return out;
    })();
  }
  return universePromise;
}

export function EntitySuggestions({ term }: { term: string }) {
  const [matches, setMatches] = useState<Entity[]>([]);

  useEffect(() => {
    let live = true;
    if (!term.trim()) {
      setMatches([]);
      return;
    }
    loadUniverse()
      .then((u) => {
        if (live) setMatches(matchEntities(term, u));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [term]);

  if (!matches.length) return null;

  return (
    <div className="entity-row">
      {matches.map((e) => (
        <a className={`entity-chip kind-${e.kind}`} key={`${e.kind}:${e.name}`} href={entityUrl(e)}>
          <span className="ekind">{e.kind === "tag" ? "#" : `${e.kind}:`}</span>
          {e.name}
          <span className="ecount">{e.count}</span>
        </a>
      ))}
    </div>
  );
}
