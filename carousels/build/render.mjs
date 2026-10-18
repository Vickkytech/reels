// Renders every carousel in content.json to 1080x1350 PNGs.
// Usage: node render.mjs [brandSlug] [carouselNumber]
// Each brand picks its template (brand.template, default template.html); only
// Victoria Innocent uses the founder-photo template.
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
const PHOTOS = 11;
// Crop focus for the full-bleed cover, per photo: puts each face about a quarter of the way down.
const FOCUS = ["50% 0%", "50% 0%", "50% 50%", "50% 15%", "50% 57%", "50% 53%", "50% 70%", "50% 70%", "50% 41%", "50% 53%", "50% 22%"];
const pad2 = (x) => String(x).padStart(2, "0");
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
let loaded = "";

const issues = [];
for (const [b, entry] of content.entries()) {
  const brand = brands[entry.name];
  if (onlyBrand && brand.slug !== onlyBrand) continue;
  const template = brand.template || "template.html";
  if (template !== loaded) {
    await page.goto(pathToFileURL(path.join(here, template)).href);
    await page.evaluate(() => document.fonts.ready);
    loaded = template;
  }
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
        // Covers cycle: sticker on brand colour, full-bleed photo, sticker on light.
        format: ["sticker", "full", "sticker"][(c.num - 1) % 3],
        scheme: (c.num - 1) % 3 === 2 ? "b" : "a",
        teaser: brand.bold?.teasers?.[(c.num - 1) % brand.bold.teasers.length],
        photo: `photo-${pad2(((c.num - 1) % PHOTOS) + 1)}.jpg`,
        focus: FOCUS[(c.num - 1) % PHOTOS],
        sticker: `sticker-${pad2(((c.num - 1) % PHOTOS) + 1)}.png`,
        closer: `sticker-${pad2(((c.num + 4) % PHOTOS) + 1)}.png`,
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
