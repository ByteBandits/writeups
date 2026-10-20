import type { Metadata } from "next";
import Link from "next/link";
import { getTags } from "@/lib/content";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  const tags = getTags();
  return (
    <div className="listwrap">
      <h1>tags ({tags.length})</h1>
      <div className="tagrow">
        {tags.map(([t, n]) => (
          <Link className="tag" key={t} href={`/tags/${encodeURIComponent(t)}/`}>
            {t} <b>{n}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
