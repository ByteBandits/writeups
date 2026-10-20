import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { TopBarSearch } from "@/components/SearchPalette";

export const metadata: Metadata = {
  title: { default: "ByteBandits Writeups", template: "%s — ByteBandits" },
  description:
    "CTF writeups by ByteBandits — pwn, rev, crypto, web, misc. 100+ writeups from 40+ CTFs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <nav className="topbar">
          <Link href="/" className="brand">
            bytebandits@ctf<span className="path">:~$</span>
          </Link>
          <TopBarSearch />
          <div className="navlinks">
            <Link href="/writeups/">writeups</Link>
            <Link href="/tags/">tags</Link>
            <Link href="/authors/">authors</Link>
            <a
              href="https://github.com/ByteBandits/writeups"
              target="_blank"
              rel="noreferrer"
            >
              ⎇ github
            </a>
          </div>
        </nav>
        {children}
        <footer className="site">
          bytebandits writeups — next.js + pagefind ·{" "}
          <a
            href="https://github.com/ByteBandits/writeups"
            target="_blank"
            rel="noreferrer"
          >
            source
          </a>
        </footer>
      </body>
    </html>
  );
}
