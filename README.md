# 💪 Gym Tracker

A mobile-first workout tracker built with React + Vite. Follows a 5-day training split across periodised blocks, with set ticking, rest timers, PB detection and session history — all stored locally on your device, no account or backend needed.

**Live app:** https://daniel-hirst.github.io/gym-tracker/

## Features

- **5-day split** — Push, Pull, Upper, Arms and Legs days, each with a pre-built exercise plan
- **Training blocks** — Block 1 → 2 → 3 → Deload, with sets, reps and weights that progress per block. The active block is set by the `CURRENT_BLOCK` constant at the top of [src/GymTracker.tsx](src/GymTracker.tsx) — change it and redeploy to move to the next block (PBs carry over, ticks reset)
- **Set tracking** — tick sets off as you go, adjust weights and reps mid-session
- **Rest timer** — automatic countdown after each completed set, tuned per exercise
- **PB detection** — flags a personal best when you tick off a heavier top set
- **RPE + notes** — rate each exercise's difficulty and jot down notes
- **Session history** — finish a session to save duration, volume and every set to history
- **Safe deletes** — deleting an exercise shows a tap-to-undo toast, and a "restore from plan" button re-adds any plan exercise that's gone missing
- **Export / import** — back up all data as JSON and restore it on another device
- **PWA-ready** — add it to your phone's home screen and it runs like a native app

All data persists in `localStorage`, so it survives closing the browser but stays private to your device.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173/gym-tracker/

To try it on your phone while developing, expose the dev server to your network and open the "Network" URL it prints (phone must be on the same Wi-Fi):

```bash
npm run dev -- --host
```

## Deploying

The app deploys to GitHub Pages from the `gh-pages` branch:

```bash
npm run deploy
```

This builds the app and force-pushes the `dist/` output to `gh-pages`. The Vite `base` is set to `/gym-tracker/` in [vite.config.js](vite.config.js) to match the Pages URL.

## Tech

- [React 18](https://react.dev/) — UI
- [TypeScript](https://www.typescriptlang.org/) — strict mode, checked as part of `npm run build`
- [Vite 6](https://vite.dev/) — dev server and build
- No other runtime dependencies — styling is inline, state lives in `localStorage`
