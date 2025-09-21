import { useEffect } from 'react';
import DirectoryTree from '../components/DirectoryTree.jsx';
import WriteupList from '../components/WriteupList.jsx';

export default function Home({ loading, error, results, searchTerm, totalWriteups, directory }) {
  useEffect(() => {
    document.title = 'CTF Writeups Navigator';
    return () => {
      document.title = 'CTF Writeups';
    };
  }, []);

  if (loading) {
    return <p>Loading writeups…</p>;
  }

  if (error) {
    return <p role="alert">Unable to load writeups: {error.message}</p>;
  }

  const heading = searchTerm ? `Results for “${searchTerm}”` : 'All indexed writeups';
  const resultNote = searchTerm
    ? `${results.length} result${results.length === 1 ? '' : 's'} matched.`
    : `Showing ${results.length} writeup${results.length === 1 ? '' : 's'}.`;

  return (
    <div className="home-screen">
      <section className="intro-card">
        <h2>Find the exploit you need</h2>
        <p>
          Search across challenge metadata and markdown content in one field. Start typing to
          instantly filter the library, then open a writeup to read the full solution and preview
          attachments.
        </p>
        <p>
          Use the directory minimap to jump through events quickly, or browse the complete list
          below. Everything stays local—no external search services required.
        </p>
      </section>

      <div className="home-layout">
        <aside className="directory-pane" aria-label="CTF directory minimap">
          <DirectoryTree directory={directory} totalWriteups={totalWriteups} />
        </aside>
        <section className="results-pane">
          <header className="results-header">
            <div>
              <h2>{heading}</h2>
              <p className="results-note">{resultNote}</p>
            </div>
          </header>
          <WriteupList results={results} searchTerm={searchTerm} />
        </section>
      </div>
    </div>
  );
}
