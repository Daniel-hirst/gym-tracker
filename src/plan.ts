// ═══ The programme. This is the file to edit when Dan pastes a new week from his PT. ═══
// Phones rebuild the plan automatically when any prescription below changes (see PLAN_VERSION
// at the bottom), keeping PBs, history and unchanged in-app edits.

// Block index: 0=B1, 1=B2, 2=B3, 3=Deload
export const BLOCKS = ["Block 1", "Block 2", "Block 3", "Deload"];

// 0 = Block 1, 1 = Block 2, 2 = Block 3, 3 = Deload
export const CURRENT_BLOCK = 2;
export const CYCLE = 2;

export type SetSpec = { s: number; r: number; w: string };
export type ExerciseDef = { n: string; b: SetSpec[]; rest: number; t: number };
export type DayDef = {
  name: string; sub: string; emoji: string;
  color: string; glow: string; grad: string; bg: string;
  ex: ExerciseDef[];
};

export const DAYS: DayDef[] = [
  {
    name: "Push", sub: "SHOULDERS · CHEST · TRICEPS", emoji: "💪",
    color: "#ff6b6b", glow: "rgba(255,107,107,0.25)", grad: "linear-gradient(135deg, #ff6b6b, #ff8e53)", bg: "rgba(255,107,107,0.08)",
    ex: [
      { n: "Barbell OHP",       b: [{s:4,r:12,w:"30kg"},{s:4,r:10,w:"37.5kg"},{s:4,r:6,w:"40kg"},{s:2,r:8,w:"32.5kg"}], rest:120, t:9 },
      { n: "Incline DB Press",  b: [{s:4,r:12,w:"17.5kg"},{s:4,r:10,w:"22.5kg"},{s:4,r:6,w:"27.5kg"},{s:2,r:8,w:"18kg"}], rest:105, t:9 },
      { n: "Pec Dec",           b: [{s:3,r:12,w:"Stack 7"},{s:3,r:12,w:"Stack 7"},{s:3,r:10,w:"Stack 8"},{s:2,r:10,w:"Stack 6"}], rest:75, t:8 },
      { n: "Cable Lateral Raise", b: [{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"5kg / Stack 1"},{s:2,r:12,w:"Light"}], rest:60, t:8 },
      { n: "Face Pull cable",   b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:3,r:15,w:"Stack 6-7"},{s:2,r:15,w:"Light"}], rest:60, t:8 },
      { n: "Calf Raise",        b: [{s:3,r:15,w:"40kg/side"},{s:3,r:15,w:"42.5kg/side"},{s:3,r:15,w:"42.5kg/side"},{s:2,r:12,w:"32.5kg/side"}], rest:90, t:8 },
    ]
  },
  {
    name: "Pull", sub: "BACK · BICEPS · REAR DELTS", emoji: "🏋️",
    color: "#4ecdc4", glow: "rgba(78,205,196,0.25)", grad: "linear-gradient(135deg, #4ecdc4, #44a8c8)", bg: "rgba(78,205,196,0.08)",
    ex: [
      { n: "Conventional Deadlift",  b: [{s:4,r:12,w:"80kg"},{s:3,r:10,w:"90kg"},{s:3,r:6,w:"97.5kg"},{s:2,r:4,w:"85kg"}], rest:150, t:9 },
      { n: "Barbell Bent Over Row",  b: [{s:4,r:10,w:"50kg"},{s:3,r:10,w:"52.5kg"},{s:3,r:6,w:"57.5kg"},{s:2,r:8,w:"45kg"}], rest:120, t:9 },
      { n: "Pull Ups",               b: [{s:3,r:10,w:"Thicker band"},{s:3,r:10,w:"Thin Red Band"},{s:3,r:6,w:"Thin Red Band"},{s:2,r:8,w:"Band"}], rest:90, t:9 },
      { n: "Hammer Curl (standing)", b: [{s:3,r:12,w:"10kg"},{s:3,r:14,w:"12.5kg"},{s:3,r:14,w:"15kg"},{s:2,r:10,w:"10kg"}], rest:75, t:8 },
      { n: "Reverse Pec Dec",        b: [{s:3,r:15,w:"Stack 3"},{s:3,r:15,w:"Stack 4"},{s:3,r:15,w:"Stack 4"},{s:2,r:12,w:"Light"}], rest:75, t:8 },
      { n: "Cable Crunch",           b: [{s:3,r:15,w:"65kg"},{s:3,r:15,w:"65kg"},{s:3,r:15,w:"65kg"},{s:2,r:12,w:"55kg"}], rest:60, t:8 },
    ]
  },
  {
    name: "Upper", sub: "HYPERTROPHY VOLUME", emoji: "🔷",
    color: "#a78bfa", glow: "rgba(167,139,250,0.25)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", bg: "rgba(167,139,250,0.08)",
    ex: [
      { n: "Machine Chest Press",   b: [{s:3,r:12,w:"17.5kg"},{s:3,r:10,w:"22.5kg"},{s:3,r:6,w:"25kg"},{s:2,r:10,w:"Light"}], rest:105, t:9 },
      { n: "Chest Supported Row",   b: [{s:3,r:12,w:"Calibrate"},{s:3,r:10,w:"27.5kg/side"},{s:3,r:6,w:"30kg/side"},{s:2,r:10,w:"Light"}], rest:90, t:9 },
      { n: "Pec Dec",               b: [{s:3,r:15,w:"Stack 6"},{s:3,r:12,w:"Stack 7"},{s:3,r:10,w:"Stack 8"},{s:2,r:12,w:"Stack 5"}], rest:75, t:8 },
      { n: "Single Arm Pulldown",   b: [{s:3,r:12,w:"15kg / Stack 3"},{s:3,r:10,w:"27.5kg / Stack 6"},{s:3,r:6,w:"30kg / Stack 7"},{s:2,r:10,w:"Light"}], rest:75, t:9 },
      { n: "Cable Lateral Raise",   b: [{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"5kg / Stack 1"},{s:2,r:12,w:"Light"}], rest:60, t:8 },
      { n: "Face Pull cable",       b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:3,r:15,w:"Stack 6-7"},{s:2,r:15,w:"Light"}], rest:60, t:8 },
    ]
  },
  {
    name: "Arms", sub: "BICEPS · TRICEPS · FOREARMS", emoji: "🦾",
    color: "#f9c74f", glow: "rgba(249,199,79,0.25)", grad: "linear-gradient(135deg, #f9c74f, #f3722c)", bg: "rgba(249,199,79,0.08)",
    ex: [
      { n: "Close Grip Bench Press",     b: [{s:3,r:12,w:"52.5kg"},{s:3,r:10,w:"57.5kg"},{s:3,r:6,w:"62.5kg"},{s:2,r:10,w:"45kg"}], rest:180, t:9 },
      { n: "Overhead Tricep Ext rope",   b: [{s:3,r:12,w:"Stack 6"},{s:3,r:10,w:"Stack 7"},{s:3,r:8,w:"Stack 8"},{s:2,r:10,w:"Stack 5"}], rest:90, t:9 },
      { n: "Tricep Pushdown rope",       b: [{s:3,r:12,w:"Stack 4 / 20kg"},{s:3,r:10,w:"Stack 7"},{s:3,r:10,w:"Stack 7"},{s:2,r:10,w:"Stack 3"}], rest:90, t:8 },
      { n: "Bayesian Cable Curl",        b: [{s:3,r:12,w:"10kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"20kg"},{s:2,r:12,w:"Light"}], rest:90, t:8 },
      { n: "Preacher Curl",              b: [{s:3,r:12,w:"10kg/side"},{s:3,r:12,w:"10kg/side"},{s:3,r:12,w:"10kg/side"},{s:2,r:10,w:"8.75kg/side"}], rest:90, t:8 },
      { n: "Hammer Curl",                b: [{s:3,r:12,w:"12.5kg"},{s:3,r:12,w:"15kg"},{s:3,r:12,w:"15kg"},{s:2,r:10,w:"10kg"}], rest:90, t:8 },
      { n: "Pallof Press",               b: [{s:3,r:10,w:"15kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"25kg"},{s:2,r:10,w:"12.5kg"}], rest:60, t:8 },
    ]
  },
  {
    name: "Legs", sub: "LEGS · CORE", emoji: "🔥",
    color: "#f97316", glow: "rgba(249,115,22,0.25)", grad: "linear-gradient(135deg, #f97316, #ef4444)", bg: "rgba(249,115,22,0.08)",
    ex: [
      { n: "Barbell Back Squat",   b: [{s:4,r:12,w:"60kg"},{s:4,r:10,w:"65kg"},{s:4,r:6,w:"70kg"},{s:2,r:6,w:"55kg"}], rest:150, t:9 },
      { n: "Romanian Deadlift",    b: [{s:3,r:12,w:"60kg"},{s:3,r:10,w:"65kg"},{s:3,r:6,w:"70kg"},{s:2,r:8,w:"57.5kg"}], rest:120, t:9 },
      { n: "Leg Press",            b: [{s:3,r:12,w:"30kg/side"},{s:3,r:10,w:"27.5kg/side"},{s:3,r:10,w:"30kg/side"},{s:2,r:10,w:"25kg/side"}], rest:120, t:8 },
      { n: "Hack Squat",           b: [{s:3,r:12,w:"15kg/side"},{s:3,r:10,w:"17.5kg/side"},{s:3,r:10,w:"20kg/side"},{s:2,r:10,w:"Light"}], rest:90, t:8 },
      { n: "Calf Raise",           b: [{s:3,r:15,w:"40kg/side"},{s:3,r:15,w:"42.5kg/side"},{s:3,r:15,w:"42.5kg/side"},{s:2,r:12,w:"32.5kg/side"}], rest:90, t:8 },
      { n: "Cable Crunch",         b: [{s:3,r:15,w:"65kg"},{s:3,r:15,w:"65kg"},{s:3,r:15,w:"65kg"},{s:2,r:12,w:"55kg"}], rest:60, t:8 },
      { n: "Hanging Leg Raise",    b: [{s:3,r:12,w:"BW"},{s:3,r:12,w:"BW"},{s:3,r:12,w:"BW"},{s:2,r:10,w:"BW"}], rest:60, t:8 },
      { n: "Pallof Press",         b: [{s:3,r:10,w:"15kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"25kg"},{s:2,r:10,w:"12.5kg"}], rest:60, t:8 },
    ]
  },
];

// Tested 1RMs baked in from PT sessions (kg). Newer in-app entries (progress
// screen) override these; keys are exercise names as they appear in DAYS.
export const TESTED_1RMS: Record<string, { w: number; date: string }> = {
  "Conventional Deadlift": { w: 125, date: "2026-07-03" },
  "Barbell Back Squat":    { w: 90,   date: "2026-07-03" },
  "Bench Press":           { w: 77.5, date: "2026-07-03" }, // not in the current plan; kept for future programmes
  "Barbell OHP":           { w: 55,   date: "2026-07-03" },
};

// Fingerprint of every prescription (names, sets/reps/weights, rest, RPE targets) — not
// colours or labels. Replaces the old hand-bumped version number: phones rebuild the plan
// when this or CURRENT_BLOCK changes, so there's nothing to remember to bump.
export function planHash(days: DayDef[]): number {
  const s = JSON.stringify(days.map(d => d.ex.map(e => [e.n, e.b, e.rest, e.t])));
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export const PLAN_VERSION = planHash(DAYS);
