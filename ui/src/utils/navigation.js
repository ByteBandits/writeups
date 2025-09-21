export function buildViewerPath(entry) {
  const ctf = encodeURIComponent(entry?.ctf || 'unknown');
  const category = encodeURIComponent(entry?.category || 'misc');
  const problem = encodeURIComponent(entry?.problem || entry?.path || 'writeup');
  return `/viewer/${ctf}/${category}/${problem}`;
}
