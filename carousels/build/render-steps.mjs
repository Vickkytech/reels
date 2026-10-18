// Renders the 7-slide "practical steps" briefs (currently Leverage AI Studio) to 1080x1350 PNGs.
// Usage: node render-steps.mjs [carouselNumber]
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brands } from "./brands.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"));

const here = path.dirname(fileURLToPath(import.meta.url));
const brand = brands["Leverage AI Studio"];
const handle = "@leverageaistudio";
const outDir = path.resolve(here, "..", brand.slug);
const carousels = JSON.parse(fs.readFileSync(path.join(here, "leverage-steps.json"), "utf8"));
const [onlyNum] = process.argv.slice(2);

// Brand colours from the logo; each slide takes the next theme, so cover colours alternate between posts.
const THEMES = [
  { bg: "#0B1A36", fg: "#FFFFFF", accent: "#7FB3AA", muted: "rgba(255,255,255,.78)", card: "rgba(255,255,255,.08)", whiteLogo: true },
  { bg: "#4F7D78", fg: "#FFFFFF", accent: "#0B1A36", muted: "rgba(255,255,255,.88)", card: "rgba(11,26,54,.22)", whiteLogo: true },
  { bg: "#EEEDEB", fg: "#0B1A36", accent: "#3F6D68", muted: "#3D4A5E", card: "#FFFFFF" },
];

const smarten = (t) => t.replace(/"([^"]*)"/g, "“$1”").replace(/'/g, "’");
const slugify = (s) => {
  const slug = s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug.length <= 48 ? slug : slug.slice(0, 49).replace(/-[^-]*$/, "");
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(path.join(here, "template-steps.html")).href);
await page.evaluate(() => document.fonts.ready);

const issues = [];
const captions = [];
for (const c of carousels) {
  const num = String(c.num).padStart(2, "0");
  captions.push(`## ${num}. ${c.title} [${c.pillar}]\n\n${c.slides[0].head} ${c.slides[0].body}\n`);
  if (onlyNum && Number(onlyNum) !== c.num) continue;
  const carousel = {
    ...c,
    title: smarten(c.title),
    slides: c.slides.map((s) => ({ head: smarten(s.head), body: smarten(s.body) })),
  };
  const dir = path.join(outDir, `${num}-${slugify(c.title)}`);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < c.slides.length; i++) {
    const theme = THEMES[(c.num - 1 + i) % THEMES.length];
    const res = await page.evaluate((d) => window.render(d), { brand, carousel, index: i, handle, theme });
    if (res.overflow) issues.push(`${num} slide ${i + 1} overflows`);
    await page.screenshot({ path: path.join(dir, `slide-${String(i + 1).padStart(2, "0")}.png`) });
  }
}
fs.writeFileSync(
  path.join(outDir, "captions.md"),
  `# Leverage AI Studio (${handle}) caption starters\n\nThe brief has no captions; these reuse each cover's hook.\n\n${captions.join("\n")}`,
);
await browser.close();
console.log(issues.length ? issues.join("\n") : "no overflow");
