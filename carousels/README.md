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

Uses `build/template-photo.html` in plain-background mode (`themes` in `build/brands.mjs`): no photos.
Burgundy, cream and gold take turns slide by slide, so each carousel's cover colour differs from the
one before it. The closing sentence of a slide is highlighted in the accent colour.

## Re-rendering

Colours are sampled from the supplied logos and live in `build/brands.mjs`; layout is `build/template.html`.

```bash
node build/render.mjs                 # everything
node build/render.mjs pava 3          # one carousel
```

`build/content.json` is the parsed copy (regenerate with `build/parse_brief.py` from a pandoc markdown export of the brief).
