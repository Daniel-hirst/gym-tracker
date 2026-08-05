---
name: Gym Tracker
description: A dark gym HUD that stays quiet until a PB, a timer, or today's session lights it up.
colors:
  void: "#0c0e13"
  surface: "#13161e"
  surface-raised: "#1a1e28"
  surface-inset: "#222736"
  hairline: "rgba(255,255,255,0.05)"
  hairline-strong: "rgba(255,255,255,0.1)"
  text: "#f0f2f7"
  text-muted: "#7d8595"
  text-faint: "#4d5666"
  success: "#34d399"
  success-bg: "rgba(52,211,153,0.08)"
  success-glow: "rgba(52,211,153,0.2)"
  pb-gold: "#fbbf24"
  pb-glow: "rgba(251,191,36,0.2)"
  timer-blue: "#38bdf8"
  timer-red: "#f87171"
  rpe-warn-orange: "#fb923c"
  chart-accent: "#0284c7"
  day-push: "#ff6b6b"
  day-push-alt: "#ff8e53"
  day-pull: "#4ecdc4"
  day-pull-alt: "#44a8c8"
  day-upper: "#a78bfa"
  day-upper-alt: "#7c3aed"
  day-arms: "#f9c74f"
  day-arms-alt: "#f3722c"
  day-legs: "#f97316"
  day-legs-alt: "#ef4444"
  success-bright: "#6ee7b7"
  pb-amber: "#f59e0b"
  on-accent-ink: "#000000"
  timer-blue-soft: "#7dd3fc"
  timer-red-soft: "#fca5a5"
  scrim: "rgba(0,0,0,0.4)"
typography:
  display:
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  control: "10px"
  panel: "12px"
  card: "16px"
  pill: "100px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
components:
  button-primary:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    padding: "13px 0"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.panel}"
    padding: "8px 12px"
  card-exercise:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "14px"
  chip-day-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 2px"
  set-complete-button:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.control}"
    height: "44px"
    width: "44px"
---

# Design System: Gym Tracker

## Overview

**Creative North Star: "The Night Session"**

