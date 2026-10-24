"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePagefind, ResultCard, KbdK, replaceFilter } from "./search-core";
import { SearchBox, SearchStatus, badTokens } from "./search-ui";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const fullQuery = query.trim();
  const s = usePagefind(fullQuery, 8);
  const open = focused && (fullQuery.length > 0 || s.status === "unavailable");
  const searchHref = `/search/?q=${encodeURIComponent(fullQuery)}`;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setFocused(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef}>
      <SearchBox
        id="hero-search"
        query={query}
        onChange={setQuery}
        onFocus={() => setFocused(true)}
        onEnter={() => fullQuery && router.push(searchHref)}
        placeholder="search writeups — heap, z3, sudhackar…"
        bad={badTokens(s.unresolved)}
      >
        <KbdK />
      </SearchBox>
      {open && (
        <div className="results">
          <SearchStatus
            query={fullQuery}
            status={s.status}
            settled={s.settled}
            total={s.total}
            corrections={s.corrections}
            unresolved={s.unresolved}
            onSwap={(k, f, t) => setQuery((q) => replaceFilter(q, k, f, t))}
          />
          {s.results.map((r) => (
            <ResultCard key={r.url} r={r} />
          ))}
          {s.total > 0 && (
            <div className="search-hint">
              <Link href={searchHref}>all {s.total} results →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
