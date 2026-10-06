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
      { n: "Barbell OHP", b: [{s:4,r:12,w:"30kg"},{s:4,r:10,w:"37.5kg"},{s:4,r:10,w:"35kg"},{s:2,r:8,w:"32.5kg"}], rest:120, t:7 },
      { n: "Incline DB Press", b: [{s:4,r:12,w:"17.5kg"},{s:4,r:10,w:"22.5kg"},{s:3,r:10,w:"18kg"},{s:2,r:8,w:"18kg"}], rest:105, t:7 },
      { n: "Pec Dec", b: [{s:3,r:12,w:"Stack 7"},{s:3,r:12,w:"Stack 7"},{s:3,r:12,w:"30kg"},{s:2,r:10,w:"Stack 6"}], rest:75, t:7 },
      { n: "Machine Lateral Raise", b: [{s:3,r:15,w:"Light – calibrate"},{s:3,r:15,w:"Light – calibrate"},{s:3,r:15,w:"15kg"},{s:2,r:15,w:"Light – calibrate"}], rest:60, t:7 },
      { n: "Face Pull cable", b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:3,r:15,w:"25kg"},{s:2,r:15,w:"Light"}], rest:60, t:7 },
    ]
  },
  {
    name: "Pull", sub: "BACK · BICEPS · REAR DELTS", emoji: "🏋️",
    color: "#4ecdc4", glow: "rgba(78,205,196,0.25)", grad: "linear-gradient(135deg, #4ecdc4, #44a8c8)", bg: "rgba(78,205,196,0.08)",
    ex: [
      { n: "Deadlift machine", b: [{s:4,r:12,w:"80kg"},{s:3,r:10,w:"90kg"},{s:3,r:10,w:"30kg/side"},{s:2,r:4,w:"85kg"}], rest:150, t:7 },
      { n: "T-Bar Row", b: [{s:4,r:10,w:"50kg"},{s:3,r:10,w:"52.5kg"},{s:3,r:10,w:"25kg"},{s:2,r:8,w:"45kg"}], rest:120, t:7 },
      { n: "Chin Ups", b: [{s:3,r:10,w:"Thicker band"},{s:3,r:10,w:"Thin Red Band"},{s:3,r:10,w:"Blue Band"},{s:2,r:8,w:"Band"}], rest:90, t:7 },
      { n: "Exigo Pullover", b: [{s:3,r:12,w:"Calibrate"},{s:3,r:12,w:"Calibrate"},{s:3,r:12,w:"Calibrate"},{s:2,r:10,w:"Calibrate"}], rest:90, t:7 },
      { n: "Hammer Curl (standing)", b: [{s:3,r:12,w:"10kg"},{s:3,r:14,w:"12.5kg"},{s:3,r:12,w:"12kg"},{s:2,r:10,w:"10kg"}], rest:75, t:7 },
      { n: "Reverse DB Fly", b: [{s:3,r:15,w:"Stack 3"},{s:3,r:15,w:"Stack 4"},{s:3,r:15,w:"5kg"},{s:2,r:12,w:"Light"}], rest:75, t:7 },
    ]
  },
  {
    name: "Upper", sub: "HYPERTROPHY VOLUME", emoji: "🔷",
    color: "#a78bfa", glow: "rgba(167,139,250,0.25)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", bg: "rgba(167,139,250,0.08)",
    ex: [
      { n: "Machine Chest Press", b: [{s:3,r:12,w:"17.5kg"},{s:3,r:10,w:"22.5kg"},{s:3,r:10,w:"Calibrate"},{s:2,r:10,w:"Light"}], rest:105, t:7 },
      { n: "Chest Supported Row", b: [{s:3,r:12,w:"Calibrate"},{s:3,r:10,w:"27.5kg/side"},{s:3,r:10,w:"Calibrate"},{s:2,r:10,w:"Light"}], rest:90, t:7 },
      { n: "Pec Dec", b: [{s:3,r:15,w:"Stack 6"},{s:3,r:12,w:"Stack 7"},{s:3,r:12,w:"Up one increment"},{s:2,r:12,w:"Stack 5"}], rest:75, t:7 },
      { n: "Single Arm Pulldown", b: [{s:3,r:12,w:"15kg / Stack 3"},{s:3,r:10,w:"27.5kg / Stack 6"},{s:3,r:10,w:"Calibrate"},{s:2,r:10,w:"Light"}], rest:75, t:7 },
      { n: "Machine Lateral Raise", b: [{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:15,w:"Up one increment"},{s:2,r:12,w:"Light"}], rest:60, t:7 },
      { n: "Pallof Press", b: [{s:3,r:10,w:"15kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"10kg/side"},{s:2,r:10,w:"12.5kg"}], rest:60, t:7 },
    ]
  },
  {
    name: "Arms", sub: "BICEPS · TRICEPS · FOREARMS", emoji: "🦾",
    color: "#f9c74f", glow: "rgba(249,199,79,0.25)", grad: "linear-gradient(135deg, #f9c74f, #f3722c)", bg: "rgba(249,199,79,0.08)",
    ex: [
      { n: "Close Grip Bench Press", b: [{s:3,r:12,w:"52.5kg"},{s:3,r:10,w:"57.5kg"},{s:3,r:10,w:"50kg"},{s:2,r:10,w:"45kg"}], rest:180, t:7 },
      { n: "Tricep Pushdown machine", b: [{s:3,r:10,w:"Calibrate"},{s:3,r:10,w:"Calibrate"},{s:3,r:10,w:"22-25kg/side"},{s:2,r:10,w:"Calibrate"}], rest:90, t:7 },
      { n: "Preacher Curl", b: [{s:3,r:12,w:"10kg/side"},{s:3,r:12,w:"10kg/side"},{s:3,r:12,w:"15kg"},{s:2,r:10,w:"8.75kg/side"}], rest:90, t:7 },
      { n: "Bayesian Cable Curl", b: [{s:3,r:12,w:"10kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"5-7.5kg"},{s:2,r:12,w:"Light"}], rest:90, t:7 },
      { n: "Hammer Curl", b: [{s:3,r:12,w:"12.5kg"},{s:3,r:12,w:"15kg"},{s:3,r:12,w:"10kg"},{s:2,r:10,w:"10kg"}], rest:90, t:7 },
      { n: "Crunch machine", b: [{s:3,r:15,w:"25kg"},{s:3,r:15,w:"25kg"},{s:3,r:15,w:"25kg"},{s:2,r:12,w:"25kg"}], rest:60, t:7 },
    ]
  },
  {
    name: "Legs", sub: "LEGS", emoji: "🔥",
    color: "#f97316", glow: "rgba(249,115,22,0.25)", grad: "linear-gradient(135deg, #f97316, #ef4444)", bg: "rgba(249,115,22,0.08)",
    ex: [
      { n: "Leg Press", b: [{s:3,r:12,w:"30kg/side"},{s:3,r:10,w:"27.5kg/side"},{s:3,r:12,w:"Calibrate"},{s:2,r:10,w:"25kg/side"}], rest:120, t:7 },
      { n: "Romanian Deadlift", b: [{s:3,r:12,w:"60kg"},{s:3,r:10,w:"65kg"},{s:3,r:10,w:"45-50kg"},{s:2,r:8,w:"45kg"}], rest:120, t:7 },
      { n: "Leg Extension", b: [{s:3,r:15,w:"Calibrate"},{s:3,r:15,w:"Calibrate"},{s:3,r:15,w:"Calibrate"},{s:2,r:12,w:"Calibrate"}], rest:75, t:7 },
      { n: "Single Leg Kickback", b: [{s:3,r:15,w:"Calibrate /side"},{s:3,r:15,w:"Calibrate /side"},{s:3,r:15,w:"Calibrate /side"},{s:2,r:12,w:"Calibrate /side"}], rest:75, t:7 },
    ]
  },
  {
    name: "Core", sub: "MAT CORE · OPTIONAL", emoji: "🧘",
    color: "#f472b6", glow: "rgba(244,114,182,0.25)", grad: "linear-gradient(135deg, #f472b6, #db2777)", bg: "rgba(244,114,182,0.08)",
    ex: [
      { n: "Lying Leg Raise",          b: [{s:3,r:15,w:"BW"},{s:3,r:15,w:"BW"},{s:3,r:15,w:"BW"},{s:2,r:15,w:"BW"}], rest:60, t:7 },
      { n: "Dead Bug",                 b: [{s:3,r:12,w:"BW /side"},{s:3,r:12,w:"BW /side"},{s:3,r:12,w:"BW /side"},{s:2,r:12,w:"BW /side"}], rest:60, t:7 },
      { n: "Plank",                    b: [{s:3,r:1,w:"30-45s hold"},{s:3,r:1,w:"30-45s hold"},{s:3,r:1,w:"30-45s hold"},{s:2,r:1,w:"30-45s hold"}], rest:60, t:7 },
      { n: "Russian Twist",            b: [{s:3,r:20,w:"BW /side"},{s:3,r:20,w:"BW /side"},{s:3,r:20,w:"BW /side"},{s:2,r:20,w:"BW /side"}], rest:60, t:7 },
      { n: "Weighted Sit-Up (DB)",     b: [{s:3,r:15,w:"DB – calibrate"},{s:3,r:15,w:"DB – calibrate"},{s:3,r:15,w:"DB – calibrate"},{s:2,r:15,w:"DB – calibrate"}], rest:60, t:7 },
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
