import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups, getCategories } from "@/lib/content";

export function generateStaticParams() {
  return getCategories().map(([category]) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  return { title: (await params).category };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const writeups = getAllWriteups().filter((w) => w.category === category);
  if (writeups.length === 0) notFound();
  return (
    <div className="listwrap">
      <h1>
        {category} ({writeups.length})
      </h1>
      <WriteupIndex writeups={writeups} groupBy={(w) => w.ctf} />
    </div>
  );
}
