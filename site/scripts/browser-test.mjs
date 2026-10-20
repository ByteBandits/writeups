// Real browser tests via puppeteer-core + system Chrome.
// Usage: node scripts/browser-test.mjs
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

const consoleErrors = [];

async function newPage() {
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  return page;
}

// 1. /search page with URL query
{
  const page = await newPage();
  await page.goto(`${BASE}/search/?q=heap`, { waitUntil: "networkidle0" });
  const found = await page
    .waitForSelector(".rtitle", { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  ok("/search?q=heap renders results", found);
  if (found) {
    const titles = await page.$$eval(".rtitle", (els) => els.map((e) => e.textContent));
    console.log("  titles:", titles.slice(0, 4).join(" | "));
    ok("result links point to writeups", titles.some((t) => /heap/i.test(t)));
  }
  await page.close();
}

// 3. /search with filter syntax
{
  const page = await newPage();
  await page.goto(`${BASE}/search/?q=${encodeURIComponent("tag:z3")}`, {
    waitUntil: "networkidle0",
  });
  const found = await page
    .waitForSelector(".rtitle", { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  ok("/search?q=tag:z3 renders results", found);
  if (found) {
    const chips = await page.$$eval(".rmeta", (els) =>
      els.map((e) => e.textContent).join(" ")
    );
    ok("tag:z3 results carry z3 chip", chips.includes("z3"));
  }
  await page.close();
}

// 4. hero search on home (type for real)
{
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
  await page.click(".bigsearch input");
  await page.type(".bigsearch input", "heap", { delay: 30 });
  const found = await page
    .waitForSelector(".hero .rtitle", { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  ok("hero search: typing shows dropdown results", found);
  await page.close();
}

// 5. cmd+k palette on a writeup page
{
  const page = await newPage();
  await page.goto(`${BASE}/writeups/csaw-quals-2023/pwn/super_secure_heap/sudhackar/`, {
    waitUntil: "networkidle0",
  });
  await page.keyboard.down("Meta");
  await page.keyboard.press("k");
  await page.keyboard.up("Meta");
  const opened = await page
    .waitForSelector(".palette input", { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  ok("cmd+k opens palette", opened);
  if (opened) {
    await page.type(".palette input", "tcache", { delay: 30 });
    const found = await page
      .waitForSelector(".palette .rtitle", { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    ok("palette search returns results", found);
  }
  await page.close();
}

// 6. copy button injection on writeup code blocks
{
  const page = await newPage();
  await page.goto(`${BASE}/writeups/csaw-finals-2016/reverse/rev250/sudhackar/`, {
    waitUntil: "networkidle0",
  });
  const btns = await page.$$(".copybtn");
  ok("copy buttons injected on code blocks", btns.length > 0, `${btns.length} blocks`);
  await page.close();
}

// 7. inline file link expands viewer in place
{
  const page = await newPage();
  await page.goto(`${BASE}/writeups/csaw-finals-2016/reverse/rev250/sudhackar/`, {
    waitUntil: "networkidle0",
  });
  const hasLink = (await page.$("a.filelink[data-file]")) !== null;
  ok("inline file link tagged", hasLink);
  if (hasLink) {
    await page.click("a.filelink[data-file]");
    const view = await page
      .waitForSelector(".attachview", { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    ok("click expands viewer in place", view);
    const hasHex = (await page.$(".attachview .hexdump")) !== null;
    ok("binary renders hexdump", hasHex);
    const dl = await page.$eval(".attachview .av-dl", (a) => a.getAttribute("href"));
    ok("viewer keeps download link", !!dl && dl.includes("/content/"));
    // toggle closed
    await page.click("a.filelink[data-file]");
    const closed = await page
      .waitForSelector(".attachview", { timeout: 1500 })
      .then(() => false)
      .catch(() => true);
    ok("second click collapses viewer", closed);
  }
  await page.close();
}

// 8. attachment chip renders source inline
{
  const page = await newPage();
  await page.goto(`${BASE}/writeups/csaw-quals-2023/pwn/super_secure_heap/sudhackar/`, {
    waitUntil: "networkidle0",
  });
  const chip = await page.$(".attachments .file");
  ok("attachment chips present", chip !== null);
  if (chip) {
    await chip.click();
    const view = await page
      .waitForSelector(".attachview", { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    ok("chip click renders attachment inline", view);
  }
  await page.close();
}

await browser.close();

const realErrors = consoleErrors.filter(
  (e) => !/favicon|Download the React DevTools/i.test(e)
);
ok("no console errors across pages", realErrors.length === 0);
if (realErrors.length) console.log("  errors:", [...new Set(realErrors)].slice(0, 5).join("\n  "));

console.log("---");
console.log(`PASS=${pass} FAIL=${fail}`);
process.exit(fail ? 1 : 0);
