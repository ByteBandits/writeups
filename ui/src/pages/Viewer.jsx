import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WriteupViewer from '../components/WriteupViewer.jsx';
import AttachmentsList from '../components/AttachmentsList.jsx';

const TABS = [
  { id: 'writeup', label: 'Writeup' },
  { id: 'files', label: 'Files' },
  { id: 'raw', label: 'Raw Markdown' },
];

function buildBreadcrumb(entry) {
  const crumbs = [
    { label: 'Home', to: '/' },
  ];
  if (entry?.ctf) {
    crumbs.push({ label: entry.ctf, to: '/' });
  }
  if (entry?.category) {
    crumbs.push({ label: entry.category, to: '/' });
  }
  if (entry?.problem) {
    crumbs.push({ label: entry.problem });
  }
  return crumbs;
}

export default function Viewer({ writeups }) {
  const params = useParams();
  const { ctf: ctfParam, category: categoryParam, problem: problemParam } = params;

  const entry = useMemo(() => {
    return writeups.find((item) => {
      const encodedCtf = encodeURIComponent(item.ctf || 'unknown');
      const encodedCategory = encodeURIComponent(item.category || 'misc');
      const encodedProblem = encodeURIComponent(item.problem || item.path || 'writeup');
      return (
        encodedCtf === ctfParam && encodedCategory === categoryParam && encodedProblem === problemParam
      );
    });
  }, [writeups, ctfParam, categoryParam, problemParam]);

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('writeup');

  useEffect(() => {
    setActiveTab('writeup');
    if (!entry) return;

    let mounted = true;
    const controller = new AbortController();

    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${entry.path}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch markdown (${response.status})`);
        }
        const text = await response.text();
        if (mounted) {
          setContent(text);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setContent('');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchContent();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [entry]);

  useEffect(() => {
    if (entry?.problem) {
      document.title = `${entry.problem} – CTF Writeups`;
    }
    return () => {
      document.title = 'CTF Writeups';
    };
  }, [entry]);

  if (!entry) {
    return (
      <div>
        <p>We could not find that writeup. It may have been removed or renamed.</p>
        <p>
          <Link to="/">Back to the list</Link>
        </p>
      </div>
    );
  }

  const breadcrumbs = buildBreadcrumb(entry);

  return (
    <div>
      <div className="viewer-toolbar">
        <nav aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label}>
              {index > 0 && ' / '}
              {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
            </span>
          ))}
        </nav>
        <div className="viewer-tabs" role="tablist" aria-label="Writeup view modes">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? 'active' : ''}
              aria-pressed={tab.id === activeTab}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section aria-live="polite" aria-busy={loading}>
        {activeTab === 'writeup' && (
          <div>
            <Metadata entry={entry} />
            {loading && <p>Loading writeup…</p>}
            {error && <p role="alert">{error.message}</p>}
            {!loading && !error && <WriteupViewer content={content} />}
          </div>
        )}
        {activeTab === 'files' && <AttachmentsList attachments={entry.attachments || []} />}
        {activeTab === 'raw' && (
          <pre className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
            {loading ? 'Loading…' : content || 'No content available.'}
          </pre>
        )}
      </section>
    </div>
  );
}

function Metadata({ entry }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.25rem 1rem', marginBottom: '1rem' }}>
      <dt>CTF</dt>
      <dd>{entry.ctf || 'Unknown'}</dd>
      <dt>Category</dt>
      <dd>{entry.category || 'Unknown'}</dd>
      <dt>Problem</dt>
      <dd>{entry.problem || entry.path}</dd>
      {entry.author && (
        <>
          <dt>Author</dt>
          <dd>{entry.author}</dd>
        </>
      )}
      {entry.points && (
        <>
          <dt>Points</dt>
          <dd>{entry.points}</dd>
        </>
      )}
      {entry.difficulty && (
        <>
          <dt>Difficulty</dt>
          <dd>{entry.difficulty}</dd>
        </>
      )}
      {entry.date && (
        <>
          <dt>Date</dt>
          <dd>{entry.date}</dd>
        </>
      )}
      {Array.isArray(entry.tags) && entry.tags.length > 0 && (
        <>
          <dt>Tags</dt>
          <dd>{entry.tags.join(', ')}</dd>
        </>
      )}
    </dl>
  );
}
