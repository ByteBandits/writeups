"use client";

import { useEffect } from "react";
import type { LinkedFile } from "@/lib/markdown";

const KIND_LABEL: Record<string, string> = {
  text: "source",
  hex: "binary — first 256 bytes",
  pdf: "pdf",
};

export function ContentEnhancer({
  selector,
  files,
}: {
  selector: string;
  files: Record<string, LinkedFile>;
}) {
  useEffect(() => {
    const root = document.querySelector(selector);
    if (!root) return;

    // copy buttons on code blocks
    const pres = root.querySelectorAll<HTMLElement>("pre");
    pres.forEach((pre) => {
      const host = (pre.closest("figure") ?? pre) as HTMLElement;
      host.style.position = "relative";
      const btn = document.createElement("button");
      btn.className = "copybtn";
      btn.textContent = "copy";
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(pre.innerText).then(() => {
          btn.textContent = "copied!";
          setTimeout(() => (btn.textContent = "copy"), 1200);
        });
      });
      host.appendChild(btn);
    });

    // click-to-expand for inline file links
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.(
        "a.filelink[data-file]"
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const url = link.dataset.file!;
      const file = files[url];
      if (!file) return; // fall back to normal navigation
      e.preventDefault();

      const anchor =
        link.closest("p, li, blockquote, td") ?? link.parentElement!;
      const next = anchor.nextElementSibling;
      if (next?.classList.contains("attachview") && next.getAttribute("data-for") === url) {
        next.remove();
        return;
      }
      document
        .querySelectorAll(`.attachview[data-for="${url}"]`)
        .forEach((el) => el.remove());

      const view = document.createElement("div");
      view.className = "attachview";
      view.setAttribute("data-for", url);
      const body =
        file.kind === "pdf"
          ? `<embed src="${url}" type="application/pdf" class="av-pdf" />`
          : `<div class="av-body content">${file.html}</div>`;
      view.innerHTML = `
        <div class="attachview-head">
          <span class="av-name">${file.name}</span>
          <span class="av-kind">${KIND_LABEL[file.kind] ?? file.kind}</span>
          <a class="av-dl" href="${url}" download>⬇ download</a>
        </div>
        ${body}`;
      anchor.after(view);
      view.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    root.addEventListener("click", onClick as EventListener);

    return () => {
      root.removeEventListener("click", onClick as EventListener);
      root.querySelectorAll(".copybtn").forEach((b) => b.remove());
    };
  }, [selector, files]);

  return null;
}
