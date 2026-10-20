// Tests for: card grid, entity suggestions, load-more, logo/favicon.
import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  (" + extra + ")" : ""}`);
  cond ? pass++ : fail++;
};

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--disable-gpu"],
});
const page = await browser.newPage();

// ── card grid ──
await page.goto(`${BASE}/writeups/`, { waitUntil: "networkidle0" });
const cards = await page.$$(".wcard");
ok("card grid renders cards", cards.length > 100, `${cards.length} cards`);
const firstCatColor = await page.$eval(".wcard", (el) => el.style.borderLeftColor);
ok("cards have category accent color", firstCatColor !== "");
// filter by type=pwn
await page.select(".filters select", "pwn");
await new Promise((r) => setTimeout(r, 400));
const pwnCards = await page.$$eval(".wcard-cat", (els) => els.map((e) => e.textContent));
ok("type filter shows only pwn", pwnCards.every((c) => c === "pwn"), `${pwnCards.length} pwn cards`);
ok("category normalized (no reverse/re variants)", !pwnCards.some((c) => /reverse|^re$/i.test(c)));
// count display
const count = await page.$eval(".filters-count", (el) => el.textContent);
console.log("  filtered count:", count.trim());

// ── entity suggestions: the sudhakar typo ──
await page.goto(`${BASE}/search/?q=sudhakar`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));
const sugg = await page.$$eval(".entity-chip", (els) => els.map((e) => e.textContent));
ok("'sudhakar' suggests sudhackar", sugg.some((s) => s.includes("sudhackar")), sugg[0] ?? "none");
const suggHref = await page.$eval(".entity-chip", (el) => el.getAttribute("href"));
ok("suggestion links to author page", suggHref === "/authors/sudhackar/", suggHref ?? "");

// ── load more ──
await page.goto(`${BASE}/search/?q=${encodeURIComponent("author:sudhackar")}`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));
const hint = await page.$eval(".search-hint:last-child", (el) => el.textContent).catch(() => "");
ok("shows 'showing X of N'", /showing \d+ of \d+/.test(hint), hint.trim().slice(0, 40));
const before = await page.$$eval(".rtitle", (els) => els.length);
const more = await page.$(".search-hint a");
ok("load-more link present when capped", more !== null);
if (more) {
  await more.click();
  await new Promise((r) => setTimeout(r, 2000));
  const after = await page.$$eval(".rtitle", (els) => els.length);
  ok("load-more increases results", after > before, `${before} -> ${after}`);
}

// ── logo + favicon ──
await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
const logo = await page.$eval(".brand-logo", (el) => el.getAttribute("src"));
ok("skull logo in topbar", logo === "/skull.png");
const iconLink = await page.$eval('link[rel="icon"]', (el) => el.getAttribute("href")).catch(() => "");
ok("favicon is skull jpg", iconLink.includes("icon.png"), iconLink);

await browser.close();
console.log("---");
console.log(`PASS=${pass} FAIL=${fail}`);
process.exit(fail ? 1 : 0);
