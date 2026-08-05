---
target: src/GymTracker.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-05T12-54-18Z
slug: src-gymtracker-tsx
---
Method: dual-agent (A: a40405b14f10298ba · B: af245e6cb62a133d8)

Note: browser visualization was attempted by both assessments but failed at the tooling level — Playwright's Chromium binary is not installed in this environment (`Chromium distribution 'chrome' is not found at /Applications/Google Chrome.app/...`). No tab was ever opened, so no live screenshots, no detector overlay injection, and no console evidence exist for this run. Both assessments fell back to full source review (GymTracker.tsx, PRODUCT.md, DESIGN.md) plus, for Assessment B, the deterministic CLI scan. No `[Human]` browser overlay is available this run.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `finishSession`/`resetDay` route through native `window.confirm()` (GymTracker.tsx:560, 572) — an OS dialog in a totally different visual language than the rest of the app |
| 2 | Match Between System and Real World | 3 | Gym vocabulary fits precisely, but "e1RM"/Epley estimate is never explained anywhere in the UI |
| 3 | User Control and Freedom | 3 | Exercise delete has a 6s tap-to-undo (lines 521-541); `resetDay()` (559-563) has none |
| 4 | Consistency and Standards | 3 | Two simultaneous delete affordances on one exercise card — the ✕ icon (line 776) and the "del" button (line 849) |
| 5 | Error Prevention | 2 | `restore()` (592-600) overwrites all history/PBs from pasted text with **zero** confirmation — the only destructive action in the app that skips the confirm pattern |
| 6 | Recognition Rather Than Recall | 3 | `lastTime()` inline hint ("↩ last: 80kg×10 · try 82.5kg ↗") removes almost all cross-session recall |
| 7 | Flexibility and Efficiency of Use | 2 | No bulk "complete all sets"; every set needs an individual tap despite the product's own "one-handed, mid-set" principle |
| 8 | Aesthetic and Minimalist Design | 3 | "Night Session" restraint mostly holds, but an expanded exercise card stacks 6+ info/control zones with no section breaks |
| 9 | Error Recovery | 2 | Failure toasts ("Copy failed", "Couldn't read that backup") name the failure but give no reason or next step |
| 10 | Help and Documentation | 1 | Zero in-app guidance anywhere (no tooltip on e1RM, no explanation of why ticks reset on a plan-version bump) — fine for the author today, but the product explicitly leaves the door open to others running their own copy |
| **Total** | | **25/40** | **Acceptable (62.5%)** |

## Design Specificity Verdict

**LLM assessment:** Grounded, not category-interchangeable. The underlying patterns (card list, grids, pill toggles, line chart) are ordinary, but nearly everything the user actually touches is shaped by this specific programme and workflow: the barbell-only warm-up ramp, PB detection restricted to plain-kg weights so "Stack 7"/"Band"/bodyweight entries can't false-positive, and — the clearest tell — `copySession()`, which formats a full session into plain text tuned for pasting into a separate "Claude PT" coaching chat. No generic fitness app ships that bridge. Weakest point: the Progress screen's chart/stat-tile/toggle trio reads close to generic analytics-dashboard furniture.

**Deterministic scan:** `detect.mjs --json` on `src/GymTracker.tsx` exited **2** with **11 findings**: 2 `layout-transition` warnings (width-transitioning progress bar and rest-timer bar, lines 713 and 1065 — real layout-thrash risk) and 9 `design-system-color` advisories flagging hex/rgba values used in the code but absent from DESIGN.md's token list (`#6ee7b7`, `#f59e0b`, `#000`, `#fca5a5`, `#7dd3fc`, and two `rgba(0,0,0,0.4)` shadow values). Assessment B cross-checked every flagged line against the source and DESIGN.md directly — **zero false positives**; these are genuine gaps where DESIGN.md's token set didn't fully capture colors the running code actually uses (mostly gradient second-stops and one shared shadow value).

**Visual overlays:** Not available this run — Playwright's Chromium binary isn't installed in this environment, so no tab was ever opened and no console/overlay evidence exists. Re-run after `npx playwright install chrome` for real browser-based evidence.

## Overall Impression

The app is more specifically "designed" than most solo side projects ever bother to be — the color/glow system is disciplined and the PT-chat bridge is genuinely clever. But the polish is uneven along one clear fault line: everything that's a *recurring, low-stakes* interaction (ticking a set, tapping a day tab, seeing a PB) is excellent, while the *rare, high-stakes* interactions (finishing a session, resetting a day, restoring a backup) fall back to unstyled browser primitives with little to no safety net. The single biggest opportunity is closing that gap — particularly around `restore()`, which is both the app's only safety net and its biggest risk.

## What's Working

1. **PB detection + celebration** (`togSet`, lines 461-491) — automatic, zero-extra-tap, multi-sensory (glow + ascending 3-tone beep + haptic), reserved exclusively for a genuinely rare event. Exactly matches the design system's own "One Signal Rule."
2. **`copySession()` → Claude PT bridge** (lines 634-654) — one tap turns a full session into a structured plain-text report (completed/partial/skipped, RPE, weight-change annotations) ready to paste into the coaching loop. The clearest evidence this was authored for one exact workflow, not templated from a generic fitness app.
3. **The rest timer as the app's one "alive" element** (lines 1062-1086) — pinned, blue→red SVG ring, gentle pulse at zero. Correctly concentrates motion into the one moment (between sets) where time actually matters, without competing against the deliberately static rest of the UI.

