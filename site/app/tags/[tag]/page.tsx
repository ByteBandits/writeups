import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups, getTags } from "@/lib/content";

export function generateStaticParams() {
  return getTags().map(([tag]) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  return { title: `#${(await params).tag}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const writeups = getAllWriteups().filter((w) => w.tags.includes(tag));
  if (writeups.length === 0) notFound();
  return (
    <div className="listwrap">
      <h1>
        #{tag} ({writeups.length})
      </h1>
      <WriteupIndex writeups={writeups} />
    </div>
  );
}
