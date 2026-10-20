"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ResultCard, usePagefind, parseQuery } from "@/components/search-core";
import { EntitySuggestions } from "@/components/entities";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [limit, setLimit] = useState(30);
  const { results, total, status } = usePagefind(query, limit);

  useEffect(() => {
    const q = params.get("q") ?? "";
    setQuery(q);
    setLimit(30);
  }, [params]);

  return (
    <div className="listwrap">
      <h1>search</h1>
      <div className="bigsearch" style={{ marginBottom: 18 }}>
        <span className="prompt">&gt;</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              router.replace(`/search/?q=${encodeURIComponent(query)}`);
          }}
          placeholder="search — heap, tag:z3, author:sudhackar"
          aria-label="Search writeups"
          autoFocus
        />
      </div>
      <div className="results">
        {parseQuery(query).term && (
          <EntitySuggestions term={parseQuery(query).term} />
        )}
        {status === "unavailable" && (
          <div className="search-hint">
            search index not built yet — run <code>npm run build</code>
          </div>
        )}
        {status === "ready" && query && results.length === 0 && (
          <div className="search-hint">no results for “{query}”</div>
        )}
        {results.map((r) => (
          <ResultCard key={r.url} r={r} />
        ))}
        {total > 0 && (
          <div className="search-hint">
            showing {results.length} of {total}
            {results.length < total && (
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
