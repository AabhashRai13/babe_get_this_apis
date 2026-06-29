// Accuracy eval harness.
//
// What it does: takes the ground-truth cases in eval/cases.json, runs each one
// through the REAL pipeline (Whisper for `audio` cases, Claude for all of them),
// then scores the returned items field-by-field against what you expected and
// writes eval/report.{json,md}.
//
// It calls the service functions directly (not the HTTP route), so it skips
// Supabase auth/multer but spends real Groq + Anthropic API calls.
//
// Run:  npx tsx eval/run.ts
import { readFileSync, writeFileSync } from "node:fs";
import { transcribeAudio } from "../src/services/transcription.service.js";
import { parseItems } from "../src/services/claude.service.js";
import type { ShoppingItem } from "../src/dtos/transcribe.dto.js";

// An expected item only specifies the fields you care about — anything you omit
// is not scored (e.g. leave out `note` and we won't grade the note).
type Expected = Partial<ShoppingItem>;
interface Case {
  audio?: string; // file in demo_audio/ — runs the full Whisper + Claude pipeline
  text?: string; // raw transcript — skips Whisper, tests extraction only (cheaper)
  expected: Expected[];
}

// A mismatch on a HIGH field changes WHAT or WHERE you buy → fails the case.
// Everything else (unit, note) is LOW: logged, but doesn't fail the case.
const HIGH_FIELDS = new Set(["name", "quantity", "category", "location"]);
const FIELDS = ["name", "quantity", "unit", "category", "location", "note"] as const;

