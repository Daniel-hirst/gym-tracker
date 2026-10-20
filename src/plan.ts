// ═══ The programme. This is the file to edit when Dan pastes a new week from his PT. ═══
// Phones rebuild the plan automatically when any prescription below changes (see PLAN_VERSION
// at the bottom), keeping PBs, history and unchanged in-app edits.

// Block index: 0=B1, 1=B2, 2=B3, 3=Deload
export const BLOCKS = ["Block 1", "Block 2", "Block 3", "Deload"];

// 0 = Block 1, 1 = Block 2, 2 = Block 3, 3 = Deload
export const CURRENT_BLOCK = 1;
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
      { n: "Barbell OHP",           b: [{s:4,r:12,w:"32.5kg"},{s:4,r:10,w:"37.5kg"},{s:4,r:6,w:"42.5kg"},{s:2,r:8,w:"30kg"}], rest:120, t:8 },
      { n: "Incline DB Press",      b: [{s:4,r:12,w:"20kg"},{s:4,r:10,w:"22kg"},{s:4,r:6,w:"24kg"},{s:2,r:8,w:"18kg"}], rest:105, t:8 },
      { n: "Pec Dec",               b: [{s:3,r:12,w:"35kg"},{s:3,r:12,w:"40kg"},{s:3,r:8,w:"45kg"},{s:2,r:10,w:"30kg"}], rest:75, t:8 },
      { n: "Machine Lateral Raise", b: [{s:3,r:15,w:"20kg"},{s:3,r:15,w:"22.5kg"},{s:3,r:10,w:"25kg"},{s:2,r:12,w:"17.5kg"}], rest:60, t:8 },
      { n: "Face Pull cable",       b: [{s:3,r:15,w:"30kg"},{s:3,r:15,w:"30kg"},{s:3,r:15,w:"30kg"},{s:2,r:15,w:"25kg"}], rest:60, t:7 },
      { n: "Crunch machine",        b: [{s:3,r:15,w:"25kg"},{s:3,r:15,w:"30kg"},{s:3,r:10,w:"35kg"},{s:2,r:12,w:"25kg"}], rest:60, t:8 },
    ]
  },
  {
    name: "Pull", sub: "BACK · BICEPS · REAR DELTS", emoji: "🏋️",
    color: "#4ecdc4", glow: "rgba(78,205,196,0.25)", grad: "linear-gradient(135deg, #4ecdc4, #44a8c8)", bg: "rgba(78,205,196,0.08)",
    ex: [
      { n: "Deadlift machine",              b: [{s:3,r:12,w:"32.5kg/side"},{s:3,r:10,w:"37.5kg/side"},{s:3,r:5,w:"42.5kg/side"},{s:2,r:6,w:"30kg/side"}], rest:150, t:8 },
      { n: "T-Bar Row",                     b: [{s:3,r:12,w:"25kg"},{s:3,r:10,w:"30kg"},{s:3,r:6,w:"35kg"},{s:2,r:8,w:"25kg"}], rest:120, t:8 },
      { n: "Lat Pulldown (close grip)",     b: [{s:3,r:12,w:"50kg"},{s:3,r:10,w:"50kg"},{s:3,r:6,w:"55kg"},{s:2,r:8,w:"42.5kg"}], rest:90, t:8 },
      { n: "Exigo Pullover",                b: [{s:3,r:12,w:"25kg"},{s:3,r:12,w:"27.5kg"},{s:3,r:10,w:"30kg"},{s:2,r:10,w:"20kg"}], rest:90, t:8 },
      { n: "Hammer Curl (standing)",        b: [{s:3,r:12,w:"12kg"},{s:3,r:12,w:"14kg"},{s:3,r:8,w:"15kg"},{s:2,r:10,w:"10kg"}], rest:75, t:8 },
      { n: "Reverse DB Fly",                b: [{s:3,r:15,w:"5kg"},{s:3,r:15,w:"5kg"},{s:3,r:12,w:"6kg"},{s:2,r:12,w:"4kg"}], rest:60, t:8 },
      { n: "Captain's Chair Leg Raise",     b: [{s:3,r:12,w:"BW"},{s:3,r:15,w:"BW"},{s:3,r:12,w:"BW"},{s:2,r:10,w:"BW"}], rest:60, t:8 },
    ]
  },
  {
    name: "Upper", sub: "HYPERTROPHY VOLUME", emoji: "🔷",
    color: "#a78bfa", glow: "rgba(167,139,250,0.25)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", bg: "rgba(167,139,250,0.08)",
    ex: [
      { n: "Chest Supported Row",           b: [{s:3,r:12,w:"27.5kg"},{s:3,r:10,w:"30kg"},{s:4,r:8,w:"35kg"},{s:2,r:10,w:"22.5kg"}], rest:90, t:8 },
      { n: "Machine Incline Chest Press",   b: [{s:3,r:12,w:"40kg"},{s:3,r:10,w:"42.5kg"},{s:3,r:8,w:"45kg"},{s:2,r:10,w:"32.5kg"}], rest:105, t:8 },
      { n: "Pec Dec",                       b: [{s:3,r:12,w:"35kg"},{s:3,r:12,w:"40kg"},{s:3,r:8,w:"45kg"},{s:2,r:10,w:"30kg"}], rest:75, t:8 },
      { n: "Single Arm Pulldown",           b: [{s:3,r:12,w:"22.5kg"},{s:3,r:10,w:"25kg"},{s:3,r:8,w:"27.5kg"},{s:2,r:10,w:"20kg"}], rest:75, t:8 },
      { n: "Machine Lateral Raise",         b: [{s:3,r:15,w:"20kg"},{s:3,r:15,w:"22.5kg"},{s:3,r:10,w:"25kg"},{s:2,r:12,w:"17.5kg"}], rest:60, t:8 },
      { n: "Pallof Press",                  b: [{s:3,r:12,w:"10kg"},{s:3,r:12,w:"10kg"},{s:3,r:10,w:"12.5kg"},{s:2,r:10,w:"7.5kg"}], rest:60, t:8 },
    ]
  },
  {
    name: "Arms", sub: "BICEPS · TRICEPS · FOREARMS", emoji: "🦾",
    color: "#f9c74f", glow: "rgba(249,199,79,0.25)", grad: "linear-gradient(135deg, #f9c74f, #f3722c)", bg: "rgba(249,199,79,0.08)",
    ex: [
      { n: "Close Grip Bench Press",        b: [{s:3,r:12,w:"50kg"},{s:3,r:10,w:"52.5kg"},{s:4,r:6,w:"60kg"},{s:2,r:8,w:"42.5kg"}], rest:180, t:8 },
      { n: "Tricep Pushdown machine",       b: [{s:3,r:12,w:"40kg"},{s:3,r:10,w:"42.5kg"},{s:3,r:8,w:"45kg"},{s:2,r:10,w:"35kg"}], rest:90, t:8 },
      { n: "Overhead Rope Extension (cable)", b: [{s:3,r:12,w:"27.5kg"},{s:3,r:12,w:"30kg"},{s:3,r:8,w:"32.5kg"},{s:2,r:10,w:"25kg"}], rest:90, t:8 },
      { n: "Bayesian Cable Curl",           b: [{s:3,r:12,w:"7.5kg"},{s:3,r:10,w:"7.5kg"},{s:3,r:8,w:"10kg"},{s:2,r:10,w:"5kg"}], rest:90, t:8 },
      { n: "Preacher Curl",                 b: [{s:3,r:12,w:"15kg"},{s:3,r:12,w:"17.5kg"},{s:3,r:8,w:"20kg"},{s:2,r:10,w:"12.5kg"}], rest:90, t:8 },
      { n: "Hammer Curl",                   b: [{s:3,r:12,w:"12kg"},{s:3,r:12,w:"12kg"},{s:3,r:8,w:"14kg"},{s:2,r:10,w:"10kg"}], rest:90, t:8 },
      { n: "Crunch machine",                b: [{s:3,r:15,w:"25kg"},{s:3,r:15,w:"30kg"},{s:3,r:10,w:"35kg"},{s:2,r:12,w:"25kg"}], rest:60, t:8 },
    ]
  },
  {
    name: "Legs", sub: "QUADS · HAMS · CALVES", emoji: "🔥",
    color: "#f97316", glow: "rgba(249,115,22,0.25)", grad: "linear-gradient(135deg, #f97316, #ef4444)", bg: "rgba(249,115,22,0.08)",
    ex: [
      { n: "Barbell Back Squat",            b: [{s:3,r:12,w:"45kg"},{s:3,r:10,w:"50kg"},{s:4,r:6,w:"62.5kg"},{s:2,r:6,w:"40kg"}], rest:150, t:7 },
      { n: "Romanian Deadlift",             b: [{s:3,r:12,w:"45kg"},{s:3,r:10,w:"50kg"},{s:3,r:6,w:"62.5kg"},{s:2,r:8,w:"40kg"}], rest:120, t:7 },
      { n: "Hack Squat",                    b: [{s:3,r:12,w:"Calibrate light"},{s:3,r:12,w:"Calibrate light"},{s:3,r:8,w:"Heavy"},{s:2,r:10,w:"Light"}], rest:90, t:7 },
      { n: "Leg Extension",                 b: [{s:3,r:15,w:"Calibrate"},{s:3,r:15,w:"Calibrate"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:75, t:8 },
      { n: "Calf Raise Machine",            b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light – stop if toe twinges"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:75, t:8 },
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
