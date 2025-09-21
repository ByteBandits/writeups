import { Link } from 'react-router-dom';
import { buildViewerPath } from '../utils/navigation.js';

export default function DirectoryTree({ directory, totalWriteups }) {
  if (!directory || directory.length === 0) {
    return (
      <div className="directory-tree empty">
        <h3>Directory</h3>
        <p className="directory-note">No writeups have been indexed yet.</p>
      </div>
    );
  }

  return (
    <nav className="directory-tree" aria-label="Writeup directory">
      <div className="directory-header">
        <h3>Directory</h3>
        <span className="directory-note">
          {totalWriteups} writeup{totalWriteups === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="directory-list" role="list">
        {directory.map((ctf) => {
          const ctfTotal = ctf.categories.reduce((sum, category) => sum + category.entries.length, 0);
          return (
            <li key={ctf.name}>
              <details open>
                <summary>
                  <span>{ctf.name}</span>
                  <span className="badge">{ctfTotal}</span>
                </summary>
                <ul role="list">
                  {ctf.categories.map((category) => (
                    <li key={`${ctf.name}-${category.name}`}>
                      <details>
                        <summary>
                          <span>{category.name}</span>
                          <span className="badge">{category.entries.length}</span>
                        </summary>
                        <ul role="list">
                          {category.entries.map((entry) => (
                            <li key={entry.path}>
                              <Link to={buildViewerPath(entry)}>{entry.problem || entry.path}</Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
