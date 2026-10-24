export const COPY_LABEL = "⧉ copy";

/** Copy a file's exact contents — fetched, so highlighting/hex rendering can't alter it. */
export async function copyFile(url: string): Promise<boolean> {
  const text = fetch(url).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.text();
  });
  try {
    // ClipboardItem with a promise keeps the click's user activation across the fetch (Safari needs this)
    if (typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) }),
      ]);
    } else {
      await navigator.clipboard.writeText(await text);
    }
    return true;
  } catch {
    return false;
  }
}

export function flashCopied(btn: HTMLElement, ok: boolean) {
  btn.textContent = ok ? "copied!" : "copy failed";
  setTimeout(() => (btn.textContent = COPY_LABEL), 1200);
}
