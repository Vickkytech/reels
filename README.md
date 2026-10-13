# Reels (Remotion)

Video project for editing She Earns Initiative reels with [Remotion](https://www.remotion.dev/docs).
Kept in its own private repository, separate from the She Earns Initiative website.

- Format: **1080×1920, 30 fps** (vertical reel) — set in `src/Root.tsx`
- `src/TestReel.tsx` — sample: animated headline, SVG icon, fade transition

## Commands

```bash
npm install
npm run dev       # open Remotion Studio to preview/edit
npm run render    # render TestReel to out/test-reel.mp4
npx remotion render <CompositionId> out/<name>.mp4
npm run lint      # eslint + tsc
```

To add a new reel, create a component in `src/` and register another
`<Composition>` in `src/Root.tsx` using the `REEL_WIDTH`/`REEL_HEIGHT`/`REEL_FPS` constants.

Rendered files go to `out/` (git-ignored). Put media you import (music, clips, logos) in `public/`
and reference them with `staticFile()`.

Remotion is free for individuals and teams of up to 3; larger companies need a
[company license](https://www.remotion.pro/license).

## Agent skills

The official Remotion skills are installed in `.claude/skills/` (tracked by `skills-lock.json`).
Update them with `npx skills update`.
