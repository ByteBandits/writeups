"use client";

import { useState } from "react";
import type { AttachmentItem } from "@/lib/attachments";
import { COPY_LABEL, copyFile, flashCopied } from "@/lib/clipboard";

export function AttachmentViewer({ items }: { items: AttachmentItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((i) => i.url === open);

  return (
    <div className="attachments">
      <div className="attach">
        {items.map((a) =>
          a.kind === "download" ? (
            <a key={a.url} className="file" href={a.url} download>
              <span className="dl">⬇</span> {a.name}{" "}
              <span className="sz">{a.size}</span>
            </a>
          ) : (
            <button
              key={a.url}
              className={`file${open === a.url ? " on" : ""}`}
              onClick={() => setOpen(open === a.url ? null : a.url)}
            >
              <span className="dl">{open === a.url ? "▾" : "▸"}</span> {a.name}{" "}
              <span className="sz">{a.size}</span>
            </button>
          )
        )}
      </div>
      {current && (
        <div className="attachview">
          <div className="attachview-head">
            <span className="av-name">{current.name}</span>
            <span className="av-kind">
              {current.kind === "text"
                ? "source"
                : current.kind === "hex"
                  ? "binary — first 256 bytes"
                  : current.kind}
            </span>
            {current.kind === "text" && (
              <button
                type="button"
                className="av-copy"
                onClick={(e) => {
                  const btn = e.currentTarget;
                  copyFile(current.url).then((ok) => flashCopied(btn, ok));
                }}
              >
                {COPY_LABEL}
              </button>
            )}
            <a className="av-dl" href={current.url} download>
              ⬇ download ({current.size})
            </a>
          </div>
          {current.kind === "pdf" ? (
            <embed
              src={current.url}
              type="application/pdf"
              className="av-pdf"
            />
          ) : (
            current.html && (
              <div
                className="av-body content"
                dangerouslySetInnerHTML={{ __html: current.html }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
