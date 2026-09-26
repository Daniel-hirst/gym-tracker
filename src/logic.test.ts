import { describe, expect, it } from "vitest";
import { DAYS, planHash, type DayDef } from "./plan";
import { initState, plateBreakdown, rebuildState, sessionMinutes, type DayState } from "./logic";

const plan = (w: string, rest = 90, name = "Squat"): DayDef[] => [{
  name: "Legs", sub: "", emoji: "", color: "", glow: "", grad: "", bg: "",
  ex: [{ n: name, b: [0, 1, 2, 3].map(() => ({ s: 2, r: 5, w })), rest, t: 8 }],
}];
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

describe("rebuildState", () => {
  it("returns saved state untouched when block and plan are unchanged", () => {
    const saved = initState(plan("60kg"), 0);
    const r = rebuildState(saved, 0, 1, plan("60kg"), 0, 1);
    expect(r.state).toBe(saved);
    expect(r.archived).toEqual([]);
  });

  it("carries an in-app weight edit over when the PT didn't change that prescription", () => {
    const saved = initState(plan("60kg"), 0);
    saved[0].ex[0].sets[0].w = "62.5kg";
    const r = rebuildState(saved, 0, 1, plan("60kg", 120), 0, 2);
    expect(r.state[0].ex[0].sets[0].w).toBe("62.5kg");
    expect(r.state[0].ex[0].sets[1].w).toBe("60kg");
  });

  it("lets a new PT prescription win over an in-app edit", () => {
    const saved = initState(plan("60kg"), 0);
    saved[0].ex[0].sets[0].w = "62.5kg";
    const r = rebuildState(saved, 0, 1, plan("65kg"), 0, 2);
    expect(r.state[0].ex[0].sets[0].w).toBe("65kg");
  });

  it("carries rest edits only while the prescribed rest is unchanged", () => {
    const saved = initState(plan("60kg", 90), 0);
    saved[0].ex[0].rest = 120;
    expect(rebuildState(clone(saved), 0, 1, plan("65kg", 90), 0, 2).state[0].ex[0].rest).toBe(120);
    expect(rebuildState(clone(saved), 0, 1, plan("65kg", 150), 0, 2).state[0].ex[0].rest).toBe(150);
  });

  it("keeps PBs and resets ticks", () => {
    const saved = initState(plan("60kg"), 0);
    saved[0].ex[0].pb = 100;
    saved[0].ex[0].sets[0].done = true;
    const r = rebuildState(saved, 0, 1, plan("60kg"), 1, 1);
    expect(r.state[0].ex[0].pb).toBe(100);
    expect(r.state[0].ex[0].sets.every(s => !s.done)).toBe(true);
  });

  it("archives unfinished ticked days to history instead of dropping them", () => {
    const saved = initState(plan("60kg"), 2);
    const t0 = Date.UTC(2026, 8, 1, 10, 0);
    saved[0].startedAt = t0;
    saved[0].ex[0].sets[0].done = true;
    saved[0].ex[0].sets[0].doneAt = t0 + 40 * 60000;
    const r = rebuildState(saved, 2, 1, plan("65kg"), 2, 2);
    expect(r.archived).toHaveLength(1);
    expect(r.archived[0]).toMatchObject({ day: "Legs", block: 2, mins: 40, volume: 300, date: new Date(t0).toISOString() });
  });

  it("does not archive days with nothing ticked", () => {
    const saved = initState(plan("60kg"), 0);
    expect(rebuildState(saved, 0, 1, plan("65kg"), 0, 2).archived).toEqual([]);
  });

  it("starts fresh with nothing saved", () => {
    const r = rebuildState(null, null, null, plan("60kg"), 0, 1);
    expect(r.state[0].ex[0].sets).toHaveLength(2);
    expect(r.archived).toEqual([]);
  });
});

describe("sessionMinutes", () => {
  it("runs from first tick to last tick, not to when finish is tapped", () => {
    const d: DayState = initState(plan("60kg"), 0)[0];
    d.startedAt = 0;
    d.ex[0].sets[0].done = true; d.ex[0].sets[0].doneAt = 55 * 60000;
    expect(sessionMinutes(d, 180 * 60000)).toBe(55);
  });
  it("falls back to now for ticks saved before doneAt existed", () => {
    const d: DayState = initState(plan("60kg"), 0)[0];
    d.startedAt = 0;
    d.ex[0].sets[0].done = true;
    expect(sessionMinutes(d, 30 * 60000)).toBe(30);
  });
});

describe("planHash", () => {
  it("changes when a prescription changes, not when colours do", () => {
    const a = plan("60kg");
    const recoloured = clone(a); recoloured[0].color = "#fff";
    expect(planHash(recoloured)).toBe(planHash(a));
    expect(planHash(plan("62.5kg"))).not.toBe(planHash(a));
    expect(planHash(plan("60kg", 120))).not.toBe(planHash(a));
  });
  it("is stable for the real plan", () => {
    expect(planHash(DAYS)).toBe(planHash(clone(DAYS)));
  });
});

describe("plateBreakdown", () => {
  it("splits an exact weight per side", () => {
    expect(plateBreakdown(100, 20)).toEqual({ plates: [{ kg: 25, count: 1 }, { kg: 15, count: 1 }], perSide: 40, loaded: 100 });
    expect(plateBreakdown(62.5, 20)?.plates).toEqual([{ kg: 20, count: 1 }, { kg: 1.25, count: 1 }]);
  });
  it("reports what's actually loaded when the target can't be hit", () => {
    expect(plateBreakdown(81, 20)).toMatchObject({ perSide: 30, loaded: 80 });
  });
  it("returns null at or below the bar", () => {
    expect(plateBreakdown(20, 20)).toBeNull();
    expect(plateBreakdown(NaN, 20)).toBeNull();
  });
});
