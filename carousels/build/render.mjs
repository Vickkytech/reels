// Renders every carousel in content.json to 1080x1350 PNGs.
// Usage: node render.mjs [brandSlug] [carouselNumber]
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brands } from "./brands.mjs";

const require = createRequire(import.meta.url);
const globalRoot = execSync("npm root -g").toString().trim();
const { chromium } = require(path.join(globalRoot, "playwright"));

const here = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.resolve(here, "..");
const content = JSON.parse(fs.readFileSync(path.join(here, "content.json"), "utf8"));
const [onlyBrand, onlyNum] = process.argv.slice(2);

// Typographic quotes for display text.
const smarten = (t) => t.replace(/"([^"]*)"/g, "\u201C$1\u201D").replace(/'/g, "\u2019");

const slugify = (s) => {
  const slug = s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug.length <= 48 ? slug : slug.slice(0, 49).replace(/-[^-]*$/, "");
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, "template.html")).href);
await page.evaluate(() => document.fonts.ready);

const issues = [];
for (const entry of content) {
  const brand = brands[entry.name];
  if (onlyBrand && brand.slug !== onlyBrand) continue;
  const captions = [];
  for (const c of entry.carousels) {
    const num = String(c.num).padStart(2, "0");
    captions.push(`## ${num}. ${c.title}\n\n${c.caption}\n`);
    if (onlyNum && Number(onlyNum) !== c.num) continue;
    const dir = path.join(outRoot, brand.slug, `${num}-${slugify(c.title)}`);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < c.slides.length; i++) {
      const res = await page.evaluate((d) => window.render(d), {
        brand,
        slides: c.slides.map(smarten),
        index: i,
        handle: entry.handle,
      });
      if (res.overflow) issues.push(`${brand.slug} ${num} slide ${i + 1} overflows`);
      await page.screenshot({ path: path.join(dir, `slide-${String(i + 1).padStart(2, "0")}.png`) });
    }
  }
  fs.writeFileSync(
    path.join(outRoot, brand.slug, "captions.md"),
    `# ${entry.name} (${entry.handle}) captions\n\n${captions.join("\n")}`,
  );
  console.log(`rendered ${brand.slug}`);
}
await browser.close();
console.log(issues.length ? issues.join("\n") : "no overflow");
