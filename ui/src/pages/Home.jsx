import WriteupList from '../components/WriteupList.jsx';

export default function Home({ writeups, loading, error }) {
  if (loading) {
    return <p>Loading writeups…</p>;
  }

  if (error) {
    return <p role="alert">Unable to load writeups: {error.message}</p>;
  }

  return (
    <div>
      <h2>Browse writeups</h2>
      <WriteupList writeups={writeups} />
    </div>
  );
}
