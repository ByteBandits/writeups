import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WriteupIndex } from "@/components/WriteupList";
import { getAllWriteups, getCtfs } from "@/lib/content";

export function generateStaticParams() {
  return getCtfs().map(([ctf]) => ({ ctf }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ctf: string }>;
}): Promise<Metadata> {
  return { title: (await params).ctf };
}

export default async function CtfPage({
  params,
}: {
  params: Promise<{ ctf: string }>;
}) {
  const { ctf } = await params;
  const writeups = getAllWriteups().filter((w) => w.ctf === ctf);
  if (writeups.length === 0) notFound();
  return (
    <div className="listwrap">
      <h1>
        {ctf} ({writeups.length})
      </h1>
      <WriteupIndex writeups={writeups} groupBy={(w) => w.category} />
    </div>
  );
}
