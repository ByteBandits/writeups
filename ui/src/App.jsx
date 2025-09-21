import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Fuse from 'fuse.js';
import Home from './pages/Home.jsx';
import Viewer from './pages/Viewer.jsx';
import SearchBar from './components/SearchBar.jsx';

const SEARCH_KEYS = [
  { name: 'problem', weight: 0.5 },
  { name: 'summary', weight: 0.4 },
  { name: 'ctf', weight: 0.25 },
  { name: 'category', weight: 0.25 },
  { name: 'author', weight: 0.2 },
  { name: 'tags', weight: 0.15 },
  { name: 'contentText', weight: 0.35 },
];

export default function App() {
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadIndex() {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}writeups.json`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load writeups.json (${response.status})`);
        }
        const data = await response.json();
        if (isMounted) {
          setWriteups(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setWriteups([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadIndex();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const fuse = useMemo(() => {
    if (!writeups.length) {
      return null;
    }
    return new Fuse(writeups, {
      keys: SEARCH_KEYS,
      threshold: 0.3,
      includeMatches: true,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [writeups]);

  const normalizedSearch = searchTerm.trim();

  const searchResults = useMemo(() => {
    if (!writeups.length) {
      return [];
    }

    if (!normalizedSearch) {
      return writeups.map((item) => ({ item, matches: [] }));
    }

    if (!fuse) {
      return [];
    }

    return fuse.search(normalizedSearch).map(({ item, matches }) => ({
      item,
      matches: matches ?? [],
    }));
  }, [writeups, normalizedSearch, fuse]);

  const directory = useMemo(() => buildDirectoryTree(writeups), [writeups]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>CTF Writeups Navigator</h1>
          <p className="header-subtitle">
            {!loading
              ? `Search across ${writeups.length} writeups, metadata, and content.`
              : 'Loading the writeup index…'}
          </p>
        </div>
        <SearchBar
          value={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={searchResults.length}
          disabled={loading || !!error}
        />
      </header>
      <div className="app-content">
        <main className="main-area">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  loading={loading}
                  error={error}
                  results={searchResults}
                  searchTerm={normalizedSearch}
                  totalWriteups={writeups.length}
                  directory={directory}
                />
              }
            />
            <Route path="/viewer/:ctf/:category/:problem/:author" element={<Viewer writeups={writeups} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function buildDirectoryTree(entries) {
  const tree = new Map();

  entries.forEach((entry) => {
    const ctf = entry.ctf || 'Miscellaneous';
    const category = entry.category || 'uncategorized';
    const list = tree.get(ctf) ?? new Map();
    if (!tree.has(ctf)) {
      tree.set(ctf, list);
    }
    const problems = list.get(category) ?? [];
    if (!list.has(category)) {
      list.set(category, problems);
    }
    problems.push(entry);
  });

  return Array.from(tree.entries())
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }))
    .map(([ctf, categories]) => ({
      name: ctf,
      categories: Array.from(categories.entries())
        .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }))
        .map(([category, problems]) => ({
          name: category,
          entries: problems
            .slice()
            .sort((a, b) =>
              (a.problem || a.path || '').localeCompare(b.problem || b.path || '', undefined, {
                sensitivity: 'base',
              }),
            ),
        })),
    }));
}
