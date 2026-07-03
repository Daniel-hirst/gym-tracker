# Gym Tracker

Mobile-first workout tracker (React 18 + TypeScript + Vite), used by Dan on his iPhone at the gym via GitHub Pages: https://daniel-hirst.github.io/gym-tracker/

## Weekly programme updates (the main recurring task)

Dan's loop: he trains with the app, taps "copy session for claude pt", pastes it into his
Claude PT chat, and the PT gives him next week's programme. He then pastes that programme
here and expects the app updated.

When Dan pastes a new week/programme:

1. Edit the `DAYS` array at the top of `src/GymTracker.tsx` — it holds every day's
   exercises with per-block prescriptions (`b` = [Block 1, Block 2, Block 3, Deload],
   each `{s: sets, r: reps, w: weight string}`; `rest` in seconds).
2. Bump `PLAN_VERSION` by 1 (same file, just above `DAYS`) — phones only rebuild the
   plan when it or `CURRENT_BLOCK` changes. Rebuilding keeps PBs and history but resets
   ticks, notes and any in-app weight edits, so it should happen at week boundaries.
3. If he's moving to a new block, also change `CURRENT_BLOCK` (0=Block 1, 1=Block 2,
   2=Block 3, 3=Deload).
4. Deploy with `npm run deploy` (runs the type check, builds, force-pushes `dist/` to
   the `gh-pages` branch). Commit and push the source change to `main` too.
5. Verify the live page serves the new bundle filename before telling him it's done.

## Commands

- `npm run dev -- --host` — dev server reachable from his phone on home Wi-Fi
- `npm run build` — `tsc --noEmit` then `vite build`
- `npm run deploy` — build + publish to GitHub Pages

## Gotchas

- GitHub Pages builds sometimes stick on "building" for 10+ min. Nudge with
  `gh api -X POST repos/Daniel-hirst/gym-tracker/pages/builds`, then re-poll.
  Always verify the live page serves the new bundle filename after deploying.
- Dan's iPhone home-screen app caches aggressively. The app footer shows a
  `build <timestamp>` stamp (injected via `__BUILD_STAMP__` in vite.config.js) —
  if his phone misbehaves after a deploy, first check whether that stamp is stale.
  Fix order: force-quit and reopen → refresh in Safari → remove/re-add the icon.
- Only the icon and name are baked in when he adds it to the home screen; code
  updates flow automatically on next open with a connection.

- Vite `base` is `/gym-tracker/` — all local/deployed URLs need that path suffix.
- All user data (state, history, PBs) lives in `localStorage` on the phone; there is
  no backend. Never suggest changes that would wipe it without a backup path.
- `@types/react` is pinned to v18 to match React 18.
