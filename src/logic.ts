// Pure logic (no React, no localStorage) so it can be unit-tested — see logic.test.ts
import type { DayDef, ExerciseDef } from "./plan";

export type WorkSet = {
  id: string; r: number; w: string; done: boolean; startW: string;
  doneAt?: number;          // when it was ticked — session length runs first tick → last tick
  pbBefore?: number | null; // set when ticking this set raised the PB; unticking restores it
};
export type Exercise = {
  id: string; n: string; sets: WorkSet[]; note: string;
  pb: number | null; rpe: number | null; target: number | null; rest: number; collapsed: boolean;
  startRest?: number; // the plan's prescribed rest when this state was built (absent in pre-v11 saves)
};
export type DayState = { startedAt: number | null; ex: Exercise[] };
export type HistorySet = { r: number; w: string; done: boolean };
export type HistoryExercise = { n: string; rpe: number | null; note: string; pb: number | null; sets: HistorySet[] };
export type HistoryEntry = { date: string; day: string; block: number; mins: number | null; volume: number | null; ex: HistoryExercise[] };

export function uid(): string { return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function makeSets(count: number, r: number, w: string): WorkSet[] { return Array(count).fill(null).map(() => ({ id: uid(), r, w, done: false, startW: w })); }

export function planExercise(e: ExerciseDef, blockIdx: number): Exercise {
  const b = e.b[blockIdx];
  return { id: uid(), n: e.n, sets: makeSets(b.s, b.r, b.w), note: "", pb: null, rpe: null, target: e.t, rest: e.rest || 90, startRest: e.rest || 90, collapsed: false };
}

export function initState(days: DayDef[], blockIdx: number): DayState[] {
  return days.map(d => ({ startedAt: null, ex: d.ex.map(e => planExercise(e, blockIdx)) }));
}

export function parseWeight(w: string): number | null { const m = String(w || "").match(/[\d.]+/); return m ? parseFloat(m[0]) : null; }
// Only treat plain kg values as PB-able — "Stack 7", "Band", "40kg/side" etc. are not comparable weights
export function isKgWeight(w: string): boolean { return /^\s*\d+(\.\d+)?\s*(kg)?\s*$/i.test(String(w || "")); }
export function rmKey(name: string): string { return name.trim().toLowerCase(); }

// First tick to last tick, so finishing late doesn't inflate it (saves from before
// doneAt existed fall back to "now")
export function sessionMinutes(d: DayState, now = Date.now()): number | null {
  if (d.startedAt == null) return null;
  let last = 0;
  d.ex.forEach(e => e.sets.forEach(s => { if (s.done && s.doneAt && s.doneAt > last) last = s.doneAt; }));
  return Math.max(1, Math.round(((last || now) - d.startedAt) / 60000));
}

// Volume only counts sets with a real kg weight — machine stacks / bands / bodyweight aren't comparable
export function sessionVolume(d: DayState): number {
  return Math.round(d.ex.reduce((t, e) => t + e.sets.reduce((a, s) => {
    const w = parseWeight(s.w);
    return a + (s.done && w && /kg/i.test(s.w || "") ? w * s.r : 0);
  }, 0), 0));
}

export function toHistoryEntry(dayName: string, d: DayState, block: number, date: Date): HistoryEntry {
  return {
    date: date.toISOString(), day: dayName, block,
    mins: sessionMinutes(d, date.getTime()), volume: sessionVolume(d) || null,
    ex: d.ex.map(e => ({ n: e.n, rpe: e.rpe, note: e.note, pb: e.pb, sets: e.sets.map(s => ({ r: s.r, w: s.w, done: s.done })) })),
  };
}

// The programme lives in code (CURRENT_BLOCK / PLAN_VERSION in plan.ts), so on load we compare
// them against what the saved state was built from — if either changed, rebuild the plan and
// keep the PBs. In-app weight/rest edits also carry over, but only where the plan's own
// prescription didn't change — a new prescription from the PT always wins. Any day with ticked
// sets that was never finished is returned in `archived` so it lands in history, not the bin.
export function rebuildState(
  saved: DayState[] | null, savedBlock: number | null, savedVersion: number | null,
  days: DayDef[], block: number, version: number,
): { state: DayState[]; archived: HistoryEntry[] } {
  if (saved && savedBlock === block && savedVersion === version) return { state: saved, archived: [] };
  const ns = initState(days, block);
  const archived: HistoryEntry[] = [];
  if (saved) {
    saved.forEach((d, di) => {
      if (d.ex.some(e => e.sets.some(s => s.done))) {
        archived.push(toHistoryEntry(days[di]?.name ?? `Day ${di + 1}`, d, savedBlock ?? block, new Date(d.startedAt ?? Date.now())));
      }
    });
    const pbs: Record<string, number> = {};
    saved.forEach(d => d.ex.forEach(e => { if (e.pb) pbs[e.n] = Math.max(pbs[e.n] || 0, e.pb); }));
    ns.forEach((d, di) => d.ex.forEach(e => {
      if (pbs[e.n]) e.pb = pbs[e.n];
      const old = saved[di]?.ex.find(o => o.n === e.n);
      if (!old) return;
      if (old.startRest != null && old.startRest === e.rest && old.rest !== old.startRest) e.rest = old.rest;
      e.sets.forEach((set, si) => {
        const os = old.sets[si];
        if (os && os.startW === set.w && os.w !== os.startW) set.w = os.w;
      });
    }));
  }
  return { state: ns, archived };
}

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

// Greedy per-side plate breakdown. `loaded` is what the plates actually make, which is
// less than the target when it can't be hit exactly (e.g. 81kg on a 20kg bar → 80kg).
export function plateBreakdown(target: number, bar: number): { plates: { kg: number; count: number }[]; perSide: number; loaded: number } | null {
  if (isNaN(target) || target <= bar) return null;
  const want = (target - bar) / 2;
  let rem = want;
  const plates: { kg: number; count: number }[] = [];
  for (const p of PLATES) {
    const c = Math.floor(rem / p + 1e-9);
    if (c > 0) { plates.push({ kg: p, count: c }); rem = Math.round((rem - c * p) * 1000) / 1000; }
  }
  const perSide = Math.round((want - rem) * 1000) / 1000;
  return { plates, perSide, loaded: bar + perSide * 2 };
}
