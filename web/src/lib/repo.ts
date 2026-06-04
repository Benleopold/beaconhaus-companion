import { db } from "./db";
import type { Person, Facility, Capture, Profile } from "./types";
import { seed, profile as profileSeed } from "./rulebook.generated";
import { nowISO, mondayOf } from "./utils";

const OWNER = profileSeed.accountKey;

export function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

async function uniqueId(base: string, table: Dexie_Table): Promise<string> {
  let id = base;
  let n = 2;
  while (await table.get(id)) id = `${base}-${n++}`;
  return id;
}
type Dexie_Table = { get(id: string): Promise<unknown> };

/** Seed the local store from the rulebook's curated reference data, once. */
export async function ensureSeeded(): Promise<void> {
  const existing = await db.profile.get(OWNER);
  if (existing) return;
  const t = nowISO();
  await db.transaction("rw", db.people, db.facilities, db.captures, db.profile, async () => {
    await db.profile.put({
      accountKey: profileSeed.accountKey,
      displayName: profileSeed.displayName,
      tagline: profileSeed.tagline,
      weeklyWarmupGoal: profileSeed.weeklyWarmupGoal,
      warmThresholdDays: profileSeed.warmThresholdDays,
      coolingThresholdDays: profileSeed.coolingThresholdDays,
      morningWarmupCount: profileSeed.morningWarmupCount,
      weekStart: mondayOf(),
      weekCount: 0,
    });
    for (const p of seed.people) await db.people.put({ createdAt: t, updatedAt: t, ...(p as object) } as Person);
    for (const f of seed.facilities) await db.facilities.put({ createdAt: t, updatedAt: t, ...(f as object) } as Facility);
    for (const c of seed.captures) await db.captures.put({ createdAt: t, ...(c as object) } as Capture);
  });
}

export async function getProfile(): Promise<Profile> {
  const p = await db.profile.get(OWNER);
  return (p ?? {
    accountKey: OWNER,
    displayName: profileSeed.displayName,
    tagline: profileSeed.tagline,
    weeklyWarmupGoal: profileSeed.weeklyWarmupGoal,
    warmThresholdDays: profileSeed.warmThresholdDays,
    coolingThresholdDays: profileSeed.coolingThresholdDays,
    morningWarmupCount: profileSeed.morningWarmupCount,
    weekStart: mondayOf(),
    weekCount: 0,
  }) as Profile;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const cur = await getProfile();
  await db.profile.put({ ...cur, ...patch });
}

/** Weekly count (R4): reset on a new Monday, otherwise increment. */
async function bumpWeeklyCount(): Promise<void> {
  const prof = await getProfile();
  const thisMonday = mondayOf();
  const weekCount = prof.weekStart === thisMonday ? (prof.weekCount ?? 0) + 1 : 1;
  await db.profile.put({ ...prof, weekStart: thisMonday, weekCount });
}

/** Log a hello (R3): set lastTouched to now, auto-advance status (R7), count it. */
export async function logHello(id: string): Promise<void> {
  const person = await db.people.get(id);
  if (!person) return;
  const patch: Partial<Person> = { lastTouched: nowISO(), updatedAt: nowISO() };
  if (person.status === "to-reach-out") patch.status = "reached-out"; // R7
  await db.people.update(id, patch);
  await bumpWeeklyCount();
}

// People -------------------------------------------------------------------
export async function savePerson(input: Partial<Person> & { fullName: string }): Promise<string> {
  const t = nowISO();
  if (input.id) {
    await db.people.update(input.id, { ...input, updatedAt: t });
    return input.id;
  }
  const id = await uniqueId(slugify(input.fullName), db.people);
  const record: Person = {
    owner: OWNER,
    status: "to-reach-out", // R6: only the name is required; sensible default status
    createdAt: t,
    updatedAt: t,
    ...input,
    id,
  } as Person;
  await db.people.put(record);
  return id;
}
export const deletePerson = (id: string) => db.people.delete(id);

// Facilities ---------------------------------------------------------------
export async function saveFacility(input: Partial<Facility> & { facilityName: string }): Promise<string> {
  const t = nowISO();
  if (input.id) {
    await db.facilities.update(input.id, { ...input, updatedAt: t });
    return input.id;
  }
  const id = await uniqueId(slugify(input.facilityName), db.facilities);
  const record: Facility = {
    owner: OWNER,
    status: "to-research",
    createdAt: t,
    updatedAt: t,
    ...input,
    id,
  } as Facility;
  await db.facilities.put(record);
  return id;
}
export const deleteFacility = (id: string) => db.facilities.delete(id);

// Captures -----------------------------------------------------------------
export async function saveCapture(input: Partial<Capture> & { title: string }): Promise<string> {
  const t = nowISO();
  if (input.id) {
    await db.captures.update(input.id, { ...input });
    return input.id;
  }
  const id = await uniqueId(slugify(input.title), db.captures);
  const record: Capture = { owner: OWNER, type: "idea", createdAt: t, ...input, id } as Capture;
  await db.captures.put(record);
  return id;
}
export const deleteCapture = (id: string) => db.captures.delete(id);
