import { useEffect, useState } from 'react';

export default function SearchBar({ value, onSearchChange, delay = 250 }) {
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

  return (
    <div>
      <label className="section-title" htmlFor="global-search">
        Search
      </label>
      <input
        id="global-search"
        className="search-input"
        type="search"
        placeholder="Search by problem, CTF, author, tag..."
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search writeups"
      />
    </div>
  );
}
