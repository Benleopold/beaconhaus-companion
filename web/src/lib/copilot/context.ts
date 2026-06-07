import { getProfile, listCaptures, listFacilities, listPeople } from "@/lib/repo";
import { computeWarmth } from "@/lib/warmth";
import type { DataSnapshot, PageContext } from "./types";

const pick = (o: Record<string, unknown>, keys: string[]) => {
  const r: Record<string, unknown> = {};
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== "") r[k] = o[k];
  return r;
};

/** Assemble a compact snapshot of the user's real data for grounding. */
export async function buildDataSnapshot(): Promise<DataSnapshot> {
  const [people, facilities, captures, profileRow] = await Promise.all([
    listPeople(),
    listFacilities(),
    listCaptures(),
    getProfile(),
  ]);

  return {
    profile: profileRow
      ? pick(profileRow as unknown as Record<string, unknown>, [
          "displayName", "tagline", "weeklyWarmupGoal", "warmThresholdDays",
          "coolingThresholdDays", "morningWarmupCount", "weekCount",
        ])
      : null,
    people: people.map((p) => ({
      ...pick(p as unknown as Record<string, unknown>, [
        "fullName", "roleOrg", "sphere", "relationship", "doorsCanOpen", "theAsk",
        "status", "lastTouched", "nextStep", "notes", "email", "linkedinUrl",
      ]),
      warmth: computeWarmth(p.lastTouched),
    })),
    facilities: facilities.map((f) =>
      pick(f as unknown as Record<string, unknown>, [
        "facilityName", "type", "town", "region", "leadRoute", "aligned", "status",
        "decisionMaker", "title", "email", "website", "nextStep", "fitNotes",
      ]),
    ),
    captures: captures.map((c) =>
      pick(c as unknown as Record<string, unknown>, ["title", "type", "detail", "createdAt"]),
    ),
    counts: { people: people.length, facilities: facilities.length, captures: captures.length },
    generatedAt: new Date().toISOString(),
  };
}

const PAGES: Record<string, { title: string; summary: string }> = {
  "/": { title: "Today", summary: "The daily ritual: a one-at-a-time warmup of people to greet, coldest or never-touched first, plus the weekly hello count toward the goal." },
  "/network": { title: "Warm Network", summary: "The full list of people in the warm network, each with warmth (warm, cooling, or ready) and when they were last greeted." },
  "/places": { title: "Places", summary: "Target facilities with their type, region, lead route (warm or cold), alignment, status, and fit notes." },
  "/capture": { title: "Capture", summary: "Captured pain points, case studies, and ideas that feed the marketing package." },
  "/settings": { title: "Settings", summary: "Rhythm settings (warmth thresholds and weekly goal) and the governance principles." },
};

export function describePage(path: string): PageContext {
  const base = PAGES[path] ?? { title: "BeaconHaus", summary: `The user is on the page at ${path}.` };
  return { path, title: base.title, summary: base.summary };
}
