// Renders a one-off carousel written as headline + short lines (see stories/*.json).
// Usage: node render-story.mjs stories/<file>.json
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brands } from "./brands.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"));

const here = path.dirname(fileURLToPath(import.meta.url));
const story = JSON.parse(fs.readFileSync(path.resolve(here, process.argv[2]), "utf8"));
const brand = brands[story.brand];
const outDir = path.resolve(here, "..", story.folder);

// Story themes add body/rule colours to the brand's rotating themes.
const THEMES = {
  "SheEarns Initiative": [
    { bg: "#1A2C4C", fg: "#FFFFFF", accent: "#E59475", muted: "rgba(255,255,255,.82)", rule: "rgba(255,255,255,.2)", askInk: "#1A2C4C", logo: "white" },
    { bg: "#B4583B", fg: "#FFFFFF", accent: "#FFE2CF", muted: "rgba(255,255,255,.92)", rule: "rgba(255,255,255,.3)", askInk: "#B4583B", logo: "white" },
    { bg: "#FBF7F0", fg: "#1A2C4C", accent: "#B4583B", muted: "#46536B", rule: "rgba(26,44,76,.15)", askInk: "#FFFFFF", logo: "color" },
  ],
}[story.brand];

const smarten = (t) => t.replace(/"([^"]*)"/g, "“$1”").replace(/'/g, "’");
const deep = (v) => (typeof v === "string" ? smarten(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === "object"
  ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(path.join(here, "template-story.html")).href);
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(outDir, { recursive: true });

// "bookends": first and last slide on the dark theme, everything between on the light one.
const themeIndex = (i) =>
  story.themeOrder === "bookends"
    ? (i === 0 || i === story.slides.length - 1 ? 0 : THEMES.length - 1)
    : i % THEMES.length;

const issues = [];
for (const [i, s] of story.slides.entries()) {
  const res = await page.evaluate((d) => window.render(d), {
    slide: deep(s), index: i, total: story.slides.length, handle: story.handle,
    theme: THEMES[themeIndex(i)], logo: brand.logo,
  });
  if (res.overflow) issues.push(`slide ${i + 1} overflows`);
  await page.screenshot({ path: path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`) });
}
fs.writeFileSync(path.join(outDir, "caption.md"), story.caption + "\n");
await browser.close();
console.log(issues.length ? issues.join("\n") : "no overflow");
