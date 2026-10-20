import type { Metadata } from "next";
import { BrowseGrid } from "@/components/BrowseGrid";
import { getAllWriteups, writeupUrl } from "@/lib/content";

export const metadata: Metadata = { title: "All writeups" };

export default function WriteupsPage() {
  const items = getAllWriteups().map((w) => ({
    title: w.title,
    url: writeupUrl(w),
    ctf: w.ctf,
    category: w.category,
    author: w.author,
    updated: w.updated,
  }));
  return (
    <div className="listwrap wide">
      <h1>writeups ({items.length})</h1>
      <BrowseGrid writeups={items} />
    </div>
  );
}
