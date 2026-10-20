"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ResultCard, usePagefind } from "@/components/search-core";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const { results, status } = usePagefind(query, 30);

  useEffect(() => {
    const q = params.get("q") ?? "";
    setQuery(q);
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
