import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function formatBytes(size) {
  if (size == null) return '';
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function buildUrl(path) {
  return new URL(path, import.meta.env.BASE_URL).toString();
}

function AttachmentCard({ attachment }) {
  const [codeContent, setCodeContent] = useState('');
  const [codeError, setCodeError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setCodeContent('');
    setCodeError(null);
    if (attachment.type === 'code') {
      const url = buildUrl(attachment.path);
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch code (${response.status})`);
          }
          return response.text();
        })
        .then((text) => {
          if (!cancelled) {
            setCodeContent(text);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setCodeError(error instanceof Error ? error : new Error(String(error)));
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [attachment]);

  const url = buildUrl(attachment.path);
  const typeLabel = (attachment.type || 'file').toUpperCase();
  const title = `${attachment.name} (${typeLabel})`;

  return (
    <div className="attachment-card">
      <h3 style={{ margin: '0 0 0.5rem' }}>{attachment.name}</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
        {attachment.type.toUpperCase()} • {formatBytes(attachment.size)}
      </p>
      <div className="attachment-preview">
        {attachment.type === 'image' && (
          <img src={url} alt={attachment.name} style={{ width: '100%', display: 'block' }} />
        )}
        {attachment.type === 'pdf' && (
          <iframe
            src={url}
            title={title}
            style={{ width: '100%', height: '240px', border: 'none' }}
          />
        )}
        {attachment.type === 'html' && (
          <iframe
            src={url}
            title={title}
            sandbox="allow-scripts"
            style={{ width: '100%', height: '240px', border: 'none' }}
          />
        )}
        {attachment.type === 'code' && (
          <div>
            {codeError ? (
              <p role="alert">Unable to render code: {codeError.message}</p>
            ) : codeContent ? (
              <SyntaxHighlighter language={detectLanguage(attachment.name)} style={oneDark}>
                {codeContent}
              </SyntaxHighlighter>
            ) : (
              <p>Loading code preview…</p>
            )}
          </div>
        )}
        {attachment.type === 'binary' && <p>No inline preview. Use the download link.</p>}
      </div>
      <p style={{ marginTop: '0.5rem' }}>
        <a href={url} download={attachment.name} rel="noopener noreferrer">
          Download {attachment.name}
        </a>
      </p>
    </div>
  );
}

function detectLanguage(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'py':
      return 'python';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'hpp':
      return 'cpp';
    case 'sh':
      return 'bash';
    case 'rb':
      return 'ruby';
    case 'php':
      return 'php';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'rs':
      return 'rust';
    case 'sql':
      return 'sql';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'txt':
      return 'text';
    default:
      return ''; // fallback to auto highlighting
  }
}

export default function AttachmentsList({ attachments }) {
  if (!attachments || !attachments.length) {
    return <p>No attachments were provided for this writeup.</p>;
  }

  return (
    <div className="attachments-grid">
      {attachments.map((attachment) => (
        <AttachmentCard key={attachment.path} attachment={attachment} />
      ))}
    </div>
  );
}
