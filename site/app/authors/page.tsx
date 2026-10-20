import type { Metadata } from "next";
import Link from "next/link";
import { getAuthors } from "@/lib/content";

export const metadata: Metadata = { title: "Authors" };

export default function AuthorsPage() {
  const authors = getAuthors();
  return (
    <div className="listwrap">
      <h1>authors ({authors.length})</h1>
      <div className="tagrow">
        {authors.map(([a, n]) => (
          <Link className="tag" key={a} href={`/authors/${encodeURIComponent(a)}/`}>
            {a} <b>{n}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
