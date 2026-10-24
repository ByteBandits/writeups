"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ResultCard, replaceFilter, usePagefind } from "@/components/search-core";
import { SearchBox, SearchStatus, badTokens } from "@/components/search-ui";

// trailing space commits every filter token from the URL into a capsule
const fromParam = (q: string | null) => (q?.trim() ? q.trim() + " " : "");

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(() => fromParam(params.get("q")));
  const [limit, setLimit] = useState(30);
  const s = usePagefind(query, limit);

  useEffect(() => {
    setQuery(fromParam(params.get("q")));
    setLimit(30);
  }, [params]);

  return (
    <div className="listwrap">
      <h1>search</h1>
      <div style={{ marginBottom: 18 }}>
        <SearchBox
          query={query}
          onChange={setQuery}
          onEnter={() => router.replace(`/search/?q=${encodeURIComponent(query.trim())}`)}
          placeholder="search writeups — heap, z3, sudhackar…"
          bad={badTokens(s.unresolved)}
          autoFocus
        />
      </div>
      <div className="results">
        <SearchStatus
          query={query}
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
            showing {s.results.length} of {s.total}
            {s.results.length < s.total && (
              <>
                {" — "}
                <a
                  href="#more"
                  onClick={(e) => {
                    e.preventDefault();
                    setLimit((l) => l + 30);
                  }}
                >
                  load more ↓
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
