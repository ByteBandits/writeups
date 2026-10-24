"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { scoreToken } from "@/lib/fuzzy";
import { EntitySuggestions, loadUniverse, type Entity } from "./entities";
import {
  FILTER_KEYS,
  parseQuery,
  type FilterCorrection,
  type UnresolvedFilter,
} from "./search-core";

const KEYS = FILTER_KEYS.join("|");
const DONE_TOKEN = new RegExp(`^(${KEYS}):\\S+$`, "i");
const TYPING_TOKEN = new RegExp(`(^|\\s)(${KEYS}):(\\S*)$`, "i");

/** a filter token followed by whitespace is committed (capsule); everything else stays editable */
function splitQuery(q: string) {
  const chips: string[] = [];
  let rest = "";
  for (const m of q.matchAll(/\S+(\s+|$)/g)) {
    const tok = m[0].trim();
    if (m[1] && DONE_TOKEN.test(tok)) chips.push(tok);
    else rest += m[0];
  }
  return { chips, rest };
}

const joinQuery = (chips: string[], rest: string) => chips.map((c) => c + " ").join("") + rest;

/** entities completing the "key:partial" token being typed */
function useFilterPills(rest: string) {
  const [pills, setPills] = useState<Entity[]>([]);
  useEffect(() => {
    const m = rest.match(TYPING_TOKEN);
    if (!m) {
      setPills([]);
      return;
    }
    const kind = m[2].toLowerCase();
    const partial = m[3].toLowerCase();
    let live = true;
    loadUniverse()
      .then((u) => {
        if (!live) return;
        setPills(
          u
            .filter((e) => e.kind === kind)
            .map((e) => ({ e, s: partial ? scoreToken(partial, e.name.toLowerCase()) : 0.1 }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s || b.e.count - a.e.count)
            .slice(0, 6)
            .map((x) => x.e)
        );
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [rest]);
  return pills;
}

export function SearchBox({
  query,
  onChange,
  onEnter,
  onFocus,
  placeholder,
  autoFocus,
  id,
  bad = [],
  children,
}: {
  query: string;
  onChange: (q: string) => void;
  onEnter?: () => void;
  onFocus?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  id?: string;
  /** lowercase "key:value" tokens that matched nothing */
  bad?: string[];
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { chips, rest } = splitQuery(query);
  const pills = useFilterPills(rest);
  const set = (c: string[], r: string) => onChange(joinQuery(c, r));
  // visibility depends only on the query (not focus) so blur never shifts layout mid-click
  const showKeys = !query.trim();
  // keep input focus when a pill is pressed, so blur doesn't hide the row mid-click
  const keepFocus = (e: MouseEvent) => e.preventDefault();

  return (
    <>
      <div className="bigsearch" onClick={() => inputRef.current?.focus()}>
        <span className="prompt">&gt;</span>
        {chips.map((c, i) => {
          const at = c.indexOf(":");
          const key = c.slice(0, at).toLowerCase();
          return (
            <span key={i} className={`qchip kind-${key}${bad.includes(c.toLowerCase()) ? " bad" : ""}`}>
              <span className="ekind">{key}:</span>
              {c.slice(at + 1)}
              <button
                type="button"
                aria-label={`remove ${c}`}
                onClick={() => set(chips.filter((_, j) => j !== i), rest)}
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          id={id}
          value={rest}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onChange={(e) => set(chips, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !rest && chips.length) {
              // pop the last capsule back into the input for editing
              e.preventDefault();
              set(chips.slice(0, -1), chips[chips.length - 1]);
            }
            if (e.key === "Enter") onEnter?.();
          }}
          placeholder={chips.length ? "" : placeholder}
          aria-label="Search writeups"
        />
        {children}
      </div>
      {showKeys && (
        <div className="entity-row filter-keys">
          {FILTER_KEYS.map((k) => (
            <button
              type="button"
              key={k}
              className={`entity-chip kind-${k}`}
              onMouseDown={keepFocus}
              onClick={() => set(chips, `${k}:`)}
            >
              <span className="ekind">{k}:</span>
            </button>
          ))}
        </div>
      )}
      {pills.length > 0 && (
        <div className="entity-row filter-pills">
          {pills.map((p) => (
            <button
              type="button"
              key={`${p.kind}:${p.name}`}
              className={`entity-chip kind-${p.kind}`}
              onMouseDown={keepFocus}
              onClick={() => {
                set([...chips, `${p.kind}:${p.name}`], rest.replace(TYPING_TOKEN, "$1"));
                inputRef.current?.focus();
              }}
            >
              <span className="ekind">{p.kind}:</span>
              {p.name}
              <span className="ecount">{p.count}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** did-you-mean for filters, entity suggestions, and empty/no-result hints — one place for all search UIs */
export function SearchStatus({
  query,
  status,
  settled,
  total,
  corrections,
  unresolved,
  onSwap,
}: {
  query: string;
  status: string;
  settled: boolean;
  total: number;
  corrections: FilterCorrection[];
  unresolved: UnresolvedFilter[];
  onSwap: (key: string, from: string, to: string) => void;
}) {
  const { term, filters } = parseQuery(query);
  const active = !!term || Object.keys(filters).length > 0;
  const notices = [
    ...corrections.map((c) => ({ key: c.key, value: c.from, options: [c.to], corrected: true })),
    ...unresolved.map((u) => ({ key: u.key, value: u.value, options: u.candidates, corrected: false })),
  ];

  return (
    <>
      {notices.map((n) => (
        <div className="entity-row" key={`${n.key}:${n.value}`}>
          <span className="fdym-label">
            {n.corrected ? "did you mean" : `no ${n.key} “${n.value}”${n.options.length ? " — did you mean" : ""}`}
          </span>
          {n.options.map((o) => (
            <button
              type="button"
              key={o}
              className={`entity-chip kind-${n.key}`}
              onClick={() => onSwap(n.key, n.value, o)}
            >
              <span className="ekind">{n.key}:</span>
              {o}
            </button>
          ))}
          {n.corrected && <span className="fdym-label">— showing its results</span>}
        </div>
      ))}
      {term && <EntitySuggestions term={term} />}
      {status === "unavailable" && (
        <div className="search-hint">
          search index not built yet — run <code>npm run build</code>
        </div>
      )}
      {status === "ready" && active && settled && total === 0 && unresolved.length === 0 && (
        <div className="search-hint">no results for “{query.trim()}”</div>
      )}
    </>
  );
}

export const badTokens = (u: UnresolvedFilter[]) => u.map((x) => `${x.key}:${x.value}`.toLowerCase());
