"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { scoreToken } from "@/lib/fuzzy";
import { getFilters } from "./search-core";

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

/** route path for an entity — use with <Link> */
export const entityUrl = (e: Entity) =>
  e.kind === "tool" || e.kind === "technique"
    ? `/search/?q=${encodeURIComponent(`${e.kind}:${e.name}`)}`
    : `/${{ author: "authors", tag: "tags", ctf: "ctfs", category: "categories" }[e.kind]}/${encodeURIComponent(e.name)}/`;

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

let universePromise: Promise<Entity[]> | null = null;

export function loadUniverse(): Promise<Entity[]> {
  universePromise ??= getFilters().then((raw) =>
    Object.entries(raw).flatMap(([kind, values]) =>
      Object.entries(values).map(([name, count]) => ({ kind: kind as Entity["kind"], name, count }))
    )
  );
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
      .then((u) => live && setMatches(matchEntities(term, u)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [term]);

  if (!matches.length) return null;

  return (
    <div className="entity-row dym">
      {matches.map((e) => (
        <Link className={`entity-chip kind-${e.kind}`} key={`${e.kind}:${e.name}`} href={entityUrl(e)}>
          <span className="ekind">{e.kind === "tag" ? "#" : `${e.kind}:`}</span>
          {e.name}
          <span className="ecount">{e.count}</span>
        </Link>
      ))}
    </div>
  );
}
