import { Link } from 'react-router-dom';

function buildViewerPath(entry) {
  const ctf = encodeURIComponent(entry.ctf || 'unknown');
  const category = encodeURIComponent(entry.category || 'misc');
  const problem = encodeURIComponent(entry.problem || entry.path || 'writeup');
  return `/viewer/${ctf}/${category}/${problem}`;
}

export default function WriteupList({ writeups }) {
  if (!writeups.length) {
    return <p>No writeups match your filters yet.</p>;
  }

  return (
    <div>
      {writeups.map((entry) => (
        <article key={entry.path} className="writeup-card">
          <h2 style={{ marginTop: 0 }}>
            <Link to={buildViewerPath(entry)}>{entry.problem || entry.path}</Link>
          </h2>
          <div className="writeup-meta">
            {entry.ctf && <span title="CTF event">🏁 {entry.ctf}</span>}
            {entry.category && <span title="Category">📂 {entry.category}</span>}
            {entry.author && <span title="Author">✍️ {entry.author}</span>}
            {entry.points && <span title="Points">⭐ {entry.points}</span>}
            {entry.difficulty && <span title="Difficulty">🧩 {entry.difficulty}</span>}
            {entry.date && <span title="Date">📅 {entry.date}</span>}
          </div>
          {Array.isArray(entry.tags) && entry.tags.length > 0 && (
            <div className="tag-list" aria-label="Writeup tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
