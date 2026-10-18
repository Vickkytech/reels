# Brand carousels

105 Instagram carousels (15 per brand × 7 brands), 5 slides each, 1080×1350 PNG.
Copy comes from *105 Brand Carousels – Natural & Conversational* (October 2026); slide 1 is each carousel's title.

| Brand | Folder | Handle |
| --- | --- | --- |
| Victoria Innocent | `victoria-innocent/` | @thevictoriainnocent |
| PAVA | `pava/` | @buildwithpava |
| SmartFinanceVic | `smartfinancevic/` | @smartfinancevic |
| Leverage AI Studio | `leverage-ai-studio/` | @leverageaistudio |
| SheEarns Initiative | `sheearns-initiative/` | @sheearnsinitiative |
| The Calming Experience | `the-calming-experience/` | @thecalmingexperience |
| Tenye Home & Fragrance | `tenye-home-and-fragrance/` | @tenyescents |

Each brand folder holds `NN-title/slide-01.png … slide-05.png` plus `captions.md`.

## Slide structure

1. Cover – title, logo, "Swipe"
2. Sound familiar? – the situation
3. Here's the thing – the insight
4. Try this – the action, in a brand-colour card
5. Remember – the takeaway on a dark slide, with "Save this for later"

## Victoria Innocent

Uses `build/template-photo.html` with Victoria's own photos (`assets/people/`, cut out with rembg
`birefnet-portrait`, then `build/prepare_photos.py`). Covers rotate between a cut-out "sticker" on
burgundy, a full-bleed photo, and a sticker on cream; inner slides alternate burgundy and cream.
These photos are used for Victoria Innocent only.

## Re-rendering

Colours are sampled from the supplied logos and live in `build/brands.mjs`; layout is `build/template.html`.

```bash
node build/render.mjs                 # everything
node build/render.mjs pava 3          # one carousel
```

`build/content.json` is the parsed copy (regenerate with `build/parse_brief.py` from a pandoc markdown export of the brief).
