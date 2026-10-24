"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePagefind, ResultCard, KbdK, replaceFilter } from "./search-core";
import { SearchBox, SearchStatus, badTokens } from "./search-ui";

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
  const s = usePagefind(query);
  const change = (q: string) => {
    setQuery(q);
    setSel(0);
  };
  const searchHref = `/search/?q=${encodeURIComponent(query.trim())}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((i) => Math.min(i + 1, s.results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((i) => Math.max(i - 1, 0));
      }
      // Enter on a focused pill/chip button activates that button instead
      if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") {
        if (s.results[sel]) router.push(s.results[sel].url);
        else if (query.trim()) router.push(searchHref);
        else return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.results, sel, query, searchHref, router, onClose]);

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <SearchBox
          query={query}
          onChange={change}
          placeholder="search writeups — heap, z3, sudhackar…"
          bad={badTokens(s.unresolved)}
          autoFocus
        />
        <div className="results">
          <SearchStatus
            query={query}
            status={s.status}
            settled={s.settled}
            total={s.total}
            corrections={s.corrections}
            unresolved={s.unresolved}
            onSwap={(k, f, t) => change(replaceFilter(query, k, f, t))}
          />
          {s.results.map((r, i) => (
            <ResultCard key={r.url} r={r} selected={i === sel} onClick={onClose} />
          ))}
          {s.results.length > 0 && (
            <div className="search-hint">
              ↵ open · {s.results.length} of {s.total} ·{" "}
              <Link href={searchHref} onClick={onClose}>
                all results →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
