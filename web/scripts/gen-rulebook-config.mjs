// Generates src/lib/rulebook.generated.ts from the ERB hub.
// The rulebook (effortless-rulebook/effortless-rulebook.json) is the single
// source of truth for vocabularies, rule parameters, governance, copy, and the
// curated seed. This is the "frontend config" spoke of the Leopold Loop:
//   CHANGE RULE -> npm run gen:rulebook -> CONSUME generated config in the app.
// Do not hand-edit the generated file.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RB = resolve(here, "../../effortless-rulebook/effortless-rulebook.json");
const OUT = resolve(here, "../src/lib/rulebook.generated.ts");

const slug = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "-");
const camel = (k) => k.charAt(0).toLowerCase() + k.slice(1);
const rb = JSON.parse(readFileSync(RB, "utf8"));

// Controlled vocabularies -> option lists keyed by their owning column.
const vocabSpec = {
  spheres: ["Spheres", "SphereLabel"],
  personStatuses: ["PersonStatuses", "StatusLabel"],
  facilityTypes: ["FacilityTypes", "TypeLabel"],
  regions: ["Regions", "RegionLabel"],
  leadRoutes: ["LeadRoutes", "LeadRouteLabel"],
  alignmentLevels: ["AlignmentLevels", "AlignmentLabel"],
  facilityStatuses: ["FacilityStatuses", "StatusLabel"],
  captureTypes: ["CaptureTypes", "TypeLabel"],
  warmthLevels: ["WarmthLevels", "WarmthLabel"],
};

const vocab = {};
for (const [key, [table, labelField]] of Object.entries(vocabSpec)) {
  vocab[key] = (rb[table]?.data ?? [])
    .map((row) => {
      const o = {
        value: slug(row[labelField]),
        label: row[labelField],
        sortOrder: row.SortOrder ?? 0,
      };
      if (row.Description) o.description = row.Description;
      if (row.Guidance) o.guidance = row.Guidance;
      return o;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// Per-user rule parameters + copy live in the single Profiles seed row.
const p = rb.Profiles?.data?.[0] ?? {};
const profile = {
  accountKey: p.AccountKey ?? "liz",
  displayName: p.DisplayName ?? "Liz",
  tagline: p.Tagline ?? "",
  weeklyWarmupGoal: p.WeeklyWarmupGoal ?? 4,
  warmThresholdDays: p.WarmThresholdDays ?? 14,
  coolingThresholdDays: p.CoolingThresholdDays ?? 30,
  morningWarmupCount: p.MorningWarmupCount ?? 3,
};

const governance = (rb.GovernanceRules?.data ?? [])
  .map((r) => ({ code: r.RuleCode, title: r.Title, statement: r.Statement, category: r.Category, sortOrder: r.SortOrder ?? 0 }))
  .sort((a, b) => a.sortOrder - b.sortOrder);

// Curated seed -> camelCased records with a stable id (the rulebook Name slug).
const nameField = { People: "FullName", Facilities: "FacilityName", Captures: "Title" };
const seedTable = (table) =>
  (rb[table]?.data ?? []).map((row) => {
    const rec = { id: slug(row[nameField[table]]) };
    for (const [k, v] of Object.entries(row)) rec[camel(k)] = v;
    return rec;
  });
const seed = { people: seedTable("People"), facilities: seedTable("Facilities"), captures: seedTable("Captures") };

const banner = `// AUTO-GENERATED from effortless-rulebook/effortless-rulebook.json
// Source of truth: the ERB hub. Do not edit by hand.
// Regenerate: npm run gen:rulebook
/* eslint-disable */\n`;

const body =
  banner +
  `export type VocabOption = { value: string; label: string; sortOrder: number; description?: string; guidance?: string };\n\n` +
  `export const vocab = ${JSON.stringify(vocab, null, 2)} as const;\n\n` +
  `export const profile = ${JSON.stringify(profile, null, 2)} as const;\n\n` +
  `export const governance = ${JSON.stringify(governance, null, 2)} as const;\n\n` +
  `export const seed = ${JSON.stringify(seed, null, 2)} as const;\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, body, "utf8");
console.log(`Wrote ${OUT}`);
console.log(
  `  vocab: ${Object.entries(vocab).map(([k, v]) => `${k}(${v.length})`).join(", ")}`
);
console.log(`  seed: people(${seed.people.length}) facilities(${seed.facilities.length}) captures(${seed.captures.length})`);
console.log(`  governance: ${governance.length} rules`);
