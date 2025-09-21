import { Link } from 'react-router-dom';
import { buildViewerPath } from '../utils/navigation.js';

const MATCH_LABELS = {
  contentText: 'Content match',
  summary: 'Summary match',
  problem: 'Title match',
  ctf: 'CTF match',
  category: 'Category match',
  author: 'Author match',
  tags: 'Tag match',
};

const MATCH_PRIORITY = {
  contentText: 0,
  summary: 1,
  problem: 2,
  author: 3,
  ctf: 4,
  category: 5,
  tags: 6,
};

export default function WriteupList({ results, searchTerm }) {
  if (!results || results.length === 0) {
    return (
      <div className="result-empty">
        <p>No writeups matched that search. Try a different keyword or clear the search box.</p>
      </div>
    );
  }

  return (
    <div className="results-list">
      {results.map(({ item, matches }) => {
        const highlight = describeMatch(matches, item, searchTerm);
        const snippetLabel = highlight?.label ?? 'Summary';
        const snippetContent = highlight?.content ?? defaultSummary(item);

        return (
          <article key={item.path} className="result-card">
            <h3 className="result-title">
              <Link to={buildViewerPath(item)}>{item.problem || item.path}</Link>
            </h3>
            <p className="result-meta">
              {item.ctf && <span title="CTF event">🏁 {item.ctf}</span>}
              {item.category && <span title="Category">📂 {item.category}</span>}
              {item.author && <span title="Author">✍️ {item.author}</span>}
              {item.difficulty && <span title="Difficulty">🧩 {item.difficulty}</span>}
              {item.points && <span title="Points">⭐ {item.points}</span>}
              {item.date && <span title="Date">📅 {item.date}</span>}
            </p>
            {snippetContent && (
              <div className="result-snippet">
                <span className="snippet-label">{snippetLabel}</span>
                <p className="snippet-text">{snippetContent}</p>
              </div>
            )}
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="tag-list" aria-label="Writeup tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function describeMatch(matches, entry, searchTerm) {
  if (!searchTerm || !matches || matches.length === 0) {
    return null;
  }

  const sorted = matches
    .slice()
    .filter((match) => Boolean(match?.value) || Boolean(entry?.[match?.key]))
    .sort((a, b) => getPriority(a.key) - getPriority(b.key));

  for (const match of sorted) {
    const key = match.key;
    if (!key) continue;

    if (key === 'contentText') {
      const snippet = highlightText(entry.contentText, match.indices, true);
      if (snippet) {
        return { label: MATCH_LABELS[key] ?? 'Content match', content: snippet };
      }
      continue;
    }

    const rawValue = getMatchValue(match, entry, key);
    const snippet = highlightText(rawValue, match.indices, false);
    if (snippet) {
      return { label: MATCH_LABELS[key] ?? `${key} match`, content: snippet };
    }
  }

  return null;
}

function getPriority(key) {
  if (!key || !(key in MATCH_PRIORITY)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return MATCH_PRIORITY[key];
}

function getMatchValue(match, entry, key) {
  if (typeof match.value === 'string') {
    return match.value;
  }
  if (Array.isArray(match.value)) {
    return match.value.join(', ');
  }
  const field = entry?.[key];
  if (Array.isArray(field)) {
    return field.join(', ');
  }
  if (field == null) {
    return '';
  }
  return String(field);
}

function highlightText(text, indices, isContent) {
  if (!text) {
    return null;
  }

  if (!indices || indices.length === 0) {
    return truncateForDisplay(text, isContent ? 160 : 120);
  }

  const [startIndex, endIndex] = indices[0];
  const radius = isContent ? 80 : 10;
  const start = Math.max(0, startIndex - radius);
  const end = Math.min(text.length, endIndex + radius + 1);
  const snippet = text.slice(start, end);
  const highlightStart = Math.max(startIndex - start, 0);
  const highlightEnd = Math.min(endIndex - start + 1, snippet.length);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';

  return (
    <>
      {prefix}
      {snippet.slice(0, highlightStart)}
      <mark>{snippet.slice(highlightStart, highlightEnd)}</mark>
      {snippet.slice(highlightEnd)}
      {suffix}
    </>
  );
}

function truncateForDisplay(text, limit) {
  if (!text) {
    return null;
  }
  if (text.length <= limit) {
    return text;
  }
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > limit * 0.6) {
    return `${truncated.slice(0, lastSpace)}…`;
  }
  return `${truncated}…`;
}

function defaultSummary(entry) {
  if (entry.summary) {
    return truncateForDisplay(entry.summary, 160);
  }
  if (entry.contentText) {
    return truncateForDisplay(entry.contentText, 160);
  }
  return null;
}
