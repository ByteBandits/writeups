import puppeteer from "puppeteer-core";
const B = process.env.BASE ?? "http://localhost:8091/writeups";
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
await browser.defaultBrowserContext().overridePermissions("http://localhost:8091", ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
const res = []; const check = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clip = () => page.evaluate(() => navigator.clipboard.readText());
const fileText = (u) => page.evaluate((u) => fetch(u).then((r) => r.text()), u);
const reset = () => page.evaluate(() => navigator.clipboard.writeText("__empty__"));

// 1. attachments panel
await page.goto(`${B}/csaw-quals-2023/rev/rox/sudhackar/`, { waitUntil: "networkidle0" });
const names = await page.$$eval(".attachments .attach .file", (e) => e.map((x) => x.tagName + ":" + x.textContent.trim()));
const pyIdx = names.findIndex((n) => n.startsWith("BUTTON") && n.includes(".py"));
check("panel has a .py attachment", pyIdx >= 0, JSON.stringify(names.slice(0, 6)));
await (await page.$$(".attachments .attach .file"))[pyIdx].click(); await wait(400);
const panelUrl = await page.$eval(".attachments .attachview .av-dl", (a) => a.getAttribute("href"));
const order = await page.$$eval(".attachments .attachview-head > *", (e) => e.map((x) => x.className));
check("panel: copy sits just before download", order.join(" ").includes("av-copy av-dl"), order.join(" "));
await reset(); await page.click(".attachments .attachview .av-copy"); await wait(700);
check("panel: clipboard == exact file bytes", (await clip()) === (await fileText(panelUrl)), panelUrl);
check("panel: shows copied!", (await page.$eval(".attachments .av-copy", (b) => b.textContent)) === "copied!");
await wait(1400);
check("panel: label resets", (await page.$eval(".attachments .av-copy", (b) => b.textContent)) === "⧉ copy");

// 2. inline file link expanded in place
await page.click(".content a.filelink[data-file]"); await wait(500);
const inlineUrl = await page.$eval(".content .attachview .av-dl", (a) => a.getAttribute("href"));
await reset(); await page.click(".content .attachview .av-copy"); await wait(700);
check("inline expand: clipboard == exact file bytes", (await clip()) === (await fileText(inlineUrl)), inlineUrl);

// 3. build-time ![](file) embed — no real writeup uses one yet; set EMBED_PAGE=<route> to a page that does
if (process.env.EMBED_PAGE) {
  await page.goto(`${B}${process.env.EMBED_PAGE}`, { waitUntil: "networkidle0" }); await wait(400);
  check("embed: no duplicate floating copy button", (await page.$$(".fileembed .copybtn")).length === 0);
  const u = await page.$eval(".fileembed .av-copy", (b) => b.dataset.copy);
  await reset(); await page.click(".fileembed .av-copy"); await wait(700);
  check("embed: clipboard == exact file bytes", (await clip()) === (await fileText(u)), u);
}
// 4. binary (hex) preview: no copy
await page.goto(`${B}/csaw-finals-2016/reverse/rev250/sudhackar/`, { waitUntil: "networkidle0" });
await page.click('.content a.filelink[data-file$="packer-release"]'); await wait(500);
const kind = await page.$eval(".content .attachview .av-kind", (e) => e.textContent);
check("binary/hex preview has no copy button", kind.startsWith("binary") && (await page.$$(".content .attachview .av-copy")).length === 0, kind);
// code blocks in prose keep their own copy button
await page.goto(`${B}/csaw-quals-2023/rev/rox/sudhackar/`, { waitUntil: "networkidle0" });
check("prose code blocks keep floating copy", (await page.$$(".content figure .copybtn, .content > pre .copybtn")).length > 0);

check("no page JS errors", errs.length === 0, errs.join(" | "));
console.log(res.join("\n")); console.log(`\n${res.filter((r) => r.startsWith("PASS")).length}/${res.length} passed`);
await browser.close();
