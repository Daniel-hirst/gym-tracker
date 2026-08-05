# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dan is the only user today — he trains a 5-day split (Push, Pull, Upper, Arms, Legs) across periodised training blocks and uses the app on his iPhone at the gym, mid-workout. He's open to letting other people run their own copy in future (their own device-local plan and data), but that's not built or designed yet — no shared accounts or backend are planned.

## Product Purpose

A mobile-first workout tracker that replaces a paper log or notes app at the gym: it presents the day's prescribed exercises (sets/reps/weight/RPE/rest) so Dan can tick sets off, adjust weights/reps mid-session, get automatic PB detection, and build a session history — all without a login or backend. It's one half of a tight loop with a separate "Claude PT" chat: Dan copies a finished session out of the app and pastes it into that chat for coaching feedback, then pastes the next week's programme back in for Claude Code to encode into the app.

## Positioning

Not a market product — personal software built to fit Dan's specific periodised programme exactly, with zero setup friction (no login, no cloud sync, works fully offline, installs like a native app via PWA). Its edge over generic fitness-tracking apps is that the plan itself is hand-tuned every week by a real coaching loop (the PT chat), not a generic template.

## Operating Context

- Used standing at the gym, mid-set, often one-handed — interactions need to be fast and forgiving, not desk-app precise.
- Installed to the iPhone home screen as a PWA; a network-first service worker (`public/sw.js`) forces fresh HTML per launch and provides full offline fallback.
- Weekly update ritual: Dan pastes a new programme from his "Claude PT" chat; an agent edits `DAYS`/`PLAN_VERSION`/`CURRENT_BLOCK` (and optionally `TESTED_1RMS`) in `src/GymTracker.tsx`, then deploys via `npm run deploy` (builds and force-pushes `dist/` to `gh-pages`).
- No backend: all state, history, and PBs live in the phone's `localStorage`. JSON export/import is the only backup/transfer path.
- iPhone home-screen caching is aggressive; a `build <timestamp>` footer stamp exists specifically so staleness after a deploy is diagnosable.

## Capabilities and Constraints

- 5-day training split (Push, Pull, Upper, Arms, Legs) across periodised blocks (Block 1 → 2 → 3 → Deload).
- Set ticking, rest timers tuned per exercise, mid-session weight/rep edits, RPE + notes per exercise, automatic PB detection, session history (duration, volume, sets), safe-delete with tap-to-undo, "restore from plan" recovery.
- Single source of truth for the plan is the `DAYS` array in `src/GymTracker.tsx`. Bumping `PLAN_VERSION` rebuilds the plan (keeps PBs/history, resets ticks/notes) — a deliberate boundary, not a bug.
- No backend, no accounts today. Multi-user (others running their own independent copy) is an explicitly open future option, not yet designed for.
- Tech is fixed by the existing codebase: React 18 + TypeScript (strict) + Vite 6, no other runtime dependencies, inline styling, deployed to GitHub Pages.

## Evidence on Hand

- Live app: https://daniel-hirst.github.io/gym-tracker/
- Full current feature list and local dev/deploy instructions: `README.md`
- Weekly update procedure, deploy chain, and known gotchas: `CLAUDE.md`

## Product Principles

1. Zero friction at the gym — every interaction should work one-handed, mid-set, without waiting on a network.
2. The plan is a living document, not a static template — it changes weekly via the PT-chat loop, and the app should make that update cheap and safe.
3. Local-first by default — no backend, exportable state, resilient to the phone's own aggressive caching.
4. Solo-tuned today, but don't foreclose a future where other people run their own independent copy.

## Accessibility & Inclusion

No formal accessibility standard established. Single known user (Dan) on iPhone Safari; not evaluated for other assistive needs.