## Priority Issues

**[P0] Unguarded backup restore can silently destroy all history and PBs**
- **Why it matters:** `restore()` (line 592-600) replaces `state` and `history` wholesale from pasted clipboard text with zero confirmation — the app's only backup mechanism is also its biggest data-loss vector, for a tool with no cloud copy of anything.
- **Fix:** Add the same `window.confirm()` gate `finishSession`/`resetDay` already use, and show a one-line preview ("This backup has N sessions through {date} — replace your current M sessions?").
- **Suggested command:** `/impeccable harden`

**[P1] `resetDay()` has no undo, unlike every other destructive action in the app**
- **Why it matters:** Deleting an exercise gets a 6s tap-to-undo toast (lines 521-541); `resetDay()` (559-563) offers only a native confirm and then permanently wipes ticks/notes. It sits in the footer directly next to "plates"/"progress" — one mis-tap plus one reflexive confirm from losing a session.
- **Fix:** Snapshot state before reset and reuse the existing undo-toast pattern.
- **Suggested command:** `/impeccable harden`

**[P2] Native `confirm()` dialogs break the app's visual language at its two highest-stakes moments**
- **Why it matters:** Lines 560 and 572 route "finish workout" and "reset day" through unstyled OS dialogs, undercutting the peak-end payoff that the rest of the interaction design (glow, toast, color) carefully builds toward.
- **Fix:** Replace with an in-app confirmation sheet styled per DESIGN.md (dark surface, hairline border, matching accent).
- **Suggested command:** `/impeccable polish`

**[P2] Duplicate delete affordance on exercise cards**
- **Why it matters:** The ✕ icon (line 776) and the "del" text button (line 849) both delete the same exercise, visible simultaneously — a consistency violation with no benefit.
- **Fix:** Remove the ✕ icon; keep "del" alongside the other dashed structural actions for a single consistent idiom.
- **Suggested command:** `/impeccable clarify`

**[P3] Design-token drift: 9 colors used in code aren't in DESIGN.md's token list**
- **Why it matters:** Gradient second-stops and shadow values (`#6ee7b7`, `#f59e0b`, `#fca5a5`, `#7dd3fc`, `rgba(0,0,0,0.4)`) are load-bearing in the actual UI but invisible to the design system — the next feature could easily introduce a clashing gradient stop with no token to check against.
- **Fix:** Add these as explicit tokens (or documented gradient-pair references) in DESIGN.md.
- **Suggested command:** `/impeccable document` (targeted token refresh)

## Persona Red Flags

**Casey (Distracted Mobile User)** — the closest literal match to this product's own stated context (used one-handed, mid-workout):
- Primary end-of-session CTAs ("copy session," "finish session") sit at the bottom of a normal scroll flow, not pinned — on an 8-exercise Legs day, Casey must scroll past every card to reach them every time.
- The rest-timer's own ±15/restart/dismiss buttons are 42×42px (lines 1081-1084) — 2px under the app's own stated floor of "~38-44px" for one-handed controls, per DESIGN.md's own Don't list.
- Weight entry is a raw text input requiring the keyboard to pop up mid-set; reps have a stepper (`Adj`, line 287) but weight doesn't, so nudging 60kg→62.5kg always costs a keyboard summon.

**Riley (Stress Tester):**
- `restore()` accepts any well-formed-but-stale backup and applies it with zero diff or warning — an "appears to work but silently produces wrong results" failure mode.
- The rest timer's countdown state is never persisted to localStorage — refreshing mid-rest (plausible given the network-first service worker forcing fresh HTML per launch) silently drops the active timer with no message, even though ticks/notes survive fine.
- Blurring an empty exercise-name field silently overwrites it with the literal string "Exercise" (`blurN`, line 518) — a small but real silent-mutation trap with no undo.

## Minor Observations

- `sessionMins` only starts counting from the first ticked set, so warm-up time before the first set never shows in the "Duration" stat that gets copied to Claude PT.
- `BARBELL_RE` is a hardcoded regex on exercise name; a renamed/unusual barbell lift will silently never get a warm-up ramp, with no manual override.
- Two entirely different "are you sure" mechanisms coexist in one app: custom undo-toast (delete) vs. native `confirm()` (finish/reset) — DESIGN.md doesn't account for native dialogs at all, so this is a design-system leak rather than a deliberate choice.
- The chart's 1RM reference line correctly renders in PB-gold — good adherence to the system's own color-reservation rule, worth calling out as something easy to get wrong that wasn't.

## Questions to Consider

- If a bad clipboard paste wiped every PB and session logged tonight, would that be acceptable for "zero-friction" software — or does the one backup/restore path deserve at least as much guardrail as the disposable "add exercise" button already gets?
- The rest timer is the most animated, "alive" element in a deliberately quiet UI — should "finish session," the actual emotional peak of a workout, really be handled by a flat browser `confirm()` instead of the app's own visual language?
- Now that the app already does quiet math on Dan's behalf (PB detection, warm-up ramps, RPE-target hints), why does completing an exercise still cost N discrete taps instead of one gesture?
