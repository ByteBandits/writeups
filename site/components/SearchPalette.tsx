"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePagefind, ResultCard, parseQuery, KbdK } from "./search-core";
import { EntitySuggestions } from "./entities";

const PaletteCtx = createContext<() => void>(() => {});

export function useOpenPalette() {
  return useContext(PaletteCtx);
}

export function TopBarSearch() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdOrCtrlK =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash =
        e.key === "/" &&
        !(e.target as HTMLElement).closest("input, textarea, [contenteditable]");
      if (!cmdOrCtrlK && !slash) return;
      e.preventDefault();
      if (pathname === "/") {
        // home already has the hero bar — just move focus to it
        document.getElementById("hero-search")?.focus();
        setOpen(false);
        return;
      }
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname]);

  return (
    <PaletteCtx.Provider value={openPalette}>
      {pathname !== "/" && (
        <button className="topsearch" onClick={openPalette}>
          <span style={{ color: "var(--green)" }}>&gt;_</span> search writeups…
          <KbdK />
        </button>
      )}
      {open && <Palette onClose={() => setOpen(false)} />}
    </PaletteCtx.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, status } = usePagefind(query);
  const { term } = parseQuery(query);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        if (results[sel]) router.push(results[sel].url);
        else if (term) router.push(`/search/?q=${encodeURIComponent(query)}`);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, sel, term, query, router, onClose]);

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="bigsearch">
          <span className="prompt">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSel(0);
            }}
            placeholder="search — try heap, tag:z3, author:sudhackar"
            aria-label="Search writeups"
          />
        </div>
        <div className="results">
          {term && <EntitySuggestions term={term} />}
          {status === "unavailable" && (
            <div className="search-hint">
              search index not built yet — run <code>npm run build</code>
            </div>
          )}
          {status !== "unavailable" && !term && (
            <div className="search-hint">
              type to search content, tags, authors… · filters: tag:, author:,
              ctf:
            </div>
          )}
          {term && results.length === 0 && status === "ready" && (
            <div className="search-hint">no results for “{term}”</div>
          )}
          {results.map((r, i) => (
            <ResultCard
              key={r.url}
              r={r}
              selected={i === sel}
              onClick={onClose}
            />
          ))}
          {term && results.length > 0 && (
            <div className="search-hint">
              ↵ open · {results.length} shown ·{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search/?q=${encodeURIComponent(query)}`}
                onClick={onClose}
              >
                all results →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