// Lowercase, drop punctuation, collapse spaces — so "Dan Murphy's" == "Dan
// Murphy’s" and "Band-Aids" == "band aids".
const norm = (v: unknown): string =>
  v == null ? "" : String(v).toLowerCase().replace(/['’]/g, "'").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Names rarely match to the letter ("bread" vs "loaf of bread"), so accept a
// substring either way rather than demanding an exact string.
const nameMatch = (a: string, b: string): boolean => {
  const x = norm(a);
  const y = norm(b);
  return x === y || x.includes(y) || y.includes(x);
};

// How to compare one field. quantity is numeric; name and note are fuzzy (the
// model adds descriptors like "frozen peas" / pluralizes); the rest are exact.
function fieldEqual(field: string, exp: unknown, act: unknown): boolean {
  if (field === "quantity") return (exp ?? null) === (act ?? null);
  if (field === "name") return nameMatch(String(exp ?? ""), String(act ?? ""));
  if (field === "note") {
    const e = norm(exp);
    const a = norm(act);
    if (!e) return true; // nothing expected → can't be wrong
    return a.includes(e) || e.includes(a) || e.split(/\W+/).some((w) => w.length > 2 && a.includes(w));
  }
  return norm(exp) === norm(act);
}

interface Diff {
  case: string;
  item: string;
  field: string;
  expected: unknown;
  actual: unknown;
  severity: "HIGH" | "LOW";
}

const cases: Case[] = JSON.parse(readFileSync("eval/cases.json", "utf8")).cases;

// Raw model outputs, keyed by case label. Live run hits the APIs and caches
// here; `--rescore` reads this back so grader tweaks cost zero API calls.
interface Raw {
  label: string;
  transcript: string;
  actual: ShoppingItem[];
}
const RESCORE = process.argv.includes("--rescore");
let raws: Raw[];
if (RESCORE) {
  raws = JSON.parse(readFileSync("eval/raw.json", "utf8"));
} else {
  raws = [];
  for (const c of cases) {
    const label = c.audio ?? c.text ?? "(case)";
    // text case → use it as-is; audio case → transcribe the file first.
    const transcript = c.text ?? (await transcribeAudio(readFileSync(`demo_audio/${c.audio}`), c.audio!, "audio/m4a"));
    const actual = await parseItems(transcript);
    raws.push({ label, transcript, actual });
  }
  writeFileSync("eval/raw.json", JSON.stringify(raws, null, 2));
}
const rawByLabel = new Map(raws.map((r) => [r.label, r]));

// Running totals: per-field ok/total, every mismatch, and a per-case summary.
const tally: Record<string, { ok: number; total: number }> = {};
for (const f of FIELDS) tally[f] = { ok: 0, total: 0 };
const diffs: Diff[] = [];
const perCase: { name: string; transcript: string; high: number; low: number }[] = [];

for (const c of cases) {
  const label = c.audio ?? c.text ?? "(case)";
  const { transcript, actual } = rawByLabel.get(label) ?? { transcript: "", actual: [] };

  const usedActual = new Set<number>(); // actual items already claimed by an expected
  let high = 0;
  let low = 0;
  const record = (d: Omit<Diff, "case">) => {
    diffs.push({ case: label, ...d });
    d.severity === "HIGH" ? high++ : low++;
  };

  for (const exp of c.expected) {
    // Items come back in any order, so align by name instead of position. First
    // unclaimed actual item whose name matches wins.
    let match = -1;
    for (let j = 0; j < actual.length; j++) {
      if (!usedActual.has(j) && exp.name && nameMatch(exp.name, actual[j].name)) {
        match = j;
        break;
      }
    }
    // No actual item matched this expected one → the model dropped it.
    if (match < 0) {
      record({ item: exp.name ?? "?", field: "item", expected: "present", actual: "MISSING", severity: "HIGH" });
      continue;
    }
    usedActual.add(match);
    const got = actual[match];
    // Score only the fields this expected item specified.
    for (const f of FIELDS) {
      if (!(f in exp)) continue;
      tally[f].total++;
      if (fieldEqual(f, exp[f], got[f])) tally[f].ok++;
      else record({ item: exp.name ?? "?", field: f, expected: exp[f], actual: got[f], severity: HIGH_FIELDS.has(f) ? "HIGH" : "LOW" });
    }
  }
  // Actual items nobody claimed = the model invented an extra item.
  actual.forEach((a, j) => {
    if (!usedActual.has(j)) record({ item: a.name, field: "item", expected: "ABSENT", actual: "extra item", severity: "HIGH" });
  });

  perCase.push({ name: label, transcript: transcript.trim(), high, low });
}

// ---- aggregate the scores ----
const fieldPct = (f: string) => (tally[f].total ? Math.round((tally[f].ok / tally[f].total) * 100) : null);
const allOk = FIELDS.reduce((s, f) => s + tally[f].ok, 0);
const allTotal = FIELDS.reduce((s, f) => s + tally[f].total, 0);
const overall = allTotal ? Math.round((allOk / allTotal) * 100) : 0;
const passed = perCase.filter((c) => c.high === 0).length; // a case "passes" with zero HIGH diffs

const report = {
  ranAt: new Date().toISOString(),
  overallFieldAccuracy: overall,
  casesPassed: `${passed}/${perCase.length}`,
  highSeverityDiffs: diffs.filter((d) => d.severity === "HIGH").length,
  lowSeverityDiffs: diffs.filter((d) => d.severity === "LOW").length,
  perField: Object.fromEntries(FIELDS.map((f) => [f, { accuracy: fieldPct(f), ok: tally[f].ok, total: tally[f].total }])),
  cases: perCase,
  diffs: diffs.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "HIGH" ? -1 : 1)), // HIGH first
};
writeFileSync("eval/report.json", JSON.stringify(report, null, 2));

// ---- human-readable markdown twin of the same data ----
const md: string[] = [
  `# Eval report`,
  ``,
  `- **Overall field accuracy:** ${overall}%`,
  `- **Cases passed (no HIGH diffs):** ${passed}/${perCase.length}`,
  `- **Diffs:** ${report.highSeverityDiffs} HIGH, ${report.lowSeverityDiffs} LOW`,
  ``,
  `## Per-field accuracy`,
  ``,
  `| Field | Accuracy | ok/total |`,
  `|-------|----------|----------|`,
  ...FIELDS.map((f) => `| ${f} | ${fieldPct(f) ?? "—"}% | ${tally[f].ok}/${tally[f].total} |`),
  ``,
  `## Mismatches (HIGH first)`,
  ``,
  `| Sev | Case | Item | Field | Expected | Got |`,
  `|-----|------|------|-------|----------|-----|`,
  ...report.diffs.map((d) => `| ${d.severity} | ${d.case} | ${d.item} | ${d.field} | ${JSON.stringify(d.expected)} | ${JSON.stringify(d.actual)} |`),
];
writeFileSync("eval/report.md", md.join("\n") + "\n");

console.log(`Overall ${overall}% | cases ${passed}/${perCase.length} | ${report.highSeverityDiffs} HIGH, ${report.lowSeverityDiffs} LOW`);
console.log(`Wrote eval/report.json and eval/report.md`);
