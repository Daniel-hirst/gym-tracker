import { useState, useEffect, useRef, type ReactNode } from "react";

// Block index: 0=B1, 1=B2, 2=B3, 3=Deload
const BLOCKS = ["Block 1", "Block 2", "Block 3", "Deload"];

// ═══ EDIT THESE when the programme changes, then redeploy with `npm run deploy` ═══
// 0 = Block 1, 1 = Block 2, 2 = Block 3, 3 = Deload
const CURRENT_BLOCK = 0;
const CYCLE = 2;
// Bump by 1 whenever DAYS below is edited (new weights, exercises, etc.) — phones only
// rebuild the plan when this or CURRENT_BLOCK changes. PBs and history always carry over.
const PLAN_VERSION = 7;

type SetSpec = { s: number; r: number; w: string };
type ExerciseDef = { n: string; b: SetSpec[]; rest: number; t: number };
type DayDef = {
  name: string; sub: string; emoji: string;
  color: string; glow: string; grad: string; bg: string;
  ex: ExerciseDef[];
};
type WorkSet = { id: string; r: number; w: string; done: boolean; startW: string };
type Exercise = {
  id: string; n: string; sets: WorkSet[]; note: string;
  pb: number | null; rpe: number | null; target: number | null; rest: number; collapsed: boolean;
};
type DayState = { startedAt: number | null; ex: Exercise[] };
type HistorySet = { r: number; w: string; done: boolean };
type HistoryExercise = { n: string; rpe: number | null; note: string; pb: number | null; sets: HistorySet[] };
type HistoryEntry = { date: string; day: string; block: number; mins: number | null; volume: number | null; ex: HistoryExercise[] };

