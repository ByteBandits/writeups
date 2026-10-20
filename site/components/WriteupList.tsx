import Link from "next/link";
import { writeupUrl, type Writeup } from "@/lib/content";

export function WriteupRow({ w, showCtf = true }: { w: Writeup; showCtf?: boolean }) {
  return (
    <Link className="witem" href={writeupUrl(w)}>
      <span className="t">{w.title}</span>{" "}
      <span className="m">
        — {showCtf ? `${w.ctf} · ` : ""}
        {w.category} · <i>{w.author}</i>
        {w.tags.length > 0 ? ` · ${w.tags.slice(0, 3).join(", ")}` : ""}
      </span>
    </Link>
  );
}

export function WriteupIndex({
  writeups,
  groupBy,
}: {
  writeups: Writeup[];
  groupBy?: (w: Writeup) => string;
}) {
  if (!groupBy) {
    return (
      <div>
        {writeups.map((w) => (
          <WriteupRow key={w.relDir} w={w} />
        ))}
      </div>
    );
  }
  const groups = new Map<string, Writeup[]>();
  for (const w of writeups) {
    const k = groupBy(w);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(w);
  }
  return (
    <div>
      {[...groups.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([name, ws]) => (
          <div className="ctfgroup" key={name} id={encodeURIComponent(name)}>
            <h2>
              <a href={`#${encodeURIComponent(name)}`}>{name}</a>{" "}
              <span style={{ color: "var(--dim)", fontSize: 12 }}>
                ({ws.length})
              </span>
            </h2>
            {ws.map((w) => (
              <WriteupRow key={w.relDir} w={w} showCtf={false} />
            ))}
          </div>
        ))}
    </div>
  );
}
