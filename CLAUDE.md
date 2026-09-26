# Gym Tracker

Mobile-first workout tracker (React 18 + TypeScript + Vite), used by Dan on his iPhone at the gym via GitHub Pages: https://daniel-hirst.github.io/gym-tracker/

## Weekly programme updates (the main recurring task)

Dan's loop: he trains with the app, taps "copy session for claude pt", pastes it into his
Claude PT chat, and the PT gives him next week's programme. He then pastes that programme
here and expects the app updated.

When Dan pastes a new week/programme:

1. Edit the `DAYS` array in `src/plan.ts` — it holds every day's exercises with
   per-block prescriptions (`b` = [Block 1, Block 2, Block 3, Deload], each
   `{s: sets, r: reps, w: weight string}`; `rest` in seconds; `t` = target RPE).
   There is also a `CYCLE` constant shown in the header and session exports — bump it
   when the PT starts a new cycle.
2. There is no version to bump: `PLAN_VERSION` is a hash of the prescriptions, so any
   change to names/sets/reps/weights/rest/RPE rebuilds the plan on his phone. Rebuilding
   keeps PBs, history and in-app edits the PT didn't override, saves any unfinished
   ticked day to history, and resets ticks and notes.
3. If he's moving to a new block, also change `CURRENT_BLOCK` (0=Block 1, 1=Block 2,
   2=Block 3, 3=Deload).
3b. If he reports tested 1RMs, add/update them in the `TESTED_1RMS` map (same file,
   keyed by exercise name, with the test date). Newer dates win over in-app entries.
   1RM-only changes don't trigger a plan rebuild.
4. Deploy by pushing to `main` — the GitHub Actions workflow (`.github/workflows/deploy.yml`)
   builds and publishes to `gh-pages`. One command:
   `npm run build && git commit -am "..." && git push`
   (the local build is the fast gate: type check + unit tests + Vite build). Do NOT push
   to `gh-pages` yourself — a second push cancels the workflow's Pages build and emails
   Dan a failure. Dan values speed.
5. Verify the live page in the BACKGROUND (Monitor watching for the new bundle
   filename) and tell him it's deployed straight away — only follow up if the
   deploy actually fails. Never block the reply on Pages, which can take 10+ min.

## Commands

- `npm run dev -- --host` — dev server reachable from his phone on home Wi-Fi
- `npm run build` — `tsc --noEmit`, `vitest run`, then `vite build`
- `npm test` — unit tests in watch mode (`src/logic.test.ts` covers plan rebuild/carry-over,
  session archiving, session length and the plate calculator)
- Deploying = pushing to `main` (see step 4)

## Gotchas

- GitHub Pages builds sometimes stick on "building" for 10+ min. If truly stuck,
  nudge ONCE with `gh api -X POST repos/Daniel-hirst/gym-tracker/pages/builds`,
  then poll patiently (30s+ intervals, several minutes). NEVER nudge in a loop:
  each POST cancels the in-progress build, which shows up as cancelled/failed
  "pages build and deployment" workflow runs and emails Dan "some jobs were not
  successful". Always verify the live page serves the new bundle filename after
  deploying.
- Dan's iPhone home-screen app caches aggressively. A network-first service worker
  (public/sw.js, registered in main.tsx, prod only) forces fresh HTML on every
  launch and provides full offline fallback. The app footer shows a
  `build <timestamp>` stamp (injected via `__BUILD_STAMP__` in vite.config.js) —
  if his phone misbehaves after a deploy, first check whether that stamp is stale.
  Fix order: force-quit and reopen → refresh in Safari → remove/re-add the icon.
- Only the icon and name are baked in when he adds it to the home screen; code
  updates flow automatically on next open with a connection.

- Vite `base` is `/gym-tracker/` — all local/deployed URLs need that path suffix.
- All user data (state, history, PBs) lives in `localStorage` on the phone; there is
  no backend. Never suggest changes that would wipe it without a backup path.
- `@types/react` is pinned to v18 to match React 18.
