"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePagefind, ResultCard, parseQuery, KbdK } from "./search-core";
import { EntitySuggestions } from "./entities";

export function HeroSearch({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const fullQuery = cat ? `${query} category:${cat}` : query;
  const { results, status } = usePagefind(fullQuery, 8);
  const { term } = parseQuery(fullQuery);
  const open = focused && (term.length > 0 || cat !== null || status === "unavailable");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const cats = categories.filter((c) => c && c !== "unknown").slice(0, 8);

  return (
    <div ref={boxRef}>
      <div className="bigsearch">
        <span className="prompt">&gt;</span>
        <input
          id="hero-search"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              router.push(`/search/?q=${encodeURIComponent(fullQuery)}`);
          }}
          placeholder="search writeups — heap, z3, author:sudhackar…"
          aria-label="Search writeups"
        />
        <KbdK />
      </div>
      {cats.length > 0 && (
        <div className="chips">
          <button className={`chip${cat === null ? " on" : ""}`} onClick={() => setCat(null)}>
            all
          </button>
          {cats.map((c) => (
            <button
              key={c}
              className={`chip${cat === c ? " on" : ""}`}
              onClick={() => setCat(cat === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {open && (
        <div className="results">
          {term && <EntitySuggestions term={term} />}
          {status === "unavailable" && (
            <div className="search-hint">
              search index not built yet — run <code>npm run build</code>
            </div>
          )}
          {status === "ready" && !term && !cat && (
            <div className="search-hint">
              type to search 100+ writeups by content, tag, author…
            </div>
          )}
          {status === "ready" && (term || cat) && results.length === 0 && (
            <div className="search-hint">no results — try different terms</div>
          )}
          {results.map((r) => (
            <ResultCard key={r.url} r={r} />
          ))}
          {term && results.length > 0 && (
            <div className="search-hint">
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search/?q=${encodeURIComponent(fullQuery)}`}
              >
                all results for “{term}” →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
