import type { Metadata } from "next";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups } from "@/lib/content";

export const metadata: Metadata = { title: "All writeups" };

export default function WriteupsPage() {
  const writeups = getAllWriteups();
  return (
    <div className="listwrap">
      <h1>all writeups ({writeups.length})</h1>
      <WriteupIndex writeups={writeups} groupBy={(w) => w.ctf} />
    </div>
  );
}