Gym Tracker is a dark HUD you check under gym lighting, not a bright productivity app you check at a desk. Its base state is deliberately quiet: near-black tiered surfaces, low-contrast hairline borders, muted grey text. Nothing glows, shadows, or announces itself until something has actually happened — a set ticked, a personal best broken, a rest timer counting down. That restraint is what makes the payoffs (a gold PB flash, a green completion glow, a day's own neon accent lighting its tab) read as earned rather than decorative.

The five training days each carry their own accent color and gradient — coral Push, teal Pull, violet Upper, gold Arms, orange Legs — so the app's identity shifts subtly day to day while the surrounding chrome (surfaces, type, spacing, radii) stays constant. This is a solo tool built for one person's own programme, not a market product, so its "brand" is really a mood: technical, low-light, unsentimental.

**Explicit anti-reference:** this is not a corporate SaaS dashboard. No light backgrounds, no card-shadow-heavy admin-panel look, no blue-and-white enterprise palette. It is gym equipment, not office software.

**Key Characteristics:**
- Flat, tiered dark surfaces (void → surface → raised → inset) instead of card shadows
- Per-day neon accent colors that own their day's tab, header glow, and card top-bar — never borrowed across days
- State-triggered glow (success green, PB gold) as the *only* source of elevation drama
- Small, uppercase, letter-spaced eyebrow labels (RPE, REST, DATA, SESSION LOG) as the recurring structural device
- Single system font throughout; hierarchy comes from size/weight/tracking, not a second typeface

## Colors

A near-monochrome dark base (void/surface/raised/inset) carries almost the whole interface; color is spent deliberately on five day identities and three semantic signals (success, PB, timer), never as passive decoration.

### Primary
- **Timer Sky** (`#38bdf8` → `#7dd3fc` active, → `#f87171`/`#fca5a5` at zero): the rest-timer ring, countdown bar, and any "adjust time" control. The one color used for a functional, ongoing process rather than a one-off event; its gradient lightens toward the active end (`#7dd3fc`) and swaps to the red pair (`#f87171` → `#fca5a5`) once rest is up.

### Secondary
- **Success Mint** (`#34d399` → `#6ee7b7`): exclusively "this set/exercise/day is done." Drives the completion glow, the finish-session button, the progress ring at 100%, and the set-complete button's fill gradient.
- **PB Gold** (`#fbbf24` → `#f59e0b`): exclusively a new personal best. Never reused for anything else — its rarity is what makes the 🏆 flash land.
- **On-Accent Ink** (`#000000`): the only text color ever placed on a bright success/PB gradient fill (the set-complete checkmark, the PB badge label) — everywhere else text uses Ink, Muted, or Faint.

### Tertiary — Day Accents
- **Push Coral** (`#ff6b6b` → `#ff8e53`): Push day's tab, header glow, and card top-bar only.
- **Pull Teal** (`#4ecdc4` → `#44a8c8`): Pull day only.
- **Upper Violet** (`#a78bfa` → `#7c3aed`): Upper day only.
- **Arms Gold** (`#f9c74f` → `#f3722c`): Arms day only.
- **Legs Orange** (`#f97316` → `#ef4444`): Legs day only.

### Neutral
- **Void** (`#0c0e13`): the app's base background.
- **Surface** (`#13161e`): first tier up — exercise cards, tabs, chart panels at rest.
- **Surface Raised** (`#1a1e28`): second tier — input wells, rest-adjuster pills, collapsed-exercise rows.
- **Surface Inset** (`#222736`): third tier — pressed/deepest controls (stepper buttons, weight inputs).
- **Ink** (`#f0f2f7`): primary text.
- **Muted** (`#7d8595`): secondary text, labels, timestamps.
- **Faint** (`#4d5666`): tertiary text — placeholders, disabled, least important numerals.
- **Hairline** (`rgba(255,255,255,0.05)`) / **Hairline Strong** (`rgba(255,255,255,0.1)`): the only border weight vocabulary; there is no third.
- **Scrim** (`rgba(0,0,0,0.4)`): the one non-glow shadow value in the system, reserved for floating toast/undo pills and the confirm sheet's backdrop — everything else uses a glow, per the Elevation section.

### Named Rules
**The One Signal Rule.** Success green means done, gold means PB, sky blue means an active timer. Never recolor one of these three for an unrelated purpose, and never let a day's accent color bleed into another day.

**The Quiet-Until-It-Matters Rule.** Surfaces and controls are flat and low-contrast at rest. Glow, gradient fills, and saturated color are reserved for a state change (done, PB, active countdown) — they are the reward, not the wallpaper.

## Typography

**Display/Body/Label Font:** `'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif` (one family for the entire app; hierarchy comes from size, weight, and tracking, not a second typeface).

**Character:** Confident and dense — tight negative tracking on big numerals (day name, percentage), wide positive tracking on tiny uppercase labels. Feels instrumented, not editorial.

### Hierarchy
- **Display** (700, 30px, line-height 1, `-0.03em`): the current day's name in the header — the single largest thing on screen.
- **Title** (700, 22–24px, line-height 1, `-0.02em`): the Progress screen title and the completion percentage.
- **Body** (600, 14–18px, line-height 1.3–1.5): exercise names, set reps/weight inputs, button copy.
- **Label** (700, 10–11px, `0.08–0.12em` tracking, uppercase): section eyebrows — RPE, REST, TARGET, DATA, SESSION LOG, EACH SIDE. The recurring structural signature of the whole app.

### Named Rules
**The Eyebrow Rule.** Any small structural label (not body copy) is uppercase, 10–11px, weight 700, with 0.08em+ tracking. This is how the UI signals "this is scaffolding, not content."

## Layout

Single-column mobile shell, `max-width: 460px`, centered (`margin: 0 auto`) — this keeps the same composition correct on an actual phone and in a desktop browser tab. Full-height flex column: scrollable content area, with a persistent rest-timer bar and toast/undo layer pinned to the bottom via `position: fixed`. Safe-area insets (`env(safe-area-inset-*)`) are load-bearing, not decorative — the app runs full-screen as an installed PWA under the iPhone notch/home-indicator.

Density is high but not cramped: card padding sits at 14px, inter-card gaps at 10px, section padding at 16px horizontally. Grids are used for anything tabular or repeating: day tabs (`repeat(5, 1fr)`), a set row (`20px 1fr 1fr 46px` — set number / reps / weight / complete), and progress stat tiles (`repeat(3, 1fr)`).

## Elevation & Depth

No conventional drop shadows on resting surfaces. Depth comes from a four-step lightness tier (void → surface → surface-raised → surface-inset) plus a single hairline border weight — a flat, layered system, not a lifted one. The only shadows in the system are **glows**, and they are earned, not ambient: a blurred color circle behind the header signals the active day; a soft colored halo appears around a card only when it just went 100% complete or just hit a PB.

### Shadow Vocabulary
- **Day glow** (`0 4px 16px {day-color}-glow`, blur `60px` on the header's background circle): marks the active day's identity.
- **Success glow** (`0 0 20px rgba(52,211,153,0.2)`): a card that just completed.
- **PB glow** (`0 0 20px rgba(251,191,36,0.2)`): a card that just hit a personal best.
- **Toast/overlay shadow** (`0 4px 20px rgba(0,0,0,0.4)`): the one conventional (non-glow) shadow, reserved for floating toast/undo pills that sit above everything else.

### Named Rules
**The Glow-Is-Earned Rule.** A surface only glows in response to a real event (active day, just-completed, new PB, running timer). A glow on an idle surface is a bug, not a style choice.

## Shapes

Rounded throughout, never sharp: a four-step radius scale from 10px (controls — steppers, chips, RPE pills) through 12px (panels — inputs, rest-adjuster, stat tiles) to 16px (cards — exercise cards, chart/progress panels), plus a full pill (100px) for tags, day-progress bars, and toasts. The day-emoji badge is a 12px-radius "squircle" rather than a true circle; the only true circles in the system are the SVG rest-timer ring and the chart's data-point dots.

## Components

### Buttons
- **Shape:** control radius (10px) for small icon buttons (steppers, RPE pills), panel radius (12px) for full-width footer actions.
- **Primary (Finish Session):** success-tinted background (`rgba(52,211,153,0.08)`), success-green text and border, full width, 13px vertical padding.
- **Secondary (Copy Session):** neutral by default (surface-raised background, ink text); flips to the success treatment once the copy succeeds, giving momentary confirmation instead of a separate toast-only pattern.
- **Ghost (footer utility — reset / plates / progress):** transparent background, muted text, hairline-strong border; the low-emphasis default for anything that isn't a primary action.
- **Dashed (add set / add exercise / restore):** dashed hairline-strong border, transparent background, muted text — visually distinct from solid buttons to read as "structural, not an action on existing data."

### Chips / Tags
- **Day tabs:** surface background at rest; on selection, fills with that day's own tinted background and a colored border + glow; on a fully-completed day, flips to the success tint regardless of which day it is.
- **RPE pills:** 36px circular-ish buttons colored by the `RPE_COLORS` scale (green 4–6, gold/orange 7–8, red 9–10) — color communicates intensity zone, not just selection state.
- **Exercise picker / metric toggle (Progress screen):** pill or segmented chips using the timer-blue tint for the active selection — the one place timer-blue is reused as a generic "selected" color outside the rest timer itself.

### Cards / Containers
- **Corner Style:** 16px (exercise cards, chart panel, progress empty-state); 12px (stat tiles, session-log rows, 1RM entry row).
- **Background:** surface by default; success- or PB-tinted (`rgba(...,0.06)`) when that card just completed or hit a PB.
- **Shadow Strategy:** none at rest; glow only per the Elevation section.
- **Border:** always a hairline, upgraded to a success/PB-tinted 40%-opacity border when that state is active.
- **Internal Padding:** 14px standard.

### Inputs / Fields
- **Style:** surface-inset background, hairline border, 8–10px radius; reps/weight fields center-align their text and drop the browser default outline entirely.
- **Focus:** no distinct focus ring today — the input's existing border/background is the only state shown (a gap worth revisiting in `harden` or `audit`).
- **Changed-value hint:** when the PT's original prescription was edited in-app, a small timer-blue "was {value}" caption appears beneath the field — a quiet audit trail rather than a modal or alert.

### Rest Timer (signature component)
A pinned bottom bar: a thin top progress line, an SVG ring counting down in timer-blue (flipping to timer-red then a gentle pulse animation at zero), and ±15s / restart / dismiss controls. It's the one place a true circle and a continuous color transition (blue → red) both appear, marking it as the app's most "alive" element.

## Do's and Don'ts

### Do:
- **Do** keep every day's accent color scoped to that day's own tab, header glow, and card top-bar — never borrow one day's color for another.
- **Do** treat success green, PB gold, and timer blue as reserved semantic colors, not a general-purpose palette to pull from for new features.
- **Do** use the uppercase/tracked label style (11px, 700, 0.1em) for any new structural/eyebrow text.
- **Do** keep new surfaces flat at rest; add a glow only as a direct response to a state change.
- **Do** keep the single system-font stack; do not introduce a second typeface for "emphasis."

### Don't:
- **Don't** add drop shadows to a resting card, tab, or panel — depth comes from the surface tier, not a shadow.
- **Don't** push the interface toward a light/corporate-dashboard look (light backgrounds, card shadows, blue-and-white enterprise palette) — this is gym equipment, not office software.
- **Don't** make controls smaller than the existing steppers/complete-buttons (~38–44px) — they're sized for one-handed, mid-set use, not desktop-precision pointing.
- **Don't** add a second decorative font, icon set, or illustration style; the app's only "graphics" are emoji, SVG (chart + timer ring), and color itself.
