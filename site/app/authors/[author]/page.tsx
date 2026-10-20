import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups, getAuthors } from "@/lib/content";

export function generateStaticParams() {
  return getAuthors().map(([author]) => ({ author }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  return { title: (await params).author };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author } = await params;
  const writeups = getAllWriteups().filter((w) => w.author === author);
  if (writeups.length === 0) notFound();
  return (
    <div className="listwrap">
      <h1>
        {author} ({writeups.length})
      </h1>
      <WriteupIndex writeups={writeups} groupBy={(w) => w.ctf} />
    </div>
  );
}
