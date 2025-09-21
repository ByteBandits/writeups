import { useEffect, useState } from 'react';

export default function SearchBar({ value, onSearchChange, delay = 200, resultCount, disabled }) {
  const [term, setTerm] = useState(value ?? '');

  useEffect(() => {
    setTerm(value ?? '');
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchChange(term);
    }, delay);
    return () => clearTimeout(timeout);
  }, [term, delay, onSearchChange]);

  const note = typeof resultCount === 'number' ? formatResultCount(resultCount, term) : null;

  return (
    <div className="search-bar">
      <label className="sr-only" htmlFor="global-search">
        Search writeups
      </label>
      <input
        id="global-search"
        className="search-input"
        type="search"
        placeholder="Search challenges, tags, or content"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search writeups"
        disabled={disabled}
      />
      {note && <p className="search-note" aria-live="polite">{note}</p>}
    </div>
  );
}

function formatResultCount(resultCount, term) {
  if (!term) {
    return `${resultCount} writeup${resultCount === 1 ? '' : 's'} indexed`;
  }
  return `${resultCount} match${resultCount === 1 ? '' : 'es'}`;
}
