import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Fuse from 'fuse.js';
import Home from './pages/Home.jsx';
import Viewer from './pages/Viewer.jsx';
import SearchBar from './components/SearchBar.jsx';
import Filters from './components/Filters.jsx';

const SEARCH_KEYS = ['problem', 'ctf', 'category', 'author', 'tags', 'tools', 'techniques'];

const defaultFilters = {
  ctf: 'all',
  category: 'all',
  difficulty: 'all',
  tags: [],
};

export default function App() {
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);

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
      threshold: 0.35,
      includeScore: true,
    });
  }, [writeups]);

  const filteredWriteups = useMemo(() => {
    const baseList = searchTerm && fuse ? fuse.search(searchTerm).map((result) => result.item) : writeups;

    return baseList.filter((entry) => {
      if (filters.ctf !== 'all' && entry.ctf !== filters.ctf) return false;
      if (filters.category !== 'all' && entry.category !== filters.category) return false;
      if (filters.difficulty !== 'all' && entry.difficulty !== filters.difficulty) return false;
      if (filters.tags.length) {
        const entryTags = Array.isArray(entry.tags) ? entry.tags.map(String) : [];
        const hasAllTags = filters.tags.every((tag) => entryTags.includes(tag));
        if (!hasAllTags) return false;
      }
      return true;
    });
  }, [searchTerm, fuse, writeups, filters]);

  const filterOptions = useMemo(() => {
    const ctfSet = new Set();
    const categorySet = new Set();
    const difficultySet = new Set();
    const tagSet = new Set();

    writeups.forEach((entry) => {
      if (entry.ctf) ctfSet.add(entry.ctf);
      if (entry.category) categorySet.add(entry.category);
      if (entry.difficulty) difficultySet.add(entry.difficulty);
      if (Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => tag && tagSet.add(String(tag)));
      }
    });

    return {
      ctfs: Array.from(ctfSet).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
      difficulties: Array.from(difficultySet).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [writeups]);

  const handleFilterChange = (updated) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>CTF Writeups Explorer</h1>
        <span>{writeups.length ? `${writeups.length} writeups indexed` : 'Loading index...'}</span>
      </header>
      <div className="app-content">
        <aside className="sidebar" aria-label="Search and filters">
          <SearchBar value={searchTerm} onSearchChange={setSearchTerm} />
          <Filters
            filters={filters}
            options={filterOptions}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </aside>
        <main className="main-area">
          <Routes>
            <Route
              path="/"
              element={<Home writeups={filteredWriteups} loading={loading} error={error} />}
            />
            <Route
              path="/viewer/:ctf/:category/:problem"
              element={<Viewer writeups={writeups} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