const DAYS: DayDef[] = [
  {
    name: "Push", sub: "SHOULDERS · CHEST · TRICEPS", emoji: "💪",
    color: "#ff6b6b", glow: "rgba(255,107,107,0.25)", grad: "linear-gradient(135deg, #ff6b6b, #ff8e53)", bg: "rgba(255,107,107,0.08)",
    ex: [
      { n: "Barbell OHP",       b: [{s:4,r:10,w:"30kg"},{s:4,r:8,w:"37.5kg"},{s:4,r:6,w:"42.5kg"},{s:2,r:8,w:"32.5kg"}], rest:120, t:7 },
      { n: "Incline DB Press",  b: [{s:4,r:10,w:"20kg"},{s:4,r:8,w:"22.5kg"},{s:4,r:6,w:"25kg"},{s:2,r:8,w:"18kg"}], rest:105, t:7 },
      { n: "Pec Dec",           b: [{s:3,r:12,w:"Stack 7"},{s:3,r:10,w:"Stack 8"},{s:3,r:8,w:"Stack 9"},{s:2,r:10,w:"Stack 6"}], rest:75, t:7 },
      { n: "Cable Lateral Raise", b: [{s:3,r:15,w:"Calibrate"},{s:3,r:12,w:"Progress"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:60, t:7 },
      { n: "Face Pull cable",   b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:2,r:15,w:"Light"}], rest:60, t:6 },
    ]
  },
  {
    name: "Pull", sub: "BACK · BICEPS · REAR DELTS", emoji: "🏋️",
    color: "#4ecdc4", glow: "rgba(78,205,196,0.25)", grad: "linear-gradient(135deg, #4ecdc4, #44a8c8)", bg: "rgba(78,205,196,0.08)",
    ex: [
      { n: "Conventional Deadlift",  b: [{s:4,r:10,w:"90kg"},{s:4,r:5,w:"100kg"},{s:4,r:4,w:"107.5kg"},{s:2,r:4,w:"85kg"}], rest:150, t:7 },
      { n: "Barbell Bent Over Row",  b: [{s:4,r:10,w:"50kg"},{s:4,r:8,w:"55kg"},{s:4,r:6,w:"60kg"},{s:2,r:8,w:"45kg"}], rest:120, t:7 },
      { n: "Pull Ups",               b: [{s:3,r:8,w:"Band"},{s:3,r:6,w:"BW"},{s:3,r:5,w:"Weighted"},{s:2,r:8,w:"Band"}], rest:90, t:7 },
      { n: "Hammer Curl",            b: [{s:3,r:12,w:"12.5kg"},{s:3,r:10,w:"15kg"},{s:3,r:8,w:"15kg"},{s:2,r:10,w:"10kg"}], rest:75, t:7 },
      { n: "Reverse Pec Dec",        b: [{s:3,r:15,w:"Calibrate"},{s:3,r:12,w:"Progress"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:75, t:7 },
    ]
  },
  {
    name: "Upper", sub: "HYPERTROPHY VOLUME", emoji: "🔷",
    color: "#a78bfa", glow: "rgba(167,139,250,0.25)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)", bg: "rgba(167,139,250,0.08)",
    ex: [
      { n: "Incline DB Press",      b: [{s:3,r:12,w:"20kg"},{s:4,r:10,w:"22.5kg"},{s:4,r:8,w:"25kg"},{s:2,r:10,w:"18kg"}], rest:105, t:7 },
      { n: "Chest Supported Row",   b: [{s:3,r:12,w:"20kg"},{s:4,r:10,w:"Progress"},{s:4,r:8,w:"Heavy"},{s:2,r:10,w:"Light"}], rest:90, t:7 },
      { n: "Pec Dec",               b: [{s:3,r:15,w:"Stack 6"},{s:3,r:12,w:"Stack 7"},{s:3,r:10,w:"Stack 8"},{s:2,r:12,w:"Stack 5"}], rest:75, t:7 },
      { n: "Single Arm Pulldown",   b: [{s:3,r:12,w:"15kg / Stack 3"},{s:3,r:10,w:"Progress"},{s:3,r:8,w:"Heavy"},{s:2,r:10,w:"Light"}], rest:75, t:7 },
      { n: "Cable Lateral Raise",   b: [{s:3,r:15,w:"5kg / Stack 1"},{s:3,r:12,w:"Progress"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:60, t:7 },
      { n: "Face Pull cable",       b: [{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:3,r:15,w:"Light"},{s:2,r:15,w:"Light"}], rest:60, t:6 },
    ]
  },
  {
    name: "Arms", sub: "BICEPS · TRICEPS · FOREARMS", emoji: "🦾",
    color: "#f9c74f", glow: "rgba(249,199,79,0.25)", grad: "linear-gradient(135deg, #f9c74f, #f3722c)", bg: "rgba(249,199,79,0.08)",
    ex: [
      { n: "Close Grip Bench Press",     b: [{s:4,r:12,w:"50kg"},{s:4,r:10,w:"55kg"},{s:4,r:8,w:"60kg"},{s:2,r:10,w:"45kg"}], rest:90, t:7 },
      { n: "Overhead Tricep Ext rope",   b: [{s:3,r:12,w:"Stack 6"},{s:3,r:10,w:"Stack 7"},{s:3,r:8,w:"Stack 8"},{s:2,r:10,w:"Stack 5"}], rest:75, t:7 },
      { n: "Tricep Pushdown rope",       b: [{s:3,r:12,w:"Stack 6"},{s:3,r:10,w:"Stack 7"},{s:3,r:8,w:"Stack 8"},{s:2,r:10,w:"Stack 5"}], rest:60, t:7 },
      { n: "Incline DB Curl",            b: [{s:3,r:12,w:"10kg"},{s:3,r:10,w:"12.5kg"},{s:3,r:8,w:"12.5kg"},{s:2,r:10,w:"9kg"}], rest:75, t:7 },
      { n: "Preacher Curl",              b: [{s:3,r:12,w:"7.5kg/side"},{s:3,r:10,w:"8.75kg/side"},{s:3,r:8,w:"8.75kg/side"},{s:2,r:10,w:"6.25kg/side"}], rest:75, t:7 },
      { n: "Hammer Curl",                b: [{s:3,r:12,w:"12.5kg"},{s:3,r:10,w:"15kg"},{s:3,r:8,w:"15kg"},{s:2,r:10,w:"10kg"}], rest:60, t:7 },
      { n: "Bayesian Cable Curl",        b: [{s:3,r:12,w:"Calibrate"},{s:3,r:12,w:"Progress"},{s:3,r:10,w:"Heavy"},{s:2,r:12,w:"Light"}], rest:60, t:7 },
    ]
  },
  {
    name: "Legs", sub: "LEGS · CORE", emoji: "🔥",
    color: "#f97316", glow: "rgba(249,115,22,0.25)", grad: "linear-gradient(135deg, #f97316, #ef4444)", bg: "rgba(249,115,22,0.08)",
    ex: [
      { n: "Barbell Back Squat",   b: [{s:4,r:8,w:"65kg"},{s:4,r:6,w:"72.5kg"},{s:4,r:5,w:"80kg"},{s:2,r:6,w:"55kg"}], rest:150, t:7 },
      { n: "Romanian Deadlift",    b: [{s:3,r:10,w:"65kg"},{s:3,r:8,w:"72.5kg"},{s:3,r:6,w:"80kg"},{s:2,r:8,w:"57.5kg"}], rest:120, t:7 },
      { n: "Leg Press",            b: [{s:3,r:12,w:"30kg/side"},{s:3,r:10,w:"35kg/side"},{s:3,r:8,w:"40kg/side"},{s:2,r:10,w:"25kg/side"}], rest:120, t:7 },
      { n: "Hack Squat",           b: [{s:3,r:10,w:"Calibrate"},{s:3,r:10,w:"Progress"},{s:3,r:8,w:"Heavy"},{s:2,r:10,w:"Light"}], rest:90, t:7 },
      { n: "Calf Raise",           b: [{s:3,r:15,w:"40kg/side"},{s:3,r:12,w:"45kg/side"},{s:3,r:10,w:"50kg/side"},{s:2,r:12,w:"32.5kg/side"}], rest:90, t:7 },
      { n: "Cable Crunch",         b: [{s:3,r:15,w:"65kg"},{s:3,r:12,w:"70kg"},{s:3,r:12,w:"75kg"},{s:2,r:12,w:"55kg"}], rest:60, t:7 },
      { n: "Hanging Leg Raise",    b: [{s:3,r:12,w:"BW"},{s:3,r:10,w:"BW"},{s:3,r:10,w:"BW"},{s:2,r:10,w:"BW"}], rest:60, t:7 },
      { n: "Dumbbell Side Bend",   b: [{s:3,r:15,w:"20kg/side"},{s:3,r:15,w:"22.5kg/side"},{s:3,r:15,w:"25kg/side"},{s:2,r:15,w:"15kg/side"}], rest:60, t:7 },
      { n: "Pallof Press",         b: [{s:3,r:10,w:"17.5kg"},{s:3,r:10,w:"20kg"},{s:3,r:10,w:"22.5kg"},{s:2,r:10,w:"12.5kg"}], rest:60, t:7 },
    ]
  },
];

function uid(): string { return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function makeSets(count: number, r: number, w: string): WorkSet[] { return Array(count).fill(null).map(() => ({ id: uid(), r, w, done: false, startW: w })); }

function initState(blockIdx: number): DayState[] {
  return DAYS.map(d => ({
    startedAt: null,
    ex: d.ex.map(e => {
      const b = e.b[blockIdx];
      return { id: uid(), n: e.n, sets: makeSets(b.s, b.r, b.w), note: "", pb: null, rpe: null, target: e.t, rest: e.rest || 90, collapsed: false };
    })
  }));
}

function fmt(s: number): string { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function parseWeight(w: string): number | null { const m = String(w || "").match(/[\d.]+/); return m ? parseFloat(m[0]) : null; }
// Only treat plain kg values as PB-able — "Stack 7", "Band", "40kg/side" etc. are not comparable weights
function isKgWeight(w: string): boolean { return /^\s*\d+(\.\d+)?\s*(kg)?\s*$/i.test(String(w || "")); }

// localStorage is blocked inside claude.ai artifacts (sandboxed iframe) — this no-ops there,
// but persists automatically if the app is ever hosted for real.
const store = {
  get<T>(k: string): T | null { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : null; } catch { return null; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// The programme lives in code (CURRENT_BLOCK / PLAN_VERSION above), so on load we compare
// them against what the saved state was built from — if either changed, rebuild the plan
// from DAYS and keep the PBs.
function loadState(): DayState[] {
  const saved = store.get<DayState[]>("gym-state");
  const savedBlock = store.get<number>("gym-block");
  const savedVersion = store.get<number>("gym-plan-version");
  if (saved && savedBlock === CURRENT_BLOCK && savedVersion === PLAN_VERSION) return saved;
  const ns = initState(CURRENT_BLOCK);
  if (saved) {
    const pbs: Record<string, number> = {};
    saved.forEach(d => d.ex.forEach(e => { if (e.pb) pbs[e.n] = Math.max(pbs[e.n] || 0, e.pb); }));
    ns.forEach(d => d.ex.forEach(e => { if (pbs[e.n]) e.pb = pbs[e.n]; }));
  }
  return ns;
}

const C = {
  bg: "#0c0e13", surface: "#13161e", surface2: "#1a1e28", surface3: "#222736",
  border: "rgba(255,255,255,0.05)", border2: "rgba(255,255,255,0.1)",
  text: "#f0f2f7", muted: "#7d8595", faint: "#4d5666",
  success: "#34d399", successBg: "rgba(52,211,153,0.08)", successGlow: "rgba(52,211,153,0.2)",
  pb: "#fbbf24", pbGlow: "rgba(251,191,36,0.2)",
  timer: "#38bdf8", timerDone: "#f87171",
};

const RPE_COLORS = ["","","","","#34d399","#34d399","#34d399","#fbbf24","#fb923c","#f87171","#f87171"];

// Tested 1RMs baked in from PT sessions (kg). Newer in-app entries (progress
// screen) override these; keys are exercise names as they appear in DAYS.
const TESTED_1RMS: Record<string, { w: number; date: string }> = {
  "Conventional Deadlift": { w: 125, date: "2026-07-03" },
  "Barbell Back Squat":    { w: 90,   date: "2026-07-03" },
  "Bench Press":           { w: 77.5, date: "2026-07-03" }, // not in the current plan; kept for future programmes
  "Barbell OHP":           { w: 55,   date: "2026-07-03" },
};

type OneRm = { w: number; date: string };

// Warm-up ramp for barbell lifts: empty bar, then rounded % steps up to the work weight
const BARBELL_RE = /barbell|deadlift|squat|bench press|ohp/i;
function warmupRamp(target: number, bar = 20): { w: number; r: number }[] {
  const out: { w: number; r: number }[] = [{ w: bar, r: 10 }];
  ([[0.55, 5], [0.7, 3], [0.85, 2]] as const).forEach(([p, r]) => {
    const w = Math.round((target * p) / 2.5) * 2.5;
    if (w > bar + 2.4 && w < target && !out.some(s => s.w === w)) out.push({ w, r });
  });
  return out;
}
function rmKey(name: string): string { return name.trim().toLowerCase(); }
function getOneRm(oneRms: Record<string, OneRm>, name: string): OneRm | null { return oneRms[rmKey(name)] ?? null; }

// ── Progress charts / estimated 1RM ──────────────────────────────────────────
// Epley e1RM; only computed for plain-kg sets (same comparability rule as PBs)
function epley(w: number, r: number): number { return r <= 1 ? w : w * (1 + r / 30); }
function fmtKg(v: number): string { return String(Math.round(v * 2) / 2); }
function fmtNum(v: number): string { return v >= 1000 ? Math.round(v).toLocaleString() : fmtKg(v); }

type SeriesPoint = { date: Date; e1rm: number | null; top: number | null; vol: number | null };

function exerciseSeries(history: HistoryEntry[], name: string): SeriesPoint[] {
  const key = name.trim().toLowerCase();
  const pts: SeriesPoint[] = [];
  for (const h of history) {
    const m = h.ex.find(x => x.n.trim().toLowerCase() === key && x.sets.some(s => s.done));
    if (!m) continue;
    let top: number | null = null, e1: number | null = null, vol = 0;
    for (const s of m.sets) {
      if (!s.done) continue;
      const w = parseWeight(s.w);
      if (w == null) continue;
      if (/kg/i.test(s.w)) vol += w * s.r;
      if (isKgWeight(s.w)) {
        if (top == null || w > top) top = w;
        const e = epley(w, s.r);
        if (e1 == null || e > e1) e1 = e;
      }
    }
    if (top != null || vol > 0) pts.push({ date: new Date(h.date), e1rm: e1, top, vol: vol > 0 ? Math.round(vol) : null });
  }
  return pts;
}

function bestE1rm(history: HistoryEntry[], name: string): number | null {
  let best: number | null = null;
  exerciseSeries(history, name).forEach(p => { if (p.e1rm != null && (best == null || p.e1rm > best)) best = p.e1rm; });
  return best;
}

function niceTicks(lo: number, hi: number): number[] {
  const span = hi - lo;
  const pow = Math.pow(10, Math.floor(Math.log10(span / 3)));
  let step = pow;
  for (const c of [1, 2, 2.5, 5, 10].map(m => m * pow)) if (span / c >= 2.2) step = c;
  const first = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let v = first; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

const CHART_ACCENT = "#0284c7"; // validated ≥3:1 vs the dark surface

export function LineChart({ points, unit, sel, onSel, refLine }: { points: { date: Date; v: number }[]; unit: string; sel: number; onSel: (i: number) => void; refLine?: { v: number; label: string } | null }) {
  const W = 360, H = 190, L = 40, R = 14, T = 26, B = 22;
  const vals = points.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (refLine) { lo = Math.min(lo, refLine.v); hi = Math.max(hi, refLine.v); }
  const pad = (hi - lo) * 0.15 || hi * 0.08 || 1;
  lo = Math.max(0, lo - pad); hi += pad;
  const x = (i: number) => points.length === 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (points.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const last = points.length - 1;
  const maxI = vals.indexOf(Math.max(...vals));
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const dt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const selP = sel >= 0 && sel < points.length ? points[sel] : null;
  const tipW = 96, tipX = selP ? Math.min(Math.max(x(sel) - tipW / 2, L), W - R - tipW) : 0;
  const tipAbove = selP ? y(selP.v) > T + 46 : true;
  const tipY = selP ? (tipAbove ? y(selP.v) - 44 : y(selP.v) + 12) : 0;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {niceTicks(lo, hi).map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize={9} fill={C.faint} fontFamily="inherit">{fmtNum(t)}</text>
        </g>
      ))}
      {refLine && (
        <g>
          <line x1={L} x2={W - R} y1={y(refLine.v)} y2={y(refLine.v)} stroke={C.pb} strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={W - R} y={y(refLine.v) - 5} textAnchor="end" fontSize={9} fill={C.muted} fontFamily="inherit">{refLine.label}</text>
        </g>
      )}
      <path d={path} fill="none" stroke={CHART_ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.v)} r={i === last ? 5 : 4} fill={CHART_ACCENT} stroke={C.surface} strokeWidth={2} />
      ))}
      {maxI !== last && points.length > 1 && (
        <text x={x(maxI)} y={y(points[maxI].v) - 9} textAnchor="middle" fontSize={10} fill={C.muted} fontFamily="inherit">{fmtNum(points[maxI].v)}</text>
      )}
      <text x={Math.min(x(last), W - R - 4)} y={y(points[last].v) - 9} textAnchor={x(last) > W - R - 30 ? "end" : "middle"} fontSize={10} fontWeight={700} fill={C.text} fontFamily="inherit">{fmtNum(points[last].v)}</text>
      <text x={L} y={H - 6} fontSize={9} fill={C.faint} fontFamily="inherit">{dt(points[0].date)}</text>
      {points.length > 1 && <text x={W - R} y={H - 6} textAnchor="end" fontSize={9} fill={C.faint} fontFamily="inherit">{dt(points[last].date)}</text>}
      {points.map((_, i) => (
        <rect key={`h${i}`} x={x(i) - 14} y={0} width={28} height={H} fill="transparent" onClick={() => onSel(sel === i ? -1 : i)} />
      ))}
      {selP && (
        <g pointerEvents="none">
          <rect x={tipX} y={tipY} width={tipW} height={32} rx={7} fill={C.surface3} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <text x={tipX + tipW / 2} y={tipY + 13} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="inherit">{dt(selP.date)}</text>
          <text x={tipX + tipW / 2} y={tipY + 26} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.text} fontFamily="inherit">{fmtNum(selP.v)}{unit}</text>
        </g>
      )}
    </svg>
  );
}

const Adj = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border2}`, background: C.surface3, color: C.text, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>{children}</button>
);

const CSS = `
  @keyframes gentlePulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes popIn { 0%{transform:scale(0.92);opacity:0} 100%{transform:scale(1);opacity:1} }
  .scroll-area::-webkit-scrollbar{display:none}
  .scroll-area{-ms-overflow-style:none;scrollbar-width:none}
  button:active{opacity:0.7;transform:scale(0.95)}
  /* Home-screen (standalone) mode draws under the iPhone status bar; some iOS versions
     report a zero safe-area inset there, so fall back to a typical notch height. */
  @media (display-mode: standalone) {
    .app-root { padding-top: max(env(safe-area-inset-top), 54px) !important; }
  }
`;

export default function GymTracker() {
  const [cur, setCur] = useState(0);
  const [state, setState] = useState<DayState[]>(loadState);
  const [history, setHistory] = useState<HistoryEntry[]>(() => store.get<HistoryEntry[]>("gym-history") ?? []);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [plateTarget, setPlateTarget] = useState("");
  const [barWeight, setBarWeight] = useState(20);
  const [pbFlash, setPbFlash] = useState<number | null>(null);
  const [restLeft, setRestLeft] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(90);
  const [activeExRest, setActiveExRest] = useState(90);
  const [isFlashing, setIsFlashing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const pbTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undoDel, setUndoDel] = useState<{ ex: Exercise; day: number; idx: number } | null>(null);
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [oneRms, setOneRms] = useState<Record<string, OneRm>>(() => {
    // Merge code-baked tests with in-app entries; the newer date wins per exercise
    const merged: Record<string, OneRm> = { ...(store.get<Record<string, OneRm>>("gym-1rms") ?? {}) };
    Object.entries(TESTED_1RMS).forEach(([k, v]) => {
      const kk = rmKey(k);
      if (!merged[kk] || new Date(v.date) > new Date(merged[kk].date)) merged[kk] = v;
    });
    return merged;
  });
  const [rmText, setRmText] = useState("");
  const [chartEx, setChartEx] = useState<string | null>(null);
  const [metric, setMetric] = useState<"e1rm" | "top" | "vol">("e1rm");
  const [chartSel, setChartSel] = useState(-1);
  const [openSession, setOpenSession] = useState(-1);

  const day = DAYS[cur];
  const exs = state[cur].ex;
  const missingFromPlan = day.ex.filter(p => !exs.some(e => e.n.trim().toLowerCase() === p.n.trim().toLowerCase())).length;
  const doneTotal = exs.filter(e => e.sets.every(s => s.done)).length;
  const pct = exs.length ? Math.round((doneTotal / exs.length) * 100) : 0;
  const startedAt = state[cur].startedAt;
  // Volume only counts sets with a real kg weight — machine stacks / bands / bodyweight aren't comparable
  const sessionVol = Math.round(exs.reduce((t, e) => t + e.sets.reduce((a, s) => {
    const w = parseWeight(s.w);
    return a + (s.done && w && /kg/i.test(s.w || "") ? w * s.r : 0);
  }, 0), 0));
  const sessionMins = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : null;
  const restDone = restLeft === 0;
  const timerActive = restLeft !== null;

  // AudioContext must be created during a user gesture (ticking a set) to be allowed to play later
  function unlockAudio() {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioRef.current.state === "suspended") audioRef.current.resume();
    } catch {}
  }

  function beep() {
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== "running") return;
    try {
      [0, 0.18, 0.36].forEach((t, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = i === 2 ? 1320 : 880;
        const at = ctx.currentTime + t;
        g.gain.setValueAtTime(0.001, at);
        g.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.15);
        o.start(at); o.stop(at + 0.16);
      });
    } catch {}
  }

  function syncTimer() {
    if (endRef.current == null) return;
    const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
    setRestLeft(left);
    if (left === 0) {
      const wasRunning = !!timerRef.current;
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setIsFlashing(true);
      if (flashRef.current) clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => setIsFlashing(false), 6000);
      if (wasRunning) {
        beep();
        try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
      }
    }
  }

  function startTimer(sec: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
    setIsFlashing(false); endRef.current = Date.now() + sec * 1000; setRestTotal(sec); setRestLeft(sec);
    timerRef.current = setInterval(syncTimer, 250);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (flashRef.current) clearTimeout(flashRef.current);
    endRef.current = null; setRestLeft(null); setIsFlashing(false);
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
    if (pbTimeoutRef.current) clearTimeout(pbTimeoutRef.current);
    if (toastRef.current) clearTimeout(toastRef.current);
    if (undoRef.current) clearTimeout(undoRef.current);
  }, []);

  // No-ops inside a claude.ai artifact; persists everything if hosted as a real site
  useEffect(() => { store.set("gym-state", state); }, [state]);
  useEffect(() => { store.set("gym-block", CURRENT_BLOCK); store.set("gym-plan-version", PLAN_VERSION); }, []);
  useEffect(() => { store.set("gym-1rms", oneRms); }, [oneRms]);
  useEffect(() => { store.set("gym-history", history); }, [history]);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible") syncTimer(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function update(fn: (s: DayState[]) => void) {
    setState(s => {
      const ns = s.slice();
      ns[cur] = { ...s[cur], ex: s[cur].ex.map(e => ({ ...e, sets: e.sets.map(set => ({ ...set })) })) };
      fn(ns);
      return ns;
    });
  }

  function togSet(ei: number, si: number) {
    const e = state[cur].ex[ei];
    const set = e.sets[si];
    const nowDone = !set.done;
    const stamp = Date.now();
    update(s => {
      if (nowDone && !s[cur].startedAt) s[cur].startedAt = stamp;
      const ex = s[cur].ex[ei];
      ex.sets[si].done = nowDone;
      if (nowDone && ex.sets.every(st => st.done)) ex.collapsed = true;
      if (!nowDone) ex.collapsed = false;
      if (nowDone) {
        const w = parseWeight(ex.sets[si].w);
        if (isKgWeight(ex.sets[si].w) && w && (!ex.pb || w > ex.pb)) ex.pb = w;
      }
    });
    // Side effects stay outside the setState updater (it can run twice under StrictMode)
    if (nowDone) {
      unlockAudio();
      const w = parseWeight(set.w);
      if (isKgWeight(set.w) && w && e.pb && w > e.pb) {
        setPbFlash(ei);
        if (pbTimeoutRef.current) clearTimeout(pbTimeoutRef.current);
        pbTimeoutRef.current = setTimeout(() => setPbFlash(null), 3000);
      }
      const r = e.rest || 90;
      setActiveExRest(r);
      startTimer(r);
    }
  }

  function adjSetR(ei: number, si: number, d: number) { update(s => { s[cur].ex[ei].sets[si].r = Math.max(1, s[cur].ex[ei].sets[si].r + d); }); }
  function setSetReps(ei: number, si: number, v: string) { update(s => { const n = parseInt(v, 10); s[cur].ex[ei].sets[si].r = isNaN(n) ? 0 : Math.min(99, Math.max(0, n)); }); }
  function blurSetReps(ei: number, si: number) { update(s => { if (!s[cur].ex[ei].sets[si].r) s[cur].ex[ei].sets[si].r = 1; }); }

  // PBs now register when a set is ticked done (in togSet), not while typing
  function upSetW(ei: number, si: number, v: string) { update(s => { s[cur].ex[ei].sets[si].w = v; }); }

  function adjExRest(ei: number, d: number) { update(s => { s[cur].ex[ei].rest = Math.max(15, Math.min(300, (s[cur].ex[ei].rest || 90) + d)); }); }
  function upRpe(ei: number, v: number) { update(s => { s[cur].ex[ei].rpe = s[cur].ex[ei].rpe === v ? null : v; }); }
  function toggleCollapse(ei: number) { update(s => { s[cur].ex[ei].collapsed = !s[cur].ex[ei].collapsed; }); }
  function addSet(ei: number) { update(s => { const sets = s[cur].ex[ei].sets; const last = sets[sets.length-1]; sets.push({ id: uid(), r: last?.r||10, w: last?.w||"", done: false, startW: last?.w||"" }); }); }
  function removeSet(ei: number) { update(s => { const sets = s[cur].ex[ei].sets; if (sets.length > 1 && !sets[sets.length - 1].done) sets.pop(); }); }
  function upN(i: number, v: string) { update(s => { s[cur].ex[i].n = v; }); }
  function blurN(i: number) { update(s => { if (!s[cur].ex[i].n.trim()) s[cur].ex[i].n = "Exercise"; }); }
  function upNote(i: number, v: string) { update(s => { s[cur].ex[i].note = v; }); }
  // Deletes are soft for a few seconds — the toast offers tap-to-undo
  function delE(i: number) {
    const removed = state[cur].ex[i];
    setUndoDel({ ex: removed, day: cur, idx: i });
    if (undoRef.current) clearTimeout(undoRef.current);
    undoRef.current = setTimeout(() => setUndoDel(null), 6000);
    update(s => { s[cur].ex.splice(i, 1); });
  }

  function undoDelete() {
    if (!undoDel) return;
    setState(s => {
      const ns = s.slice();
      const ex = ns[undoDel.day].ex.slice();
      ex.splice(Math.min(undoDel.idx, ex.length), 0, undoDel.ex);
      ns[undoDel.day] = { ...ns[undoDel.day], ex };
      return ns;
    });
    setUndoDel(null);
    if (undoRef.current) clearTimeout(undoRef.current);
    showToast("Exercise restored 👍");
  }

  // Re-add any plan exercises missing from this day (deleted ones), fresh from DAYS
  function restorePlan() {
    const planned = DAYS[cur].ex;
    const have = new Set(state[cur].ex.map(e => e.n.trim().toLowerCase()));
    const missing = planned.filter(p => !have.has(p.n.trim().toLowerCase()));
    if (!missing.length) return;
    update(s => {
      missing.forEach(p => {
        const b = p.b[CURRENT_BLOCK];
        const idx = Math.min(planned.indexOf(p), s[cur].ex.length);
        s[cur].ex.splice(idx, 0, { id: uid(), n: p.n, sets: makeSets(b.s, b.r, b.w), note: "", pb: null, rpe: null, target: p.t, rest: p.rest || 90, collapsed: false });
      });
    });
    showToast(`Restored ${missing.length} exercise${missing.length > 1 ? "s" : ""} from the plan`);
  }
  function addEx() { update(s => { s[cur].ex.push({ id: uid(), n: "New exercise", sets: makeSets(3,10,""), note: "", pb: null, rpe: null, target: null, rest: 90, collapsed: false }); }); }
  function resetDay() {
    if (!window.confirm("Reset this day?")) return;
    update(s => { s[cur].startedAt = null; s[cur].ex.forEach(e => { e.sets.forEach(set => { set.done = false; }); e.note = ""; e.collapsed = false; }); });
    stopTimer();
  }
  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2500);
  }

  function finishSession() {
    if (!exs.some(e => e.sets.some(s => s.done))) { showToast("Nothing ticked yet"); return; }
    if (!window.confirm("Finish session? Saves it to history and clears the ticks.")) return;
    const rec: HistoryEntry = {
      date: new Date().toISOString(), day: day.name, block: CURRENT_BLOCK,
      mins: sessionMins, volume: sessionVol || null,
      ex: exs.map(e => ({ n: e.n, rpe: e.rpe, note: e.note, pb: e.pb, sets: e.sets.map(s => ({ r: s.r, w: s.w, done: s.done })) })),
    };
    setHistory(h => [...h, rec]);
    update(s => { s[cur].startedAt = null; s[cur].ex.forEach(e => { e.sets.forEach(set => { set.done = false; }); e.note = ""; e.collapsed = false; e.rpe = null; }); });
    stopTimer();
    showToast("Session saved to history 📒");
  }

  // In an artifact, refreshing loses everything — backup/restore via clipboard is the lifeline
  function backup() {
    const data = JSON.stringify({ v: 1, block: CURRENT_BLOCK, state, history });
    navigator.clipboard.writeText(data)
      .then(() => showToast("Backup copied — paste it somewhere safe"))
      .catch(() => showToast("Copy failed"));
  }

  function restore() {
    try {
      const d = JSON.parse(restoreText);
      if (!d || !Array.isArray(d.state)) throw new Error("bad backup");
      setState(d.state); setHistory(d.history ?? []);
      setShowRestore(false); setRestoreText("");
      showToast("Backup restored 💾");
    } catch { showToast("Couldn't read that backup"); }
  }

  function saveRm() {
    if (!activeChartEx) return;
    const k = rmKey(activeChartEx);
    if (!rmText.trim()) {
      setOneRms(o => { const n = { ...o }; delete n[k]; return n; });
      showToast("Tested 1RM cleared");
      return;
    }
    const v = parseFloat(rmText);
    if (isNaN(v) || v <= 0) { showToast("Enter a weight in kg"); return; }
    setOneRms(o => ({ ...o, [k]: { w: v, date: new Date().toISOString().slice(0, 10) } }));
    showToast(`Tested 1RM saved: ${fmtKg(v)}kg 🏆`);
  }

  // Most recent completed entry for this exercise name, plus a progression hint:
  // all sets done last time at RPE ≤ 7 (or unrecorded) → suggest a small bump on the top weight
  function lastTime(name: string) {
    for (let i = history.length - 1; i >= 0; i--) {
      const m = history[i].ex.find(x => x.n === name && x.sets.some(s => s.done));
      if (!m) continue;
      const done = m.sets.filter(s => s.done);
      let top: { w: number; raw: string; r: number } | null = null;
      for (const s of done) { const w = parseWeight(s.w); if (w != null && (!top || w > top.w)) top = { w, raw: s.w, r: s.r }; }
      let next: number | null = null;
      if (top && isKgWeight(top.raw) && m.sets.every(s => s.done) && (m.rpe == null || m.rpe <= 7)) {
        next = top.w + (top.w >= 20 ? 2.5 : 1.25);
      }
      return { date: new Date(history[i].date), label: top ? `${top.raw} ×${top.r}` : `${done.length} sets`, next };
    }
    return null;
  }

  function copySession() {
    const today = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
    const lines = [`${day.emoji} ${day.name} — Cycle ${CYCLE} · ${BLOCKS[CURRENT_BLOCK]} (${today})`];
    const stats: string[] = [];
    if (sessionMins) stats.push(`Duration: ${sessionMins} min`);
    if (sessionVol > 0) stats.push(`Volume: ${sessionVol.toLocaleString()}kg (completed kg sets)`);
    if (stats.length) lines.push(stats.join(" · "));
    lines.push("");
    const wasNote = (set: WorkSet) => set.startW && set.w && set.w !== set.startW ? ` (was ${set.startW})` : "";
    const doneExs = exs.filter(e => e.sets.every(s => s.done));
    const partialExs = exs.filter(e => !e.sets.every(s => s.done) && e.sets.some(s => s.done));
    const skipExs = exs.filter(e => e.sets.every(s => !s.done));
    const rpeNote = (e: Exercise) => e.rpe ? ` | RPE ${e.rpe}${e.target ? ` (target ${e.target})` : ""}` : e.target ? ` | target RPE ${e.target}` : "";
    if (doneExs.length) { lines.push("Completed:"); doneExs.forEach(e => { lines.push(`  ✓ ${e.n}${e.pb?` 🏆 PB: ${e.pb}kg`:""}${rpeNote(e)}`); e.sets.forEach((set,i) => lines.push(`      Set ${i+1}: ${set.r} reps @ ${set.w||"—"}${wasNote(set)}`)); if(e.note) lines.push(`      Note: ${e.note}`); }); }
    if (partialExs.length) { lines.push(""); lines.push("Partial:"); partialExs.forEach(e => { lines.push(`  ~ ${e.n} — ${e.sets.filter(s=>s.done).length}/${e.sets.length} sets${rpeNote(e)}`); e.sets.forEach((set,i) => lines.push(`      Set ${i+1}: ${set.r} reps @ ${set.w||"—"}${wasNote(set)} ${set.done?"✓":"✗"}`)); if(e.note) lines.push(`      Note: ${e.note}`); }); }
    if (skipExs.length) { lines.push(""); lines.push("Skipped:"); skipExs.forEach(e => lines.push(`  ✗ ${e.n}`)); }
    lines.push(""); lines.push(`Total: ${doneTotal}/${exs.length} completed.`);
    navigator.clipboard.writeText(lines.join("\n"))
      .then(() => { setCopied(true); showToast("Paste into Claude PT! 💪"); setTimeout(() => setCopied(false), 3000); })
      .catch(() => showToast("Copy failed"));
  }

  // Exercises with logged history, plan order first, for the progress screen
  const chartNames: string[] = [];
  history.forEach(h => h.ex.forEach(e => { if (e.sets.some(s => s.done) && !chartNames.includes(e.n)) chartNames.push(e.n); }));
  const planOrder = DAYS.flatMap(d => d.ex.map(e => e.n));
  chartNames.sort((a, b) => {
    const ia = planOrder.indexOf(a), ib = planOrder.indexOf(b);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  const activeChartEx = chartEx && chartNames.includes(chartEx) ? chartEx : chartNames[0] ?? null;
  const activeRm = activeChartEx ? getOneRm(oneRms, activeChartEx) : null;
  const series = activeChartEx ? exerciseSeries(history, activeChartEx) : [];
  const chartPts = series.flatMap(p => (p[metric] != null ? [{ date: p.date, v: p[metric] as number }] : []));
  const METRICS: { key: "e1rm" | "top" | "vol"; label: string; unit: string }[] = [
    { key: "e1rm", label: "est. 1RM", unit: "kg" },
    { key: "top", label: "top weight", unit: "kg" },
    { key: "vol", label: "volume", unit: "kg" },
  ];

  // Prefill the tested-1RM box for the exercise being viewed
  useEffect(() => {
    if (showProgress && activeChartEx) { const rm = getOneRm(oneRms, activeChartEx); setRmText(rm ? String(rm.w) : ""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProgress, activeChartEx]);

  const timerColor = restDone ? C.timerDone : C.timer;
  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (restLeft !== null && restTotal > 0 ? restLeft / restTotal : 1);
  const timerBarPct = restLeft !== null && restTotal > 0 ? (restLeft / restTotal) * 100 : 0;

  return (
    <div className="app-root" style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, fontFamily: "'SF Pro Display',-apple-system,'Helvetica Neue',sans-serif", color: C.text, maxWidth: 460, margin: "0 auto", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
      <style>{CSS}</style>

      <div className="scroll-area" style={{ flex: 1, overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "22px 16px 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, left: -20, width: 200, height: 200, borderRadius: "50%", background: day.glow, filter: "blur(60px)", pointerEvents: "none", opacity: 0.5 }} />
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>Dan's Programme · Cycle {CYCLE} · {BLOCKS[CURRENT_BLOCK]}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: day.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 16px ${day.glow}` }}>{day.emoji}</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, color: C.text, lineHeight: 1 }}>{day.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3, letterSpacing: "0.1em" }}>{day.sub}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right", paddingTop: 4 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: pct === 100 ? C.success : C.text, lineHeight: 1 }}>{pct}<span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>%</span></div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{doneTotal}/{exs.length} done</div>
            </div>
          </div>

          <div style={{ height: 4, background: C.surface3, borderRadius: 100, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? `linear-gradient(90deg, ${C.success}, #6ee7b7)` : day.grad, borderRadius: 100, transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5, padding: "0 16px 16px" }}>
          {DAYS.map((d, i) => {
            const allDone = state[i].ex.length > 0 && state[i].ex.every(e => e.sets.every(s => s.done));
            const isActive = i === cur;
            return (
              <div key={i} onClick={() => setCur(i)} style={{
                padding: "10px 2px", fontSize: 12, fontWeight: 600, textAlign: "center", borderRadius: 10,
                cursor: "pointer", userSelect: "none",
                background: isActive ? d.bg : allDone ? C.successBg : C.surface,
                border: `1px solid ${isActive ? d.color + "60" : allDone ? C.success + "40" : C.border}`,
                color: isActive ? d.color : allDone ? C.success : C.muted,
                boxShadow: isActive ? `0 0 12px ${d.glow}` : "none",
                transition: "all .2s",
              }}>
                <div style={{ fontSize: 16, marginBottom: 3, filter: isActive || allDone ? "none" : "grayscale(1)", opacity: isActive || allDone ? 1 : 0.55 }}>{d.emoji}</div>
                {d.name}
              </div>
            );
          })}
        </div>

        {/* Exercise cards */}
        <div style={{ padding: "0 16px" }}>
          {exs.map((e, j) => {
            const allDone = e.sets.every(s => s.done);
            const isPb = pbFlash === j;
            const isCollapsed = e.collapsed;
            const doneSets = e.sets.filter(s => s.done).length;

            return (
              <div key={e.id} style={{
                background: allDone ? "rgba(52,211,153,0.06)" : isPb ? "rgba(251,191,36,0.06)" : C.surface,
                border: `1px solid ${allDone ? C.success + "40" : isPb ? C.pb + "40" : C.border}`,
                borderRadius: 16, padding: "14px", marginBottom: 10,
                boxShadow: allDone ? `0 0 20px ${C.successGlow}` : isPb ? `0 0 20px ${C.pbGlow}` : "none",
                transition: "all .3s cubic-bezier(.4,0,.2,1)",
                animation: "popIn .2s ease",
              }}>
                <div style={{ height: 2, borderRadius: 2, marginBottom: 12, background: allDone ? `linear-gradient(90deg, ${C.success}, transparent)` : isPb ? `linear-gradient(90deg, ${C.pb}, transparent)` : `linear-gradient(90deg, ${day.color}, transparent)`, opacity: 0.8 }} />

                {isPb && <div style={{ background: `linear-gradient(135deg, ${C.pb}, #f59e0b)`, color: "#000", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, display: "inline-flex", gap: 4, marginBottom: 8 }}>🏆 NEW PERSONAL BEST!</div>}
                {!isPb && (() => {
                  const rm = getOneRm(oneRms, e.n);
                  if (!e.pb && !rm) return null;
                  const bE = rm ? null : bestE1rm(history, e.n);
                  const kgWs = e.sets.filter(s => isKgWeight(s.w)).map(s => parseWeight(s.w) || 0);
                  const pct = rm && kgWs.length ? Math.round((Math.max(...kgWs) / rm.w) * 100) : null;
                  return (
                    <div style={{ color: C.pb, fontSize: 11, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      🏆 <span>{e.pb ? `PB: ${e.pb}kg` : ""}</span>
                      {rm ? <span style={{ color: C.muted, fontWeight: 600 }}>{e.pb ? "· " : ""}1RM {fmtKg(rm.w)}kg{pct && pct > 10 && pct <= 110 ? ` · today ${pct}%` : ""}</span> : bE ? <span style={{ color: C.muted, fontWeight: 600 }}>· e1RM ~{fmtKg(bE)}kg</span> : null}
                    </div>
                  );
                })()}
                {!isCollapsed && (() => { const lt = lastTime(e.n); return lt ? <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>↩ last: {lt.label} · {lt.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{lt.next ? <span style={{ color: C.success, fontWeight: 700 }}> · try {lt.next}kg ↗</span> : null}</div> : null; })()}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isCollapsed ? 0 : 12 }}>
                  <input value={e.n} onChange={ev => upN(j, ev.target.value)} onBlur={() => blurN(j)} style={{ flex: 1, fontSize: 16, fontWeight: 600, color: C.text, background: "transparent", border: "none", outline: "none", fontFamily: "inherit", padding: 0, lineHeight: 1.3 }} />
                  {!isCollapsed && !allDone && <button onClick={() => delE(j)} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "8px 10px" }}>✕</button>}
                </div>

                {isCollapsed && (
                  <div onClick={() => toggleCollapse(j)} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer", padding: "10px 12px", background: C.surface2, borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>✓ {doneSets} sets</span>
                    <span style={{ fontSize: 12, color: C.faint }}>·</span>
                    <span style={{ fontSize: 13, color: C.muted }}>{e.sets[e.sets.length-1]?.w || "—"}</span>
                    {e.rpe && <span style={{ fontSize: 12, color: RPE_COLORS[e.rpe] }}>· RPE {e.rpe}</span>}
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>expand ↑</span>
                  </div>
                )}

                {!isCollapsed && (<>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.1em" }}>RPE{e.target ? <span style={{ color: C.faint, letterSpacing: 0 }}> →{e.target}</span> : null}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[6,7,8,9,10].map(v => {
                          const isTarget = e.target === v && e.rpe !== v;
                          return (
                            <button key={v} onClick={() => upRpe(j, v)} style={{ width: 36, height: 36, borderRadius: 9, border: e.rpe === v ? `1px solid ${RPE_COLORS[v]}` : isTarget ? `1px dashed ${RPE_COLORS[v]}88` : `1px solid ${C.border2}`, background: e.rpe === v ? RPE_COLORS[v] + "22" : "transparent", color: e.rpe === v ? RPE_COLORS[v] : isTarget ? RPE_COLORS[v] + "cc" : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>{v}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface2, borderRadius: 10, padding: "5px 8px" }}>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.1em" }}>REST</span>
                      <button onClick={() => adjExRest(j, -15)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: C.surface3, color: C.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.timer, minWidth: 38, textAlign: "center" }}>{fmt(e.rest || 90)}</span>
                      <button onClick={() => adjExRest(j, 15)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: C.surface3, color: C.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  </div>

                  {(() => {
                    const w0 = e.sets.length && isKgWeight(e.sets[0].w) ? parseWeight(e.sets[0].w) : null;
                    if (!w0 || w0 < 30 || !BARBELL_RE.test(e.n) || e.sets.some(s => s.done)) return null;
                    return (
                      <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>
                        🔥 warm-up: {warmupRamp(w0).map(s => `${s.w === 20 ? "bar" : s.w}×${s.r}`).join(" · ")}
                      </div>
                    );
                  })()}

                  <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr 46px", gap: 5, marginBottom: 5, padding: "0 2px" }}>
                    <div /><div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", textAlign: "center" }}>REPS</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", textAlign: "center" }}>WEIGHT</div><div />
                  </div>

                  {e.sets.map((set, si) => {
                    const weightChanged = set.startW && set.w && set.w !== set.startW;
                    return (
                      <div key={set.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr 46px", gap: 5, marginBottom: 5, alignItems: "center", background: set.done ? "rgba(52,211,153,0.07)" : C.surface2, borderRadius: 10, padding: "7px 5px", border: `1px solid ${set.done ? C.success + "50" : "transparent"}`, transition: "all .2s" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: set.done ? C.success : C.faint, textAlign: "center" }}>{si + 1}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                          <Adj onClick={() => adjSetR(j, si, -1)}>−</Adj>
                          <input value={set.r === 0 ? "" : set.r} onChange={ev => setSetReps(j, si, ev.target.value)} onBlur={() => blurSetReps(j, si)} inputMode="numeric" pattern="[0-9]*" style={{ fontSize: 18, fontWeight: 700, width: 30, textAlign: "center", color: C.text, background: "transparent", border: "none", outline: "none", fontFamily: "inherit", padding: 0 }} />
                          <Adj onClick={() => adjSetR(j, si, 1)}>+</Adj>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <input value={set.w} onChange={ev => upSetW(j, si, ev.target.value)} placeholder="weight" style={{ fontSize: 15, fontWeight: 600, color: C.text, background: C.surface3, border: `1px solid ${C.border}`, outline: "none", fontFamily: "inherit", width: "100%", textAlign: "center", padding: "8px 4px", borderRadius: 8, boxSizing: "border-box" }} />
                          {weightChanged && <div style={{ fontSize: 10, color: C.timer, textAlign: "center" }}>was {set.startW}</div>}
                        </div>
                        <button onClick={() => togSet(j, si)} style={{ width: 44, height: 44, borderRadius: 11, cursor: "pointer", border: `1px solid ${set.done ? C.success + "80" : C.border2}`, background: set.done ? `linear-gradient(135deg, ${C.success}, #6ee7b7)` : "transparent", color: set.done ? "#000" : C.muted, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", fontWeight: 700 }}>
                          {set.done ? "✓" : ""}
                        </button>
                      </div>
                    );
                  })}

                  <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 10 }}>
                    <button onClick={() => addSet(j)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px dashed ${C.border2}`, background: "transparent", color: C.muted, fontSize: 12, fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>+ add set</button>
                    {e.sets.length > 1 && <button onClick={() => removeSet(j)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px dashed ${C.border2}`, background: "transparent", color: C.muted, fontSize: 12, fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>− set</button>}
                    <button onClick={() => delE(j)} style={{ padding: "10px 14px", borderRadius: 8, border: `1px dashed ${C.border2}`, background: "transparent", color: C.muted, fontSize: 12, fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>del</button>
                  </div>

                  <textarea value={e.note} onChange={ev => upNote(j, ev.target.value)} placeholder="Notes — how it felt, form cues..." rows={1} style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", fontSize: 13, color: C.muted, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
                </>)}
              </div>
            );
          })}
          <button onClick={addEx} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: 13, border: `1px dashed ${C.border2}`, borderRadius: 13, background: "transparent", color: C.muted, fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, marginTop: 4 }}>+ add exercise</button>
          {missingFromPlan > 0 && (
            <button onClick={restorePlan} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: 13, border: `1px dashed ${C.timer}55`, borderRadius: 13, background: "rgba(56,189,248,0.06)", color: C.timer, fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, marginTop: 6 }}>
              ↩ restore {missingFromPlan} missing exercise{missingFromPlan > 1 ? "s" : ""} from the plan
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 16px 20px", borderTop: `1px solid ${C.border}`, marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: pct === 100 ? C.success : C.muted }}>{pct === 100 ? "session complete! 🎉" : `${pct}% complete`}{sessionMins ? ` · ${sessionMins} min` : ""}{sessionVol > 0 ? ` · ${sessionVol.toLocaleString()}kg` : ""}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowPlateCalc(p => !p)} style={{ fontSize: 12, color: showPlateCalc ? C.timer : C.muted, background: showPlateCalc ? "rgba(56,189,248,0.1)" : "transparent", border: `1px solid ${showPlateCalc ? C.timer + "60" : C.border2}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", padding: "8px 12px", fontWeight: 600, transition: "all .15s" }}>🏋️ plates</button>
              <button onClick={() => { setShowProgress(true); setChartSel(-1); setOpenSession(-1); }} style={{ fontSize: 12, color: C.muted, background: "transparent", border: `1px solid ${C.border2}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", padding: "8px 12px", fontWeight: 600 }}>📈 progress</button>
              <button onClick={resetDay} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "8px 10px" }}>reset</button>
            </div>
          </div>

          {showPlateCalc && (() => {
            const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
            const target = parseFloat(plateTarget);
            const plates: { kg: number; count: number }[] = [];
            if (!isNaN(target) && target > barWeight) {
              let rem = (target - barWeight) / 2;
              for (const p of PLATES) { const c = Math.floor(rem / p); if (c > 0) { plates.push({ kg: p, count: c }); rem = Math.round((rem - c * p) * 1000) / 1000; } }
            }
            const isValid = !isNaN(target) && target > barWeight;
            return (
              <div style={{ background: C.surface2, borderRadius: 13, padding: 14, border: `1px solid rgba(56,189,248,0.15)` }}>
                <div style={{ fontSize: 11, color: C.timer, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>PLATE CALCULATOR</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.08em" }}>BAR</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[15, 20].map(b => (
                        <button key={b} onClick={() => setBarWeight(b)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${barWeight===b ? C.timer+"60" : C.border2}`, background: barWeight===b ? "rgba(56,189,248,0.1)" : "transparent", color: barWeight===b ? C.timer : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{b}kg</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.08em" }}>TARGET</span>
                    <input type="number" value={plateTarget} onChange={ev => setPlateTarget(ev.target.value)} placeholder="e.g. 80" style={{ width: "100%", background: C.surface3, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "6px 10px", fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                {isValid && plates.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>EACH SIDE</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {plates.map((p, i) => (
                        <div key={i} style={{ background: C.surface, borderRadius: 9, padding: "6px 12px", border: `1px solid ${C.border2}` }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.count > 1 ? `${p.count}×` : ""}{p.kg}kg</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{barWeight}kg bar + {(target-barWeight)/2}kg each side = {target}kg</div>
                  </div>
                )}
                {!plateTarget && <div style={{ fontSize: 13, color: C.muted }}>Enter a total weight to see plate breakdown</div>}
              </div>
            );
          })()}

          <button onClick={copySession} style={{ width: "100%", padding: 15, borderRadius: 12, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${copied ? C.success + "60" : C.border2}`, background: copied ? "rgba(52,211,153,0.1)" : C.surface2, color: copied ? C.success : C.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
            {copied ? "✓ copied — paste into claude pt" : "copy session for claude pt"}
          </button>

          <button onClick={finishSession} style={{ width: "100%", padding: 13, borderRadius: 12, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${C.success}44`, background: "rgba(52,211,153,0.08)", color: C.success, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            ✓ finish session — save to history{history.length > 0 ? ` (${history.length} saved)` : ""}
          </button>

          <div style={{ textAlign: "center", fontSize: 10, color: C.faint }}>build {__BUILD_STAMP__}</div>
        </div>
      </div>

      {/* Progress & history */}
      {showProgress && (
        <div className="scroll-area" style={{ position: "fixed", inset: 0, zIndex: 500, background: C.bg, overflowY: "auto" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", padding: "calc(18px + env(safe-area-inset-top)) 16px calc(30px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>📈 Progress</div>
              <button onClick={() => setShowProgress(false)} style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${C.border2}`, background: C.surface, color: C.muted, fontSize: 17, cursor: "pointer" }}>✕</button>
            </div>

            {history.length === 0 ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, textAlign: "center", color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
                No sessions saved yet.<br />Finish a session and your charts start here. 💪
              </div>
            ) : (
              <>
                {/* Exercise picker */}
                <div className="scroll-area" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 6 }}>
                  {chartNames.map(n => (
                    <button key={n} onClick={() => { setChartEx(n); setChartSel(-1); }} style={{ flexShrink: 0, padding: "8px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${n === activeChartEx ? C.timer + "60" : C.border2}`, background: n === activeChartEx ? "rgba(56,189,248,0.1)" : C.surface, color: n === activeChartEx ? C.timer : C.muted }}>{n}</button>
                  ))}
                </div>

                {/* Metric toggle */}
                <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                  {METRICS.map(m => (
                    <button key={m.key} onClick={() => { setMetric(m.key); setChartSel(-1); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${metric === m.key ? C.timer + "60" : C.border}`, background: metric === m.key ? "rgba(56,189,248,0.1)" : C.surface, color: metric === m.key ? C.timer : C.muted }}>{m.label}</button>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 10px 8px", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, padding: "0 6px", marginBottom: 6 }}>
                    {activeChartEx} — {METRICS.find(m => m.key === metric)?.label} (kg)
                  </div>
                  {chartPts.length === 0 ? (
                    <div style={{ padding: "28px 12px", textAlign: "center", color: C.faint, fontSize: 13 }}>No comparable kg sets logged for this one yet</div>
                  ) : (
                    <LineChart points={chartPts} unit="kg" sel={chartSel} onSel={setChartSel} refLine={metric !== "vol" && activeRm ? { v: activeRm.w, label: `tested 1RM ${fmtKg(activeRm.w)}` } : null} />
                  )}
                </div>

                {/* Tested 1RM entry */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.08em" }}>TESTED 1RM</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {activeRm ? `saved ${new Date(activeRm.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "log a real single here"}
                    </div>
                  </div>
                  <input value={rmText} onChange={ev => setRmText(ev.target.value)} inputMode="decimal" placeholder="kg" style={{ width: 68, background: C.surface3, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "9px 8px", fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "inherit", outline: "none", textAlign: "center" }} />
                  <button onClick={saveRm} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.pb}44`, background: "rgba(251,191,36,0.08)", color: C.pb, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>save</button>
                </div>

                {/* Stat tiles */}
                {chartPts.length > 0 && (() => {
                  const bE = bestE1rm(history, activeChartEx!);
                  let bW: number | null = null;
                  series.forEach(p => { if (p.top != null && (bW == null || p.top > bW)) bW = p.top; });
                  const tiles = [
                    { label: "Best est. 1RM", value: bE ? `${fmtKg(bE)}kg` : "—" },
                    { label: "Best weight", value: bW ? `${fmtKg(bW)}kg` : "—" },
                    { label: "Sessions", value: String(series.length) },
                  ];
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 20 }}>
                      {tiles.map(t => (
                        <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{t.label}</div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{t.value}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Session log */}
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.muted, marginBottom: 8 }}>SESSION LOG</div>
                {[...history].reverse().map((h, ri) => {
                  const d = new Date(h.date);
                  const open = openSession === ri;
                  const doneEx = h.ex.filter(e => e.sets.some(s => s.done));
                  return (
                    <div key={h.date + ri} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 6, overflow: "hidden" }}>
                      <div onClick={() => setOpenSession(open ? -1 : ri)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px", cursor: "pointer" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.day}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <span style={{ fontSize: 11, color: C.faint, marginLeft: "auto" }}>
                          {h.mins ? `${h.mins}min · ` : ""}{h.volume ? `${h.volume.toLocaleString()}kg · ` : ""}{doneEx.length} ex {open ? "▾" : "▸"}
                        </span>
                      </div>
                      {open && (
                        <div style={{ padding: "0 13px 11px", borderTop: `1px solid ${C.border}` }}>
                          {doneEx.map((e, ei) => (
                            <div key={ei} style={{ marginTop: 9 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                                {e.n}{e.pb ? <span style={{ color: C.pb }}> 🏆{e.pb}kg</span> : null}{e.rpe ? <span style={{ color: C.muted }}> · RPE {e.rpe}</span> : null}
                              </div>
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                {e.sets.filter(s => s.done).map(s => `${s.r}×${s.w || "—"}`).join("  ")}
                              </div>
                              {e.note ? <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>“{e.note}”</div> : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Backup / restore */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>DATA</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={backup} style={{ flex: 1, fontSize: 12, color: C.muted, background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", padding: "11px 0", fontWeight: 600 }}>copy backup</button>
                <button onClick={() => setShowRestore(p => !p)} style={{ flex: 1, fontSize: 12, color: showRestore ? C.timer : C.muted, background: showRestore ? "rgba(56,189,248,0.1)" : C.surface, border: `1px solid ${showRestore ? C.timer + "60" : C.border2}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", padding: "11px 0", fontWeight: 600 }}>restore</button>
              </div>
              {showRestore && (
                <div style={{ background: C.surface2, borderRadius: 13, padding: 14, border: `1px solid rgba(56,189,248,0.15)` }}>
                  <textarea value={restoreText} onChange={ev => setRestoreText(ev.target.value)} placeholder="Paste a backup here..." rows={3} style={{ width: "100%", background: C.surface3, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: C.text, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 8 }} />
                  <button onClick={restore} disabled={!restoreText.trim()} style={{ width: "100%", padding: 11, borderRadius: 8, border: `1px solid ${C.timer}44`, background: "rgba(56,189,248,0.1)", color: restoreText.trim() ? C.timer : C.faint, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>restore backup</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      {timerActive && (
        <div style={{ flexShrink: 0, animation: isFlashing ? "gentlePulse 1.4s ease-in-out infinite" : "none" }}>
          <div style={{ height: 2, background: C.surface3 }}>
            <div style={{ height: "100%", width: timerBarPct + "%", background: restDone ? `linear-gradient(90deg, ${C.timerDone}, #fca5a5)` : `linear-gradient(90deg, ${C.timer}, #7dd3fc)`, transition: "width .9s linear" }} />
          </div>
          <div style={{ background: restDone ? "rgba(248,113,113,0.08)" : C.surface, borderTop: `1px solid ${timerColor}22`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
              <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={24} cy={24} r={radius} fill="none" stroke={C.surface3} strokeWidth={3} />
                <circle cx={24} cy={24} r={radius} fill="none" stroke={timerColor} strokeWidth={3} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: restDone ? 11 : 14, fontWeight: 700, color: timerColor }}>{restDone ? "GO!" : fmt(restLeft ?? 0)}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: timerColor }}>{restDone ? "Rest done — GO!" : "Resting..."}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{restDone ? "Tap a set when ready" : `${fmt(restTotal)} target`}</div>
            </div>
            <button onClick={() => startTimer(activeExRest)} style={{ width: 44, height: 44, borderRadius: 11, border: `1px solid ${timerColor}44`, background: timerColor + "11", color: timerColor, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
            <button onClick={stopTimer} style={{ width: 44, height: 44, borderRadius: 11, border: `1px solid ${C.border2}`, background: "transparent", color: C.muted, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
      )}

      {toast && <div style={{ position: "fixed", bottom: `calc(${timerActive ? 96 : 20}px + env(safe-area-inset-bottom))`, left: "50%", transform: "translateX(-50%)", background: C.surface2, border: `1px solid ${C.border2}`, color: C.text, fontSize: 13, padding: "10px 18px", borderRadius: 100, pointerEvents: "none", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap", zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{toast}</div>}

      {undoDel && (
        <button onClick={undoDelete} style={{ position: "fixed", bottom: `calc(${(timerActive ? 96 : 20) + (toast ? 52 : 0)}px + env(safe-area-inset-bottom))`, left: "50%", transform: "translateX(-50%)", background: C.surface2, border: `1px solid ${C.timer}66`, color: C.text, fontSize: 13, padding: "12px 18px", borderRadius: 100, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap", zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8, animation: "popIn .2s ease" }}>
          <span style={{ color: C.muted }}>deleted “{undoDel.ex.n}”</span>
          <span style={{ color: C.timer, fontWeight: 700 }}>UNDO</span>
        </button>
      )}
    </div>
  );
}
