import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import {
  getAllWriteups,
  getAuthors,
  getCategories,
  getCtfs,
  getTags,
  writeupUrl,
} from "@/lib/content";

const LOGO = ` ____        _       ____                  _ _ _
| __ ) _   _| |_ ___| __ )  __ _ _ __   __| (_) |_ ___
|  _ \\| | | | __/ _ \\  _ \\ / _\` | '_ \\ / _\` | | __/ __|
| |_) | |_| | ||  __/ |_) | (_| | | | | (_| | | |_\\__ \\
|____/ \\__, |\\__\\___|____/ \\__,_|_| |_|\\__,_|_|\\__|___/
       |___/`;

export default function Home() {
  const writeups = getAllWriteups();
  const tags = getTags(writeups).slice(0, 6);
  const authors = getAuthors(writeups).slice(0, 5);
  const ctfs = getCtfs(writeups).slice(0, 5);
  const categories = getCategories(writeups).map(([c]) => c);
  const recent = writeups.slice(0, 8);

  return (
    <>
      <header className="hero">
        <div className="hero-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/skull.png"}
            alt=""
            className="hero-skull"
          />
          <pre className="ascii">{LOGO}</pre>
        </div>
        <p className="stats">
          <Link href="/browse/">
            <b>{writeups.length}</b> writeups
          </Link>{" "}
          · <b>{getCtfs(writeups).length}</b> ctfs ·{" "}
          <b>{getAuthors(writeups).length}</b> authors · est. 2015
        </p>
        <HeroSearch categories={categories} />
      </header>

      <div className="lower">
        <section>
          <div className="secthead">recent writeups</div>
          {recent.map((w) => (
            <Link className="witem" key={w.relDir} href={writeupUrl(w)}>
              <span className="t">{w.title}</span>{" "}
              <span className="m">
                — {w.ctf} · {w.category} · <i>{w.author}</i>
                {w.updated
                  ? ` · ${new Date(w.updated).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}`
                  : ""}
              </span>
            </Link>
          ))}
          <Link className="witem" href="/browse/">
            <span className="m">→ browse all {writeups.length} writeups</span>
          </Link>
        </section>
        <aside>
          <div className="secthead">top tags</div>
          <div className="tagrow">
            {tags.map(([t, n]) => (
              <Link className="tag" key={t} href={`/tags/${encodeURIComponent(t)}/`}>
                {t} <b>{n}</b>
              </Link>
            ))}
          </div>
          <div className="secthead">authors</div>
          <div className="tagrow">
            {authors.map(([a, n]) => (
              <Link className="tag" key={a} href={`/authors/${encodeURIComponent(a)}/`}>
                {a} <b>{n}</b>
              </Link>
            ))}
          </div>
          <div className="secthead">ctfs</div>
          <div className="tagrow">
            {ctfs.map(([c, n]) => (
              <Link className="tag" key={c} href={`/ctfs/${encodeURIComponent(c)}/`}>
                {c} <b>{n}</b>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
