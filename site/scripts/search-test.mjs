import puppeteer from "puppeteer-core";
// serve dist under /writeups first, e.g. mkdir -p /tmp/s && ln -s "$PWD/dist" /tmp/s/writeups && (cd /tmp/s && python3 -m http.server 8091)
const B = process.env.BASE ?? "http://localhost:8091/writeups";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
const res = []; const check = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const state = () => page.evaluate(() => ({
  hrefs: [...document.querySelectorAll("a.result")].map((a) => a.getAttribute("href")),
  caps: [...document.querySelectorAll(".bigsearch .qchip")].map((c) => c.textContent.replace("×", "").trim()),
  bad: [...document.querySelectorAll(".bigsearch .qchip.bad")].length,
  input: document.querySelector(".bigsearch input")?.value,
  labels: [...document.querySelectorAll(".fdym-label")].map((s) => s.textContent.trim()),
  dym: [...document.querySelectorAll(".results .entity-row button.entity-chip")].map((c) => c.textContent.trim()),
  hints: [...document.querySelectorAll(".search-hint")].map((h) => h.textContent.trim()),
  excerpt: document.querySelector(".rexcerpt")?.textContent ?? "",
}));
const go = async (q) => { await page.goto(`${B}/search/?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle0" }); await wait(1500); return state(); };

// #1 palette Enter navigates to a real page (no double prefix)
await page.goto(`${B}/csaw-quals-2023/rev/rox/sudhackar/`, { waitUntil: "networkidle0" });
await page.keyboard.down("Meta"); await page.keyboard.press("k"); await page.keyboard.up("Meta");
await page.waitForSelector(".palette input");
await page.type(".palette input", "author:jaiverba", { delay: 20 });
await wait(1200);
await page.keyboard.press("Enter");
await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
await wait(800);
const url1 = page.url();
const h1 = await page.$eval("h1", (e) => e.textContent).catch(() => "");
check("#1 palette Enter opens writeup (single prefix, not 404)", url1.includes("/writeups/") && !url1.includes("/writeups/writeups/") && url1.includes("jaiverma") && h1 && !/404|not found/i.test(h1), `${url1} h1=${h1}`);

// #4 correction shows did-you-mean + capsule
let s = await go("author:jaiveba");
check("#4 correction: did-you-mean chip", s.labels.includes("did you mean") && s.dym.some((d) => d.includes("jaiverma")), JSON.stringify(s.labels) + JSON.stringify(s.dym));
check("#4 correction: results are jaiverma's", s.hrefs.length > 0 && s.hrefs.every((h) => h.includes("/jaiverma/")), `${s.hrefs.length}`);
check("capsule rendered inside bar", s.caps.includes("author:jaiveba") && s.input === "", JSON.stringify(s.caps) + " input=" + JSON.stringify(s.input));
await page.click(".results .entity-row button.entity-chip"); await wait(1200);
s = await state();
check("clicking did-you-mean swaps capsule, notice clears", s.caps.includes("author:jaiverma") && !s.labels.includes("did you mean"), JSON.stringify(s.caps) + JSON.stringify(s.labels));

// #2 ambiguous prefix asks instead of guessing
s = await go("author:a");
check("#2 ambiguous author:a → did-you-mean, 0 results", s.hrefs.length === 0 && s.dym.length > 1 && s.bad === 1, `${s.hrefs.length} results, dym=${JSON.stringify(s.dym)}`);

// unknown → honest zero with red capsule
s = await go("author:zzzz");
check("unknown author:zzzz → 0 results, red capsule, message", s.hrefs.length === 0 && s.bad === 1 && s.labels.some((l) => l.includes("no author")), JSON.stringify(s.labels));

// #8 case-insensitive key in did-you-mean swap
s = await go("Author:jaiveba");
check("#8 Author: (caps key) still corrects", s.hrefs.length > 0 && s.hrefs.every((h) => h.includes("/jaiverma/")), `${s.hrefs.length}`);

// #3 'author:' alone isn't searched as a word
s = await go("author:");
check("#3 bare 'author:' → no junk results", s.hrefs.length === 0 && !s.hints.some((h) => h.startsWith("no results")), JSON.stringify(s.hints));

// typing pills + backspace pops capsule
await page.goto(`${B}/search/`, { waitUntil: "networkidle0" });
await page.type(".bigsearch input", "author:sud", { delay: 25 }); await wait(1000);
await page.click(".filter-pills .entity-chip"); await wait(1000);
s = await state();
check("pill click → capsule, input cleared", s.caps.includes("author:sudhackar") && s.input === "", JSON.stringify(s.caps));
await page.type(".bigsearch input", "heap", { delay: 25 }); await wait(1200);
s = await state();
check("capsule + free text searches both", s.hrefs.length > 0 && s.hrefs.every((h) => h.includes("/sudhackar/")), `${s.hrefs.length}`);
for (let i = 0; i < 5; i++) await page.keyboard.press("Backspace");
await wait(300);
s = await state();
check("backspace on empty input pops capsule into input", s.caps.length === 0 && s.input === "author:sudhackar", JSON.stringify(s.input));

// #10 excerpts start with prose, no breadcrumb/chip junk
s = await go("author:jaiverma");
check("#10 excerpt has no breadcrumb/chip junk", !s.excerpt.startsWith("~/") && !/revjaiverma|tu-ctf-2018rev/.test(s.excerpt), s.excerpt.slice(0, 90));
// free-text author still searchable after ignoring byline
s = await go("gjain");
check("free-text 'gjain' still finds gjain-7's writeups", s.hrefs.some((h) => h.includes("gjain-7")), `${s.hrefs.length}`);

// #5 hero: filter-only query opens dropdown
await page.goto(`${B}/`, { waitUntil: "networkidle0" });
await page.click("#hero-search"); await page.type("#hero-search", "author:jaiverma ", { delay: 20 }); await wait(1300);
const heroN = await page.$$eval(".hero a.result, a.result", (a) => a.length);
check("#5 hero shows results for filter-only query", heroN > 0, `${heroN}`);

// links everywhere: single prefix + clicking a result works
s = await go("gdb");
check("result hrefs single prefix", s.hrefs.every((h) => h.startsWith("/writeups/") && !h.startsWith("/writeups/writeups/")), s.hrefs[0]);
await page.click("a.result"); await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {}); await wait(500);
check("clicking result opens writeup", !page.url().includes("/writeups/writeups/") && !page.url().includes("/search/"), page.url());
await page.goto(`${B}/browse/`, { waitUntil: "networkidle0" });
const cards = await page.$$eval(".wcard", (e) => e.map((x) => x.getAttribute("href")));
check("browse card hrefs single prefix", cards.length > 100 && cards.every((h) => h.startsWith("/writeups/") && !h.startsWith("/writeups/writeups/")), cards[0]);
await page.click(".wcard"); await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {}); await wait(500);
check("clicking browse card opens writeup", !page.url().endsWith("/browse/"), page.url());


// option A: FILTER BY key row on focus; click a key -> value pills; category row gone
await page.goto(`${B}/search/`, { waitUntil: "networkidle0" }); await wait(800);
let keys = await page.$$eval(".filter-keys .entity-chip", (e) => e.map((x) => x.textContent.trim()));
check("FILTER BY row shows all 6 keys on focus", keys.join(" ") === "tag: author: ctf: category: tool: technique:", JSON.stringify(keys));
await page.click(".filter-keys .entity-chip:nth-child(4)"); await wait(1000);
s = await state();
const vals = await page.$$eval(".filter-pills .entity-chip", (e) => e.map((x) => x.textContent.trim()));
check("click category: -> input 'category:' + value pills", s.input === "category:" && vals.length > 3 && vals.every((v) => v.startsWith("category:")), JSON.stringify(vals));
await page.goto(`${B}/`, { waitUntil: "networkidle0" });
const catRow = await page.$$(".hero .chips");
check("home category chip row removed", catRow.length === 0);
const ph = await page.$eval("#hero-search", (i) => i.placeholder);
check("hero placeholder plain words", ph === "search writeups — heap, z3, sudhackar…", ph);
await page.click("#hero-search"); await wait(500);
keys = await page.$$eval(".filter-keys .entity-chip", (e) => e.length);
check("hero shows FILTER BY when empty", keys === 6, `${keys}`);
await page.keyboard.down("Meta"); await page.keyboard.press("k"); await page.keyboard.up("Meta");

check("no page JS errors", errs.length === 0, errs.join(" | "));
console.log(res.join("\n")); console.log(`\n${res.filter((r) => r.startsWith("PASS")).length}/${res.length} passed`);
await browser.close();
