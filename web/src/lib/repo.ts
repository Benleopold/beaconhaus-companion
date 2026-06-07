import { db } from "./db";
import type { Person, Facility, Capture, Profile } from "./types";
import { seed, profile as profileSeed } from "./rulebook.generated";
import { nowISO, mondayOf } from "./utils";
import { apiGet, apiPost, isRemoteConfigured, isSupabaseConfigured, isNeonConfigured } from "./backend";
import {
  ensureSupabaseSeeded,
  getSupabasePerson,
  getSupabaseProfile,
  updateSupabaseProfile,
  listSupabasePeople,
  saveSupabasePerson,
  patchSupabasePerson,
  deleteSupabasePerson,
  listSupabaseFacilities,
  saveSupabaseFacility,
  deleteSupabaseFacility,
  listSupabaseCaptures,
  saveSupabaseCapture,
  deleteSupabaseCapture,
  resetSupabaseAll,
} from "./supabase/data";

const OWNER = profileSeed.accountKey;
type Row = Record<string, unknown>;

const listeners = new Set<() => void>();

export function subscribeRepo(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyRepoChange(): void {
  for (const listener of listeners) listener();
}

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

const str = (v: unknown): string | undefined => (typeof v === "string" && v.length ? v : undefined);
const num = (v: unknown, fallback: number): number => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

function personFromRow(row: Row): Person {
  return {
    id: String(row.people_id ?? row.id),
    fullName: String(row.full_name ?? ""),
    owner: String(row.owner ?? ""),
    roleOrg: str(row.role_org),
    sphere: str(row.sphere),
    relationship: str(row.relationship),
    doorsCanOpen: str(row.doors_can_open),
    theAsk: str(row.the_ask),
    email: str(row.email),
    phone: str(row.phone),
    linkedinUrl: str(row.linkedin_url),
    status: str(row.status),
    lastTouched: str(row.last_touched) ?? null,
    nextStep: str(row.next_step),
    notes: str(row.notes),
    createdAt: str(row.created_at) ?? nowISO(),
    updatedAt: str(row.updated_at) ?? nowISO(),
  };
}

function facilityFromRow(row: Row): Facility {
  return {
    id: String(row.facilities_id ?? row.id),
    facilityName: String(row.facility_name ?? ""),
    owner: String(row.owner ?? ""),
    type: str(row.type),
    town: str(row.town),
    region: str(row.region),
    leadRoute: str(row.lead_route),
    aligned: str(row.aligned),
    decisionMaker: str(row.decision_maker),
    title: str(row.title),
    email: str(row.email),
    phone: str(row.phone),
    website: str(row.website),
    status: str(row.status),
    nextStep: str(row.next_step),
    fitNotes: str(row.fit_notes),
    createdAt: str(row.created_at) ?? nowISO(),
    updatedAt: str(row.updated_at) ?? nowISO(),
  };
}

function captureFromRow(row: Row): Capture {
  return {
    id: String(row.captures_id ?? row.id),
    title: String(row.title ?? ""),
    owner: String(row.owner ?? ""),
    type: str(row.type),
    detail: str(row.detail),
    createdAt: str(row.created_at) ?? nowISO(),
  };
}

function profileFromRow(row: Row): Profile {
  return {
    id: str(row.profiles_id),
    accountKey: String(row.name ?? row.account_key ?? OWNER),
    displayName: str(row.display_name) ?? profileSeed.displayName,
    tagline: str(row.tagline) ?? profileSeed.tagline,
    weeklyWarmupGoal: num(row.weekly_warmup_goal, profileSeed.weeklyWarmupGoal),
    warmThresholdDays: num(row.warm_threshold_days, profileSeed.warmThresholdDays),
    coolingThresholdDays: num(row.cooling_threshold_days, profileSeed.coolingThresholdDays),
    morningWarmupCount: num(row.morning_warmup_count, profileSeed.morningWarmupCount),
    weekStart: str(row.week_start),
    weekCount: num(row.week_count, 0),
  };
}

async function ensureRemoteProfile(): Promise<Profile> {
  return profileFromRow(await apiGet<Row>("profile"));
}

/** Seed the local store from the rulebook's curated reference data, once. */
export async function ensureSeeded(): Promise<void> {
  if (isSupabaseConfigured) {
    await ensureSupabaseSeeded();
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await ensureRemoteProfile();
    notifyRepoChange();
    return;
  }

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
  if (isSupabaseConfigured) return getSupabaseProfile();
  if (isNeonConfigured) return ensureRemoteProfile();

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
  if (isSupabaseConfigured) {
    await updateSupabaseProfile(patch);
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "updateProfile", patch } });
    notifyRepoChange();
    return;
  }

  const cur = await getProfile();
  await db.profile.put({ ...cur, ...patch });
  notifyRepoChange();
}

/** Weekly count (R4): reset on a new Monday, otherwise increment. */
async function bumpWeeklyCount(): Promise<void> {
  const prof = await getProfile();
  const thisMonday = mondayOf();
  const weekCount = prof.weekStart === thisMonday ? (prof.weekCount ?? 0) + 1 : 1;
  if (isSupabaseConfigured) {
    await updateSupabaseProfile({ weekStart: thisMonday, weekCount });
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "updateProfile", patch: { weekStart: thisMonday, weekCount } } });
    return;
  }
  await db.profile.put({ ...prof, weekStart: thisMonday, weekCount });
}

/** Log a hello (R3): set lastTouched to now, auto-advance status (R7), count it. */
export async function logHello(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const person = await getSupabasePerson(id);
    if (person) {
      const patch: Partial<Person> = { lastTouched: nowISO(), updatedAt: nowISO() };
      if (person.status === "to-reach-out") patch.status = "reached-out";
      await patchSupabasePerson(id, patch);
    }
    await bumpWeeklyCount();
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "logHello", id } });
    notifyRepoChange();
    return;
  }

  const person = await db.people.get(id);
  if (!person) return;
  const patch: Partial<Person> = { lastTouched: nowISO(), updatedAt: nowISO() };
  if (person.status === "to-reach-out") patch.status = "reached-out"; // R7
  await db.people.update(id, patch);
  await bumpWeeklyCount();
  notifyRepoChange();
}

// People -------------------------------------------------------------------
export async function listPeople(): Promise<Person[]> {
  if (isSupabaseConfigured) {
    return listSupabasePeople();
  }
  if (isNeonConfigured) {
    return (await apiGet<Row[]>("people")).map(personFromRow);
  }
  return db.people.toArray().then((xs) => xs.sort((a, b) => a.fullName.localeCompare(b.fullName)));
}

export async function savePerson(input: Partial<Person> & { fullName: string }): Promise<string> {
  if (isSupabaseConfigured) {
    const id = await saveSupabasePerson(input);
    notifyRepoChange();
    return id;
  }
  if (isNeonConfigured) {
    const { id } = await apiPost<{ id: string }>({ payload: { op: "savePerson", input } });
    notifyRepoChange();
    return id;
  }

  const t = nowISO();
  if (input.id) {
    await db.people.update(input.id, { ...input, updatedAt: t });
    notifyRepoChange();
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
  notifyRepoChange();
  return id;
}

export async function deletePerson(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await deleteSupabasePerson(id);
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "deletePerson", id } });
    notifyRepoChange();
    return;
  }
  await db.people.delete(id);
  notifyRepoChange();
}

// Facilities ---------------------------------------------------------------
export async function listFacilities(): Promise<Facility[]> {
  if (isSupabaseConfigured) {
    return listSupabaseFacilities();
  }
  if (isNeonConfigured) {
    return (await apiGet<Row[]>("facilities")).map(facilityFromRow);
  }
  return db.facilities.toArray().then((xs) => xs.sort((a, b) => a.facilityName.localeCompare(b.facilityName)));
}

export async function saveFacility(input: Partial<Facility> & { facilityName: string }): Promise<string> {
  if (isSupabaseConfigured) {
    const id = await saveSupabaseFacility(input);
    notifyRepoChange();
    return id;
  }
  if (isNeonConfigured) {
    const { id } = await apiPost<{ id: string }>({ payload: { op: "saveFacility", input } });
    notifyRepoChange();
    return id;
  }

  const t = nowISO();
  if (input.id) {
    await db.facilities.update(input.id, { ...input, updatedAt: t });
    notifyRepoChange();
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
  notifyRepoChange();
  return id;
}

export async function deleteFacility(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await deleteSupabaseFacility(id);
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "deleteFacility", id } });
    notifyRepoChange();
    return;
  }
  await db.facilities.delete(id);
  notifyRepoChange();
}

// Captures -----------------------------------------------------------------
export async function listCaptures(): Promise<Capture[]> {
  if (isSupabaseConfigured) {
    return listSupabaseCaptures();
  }
  if (isNeonConfigured) {
    return (await apiGet<Row[]>("captures")).map(captureFromRow);
  }
  return db.captures.orderBy("createdAt").reverse().toArray();
}

export async function saveCapture(input: Partial<Capture> & { title: string }): Promise<string> {
  if (isSupabaseConfigured) {
    const id = await saveSupabaseCapture(input);
    notifyRepoChange();
    return id;
  }
  if (isNeonConfigured) {
    const { id } = await apiPost<{ id: string }>({ payload: { op: "saveCapture", input } });
    notifyRepoChange();
    return id;
  }

  const t = nowISO();
  if (input.id) {
    await db.captures.update(input.id, { ...input });
    notifyRepoChange();
    return input.id;
  }
  const id = await uniqueId(slugify(input.title), db.captures);
  const record: Capture = { owner: OWNER, type: "idea", createdAt: t, ...input, id } as Capture;
  await db.captures.put(record);
  notifyRepoChange();
  return id;
}

export async function deleteCapture(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await deleteSupabaseCapture(id);
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "deleteCapture", id } });
    notifyRepoChange();
    return;
  }
  await db.captures.delete(id);
  notifyRepoChange();
}

// Reset --------------------------------------------------------------------
/** Wipe all local data and re-seed the starting circle from the rulebook. */
export async function resetAll(): Promise<void> {
  if (isSupabaseConfigured) {
    await resetSupabaseAll();
    notifyRepoChange();
    return;
  }
  if (isNeonConfigured) {
    await apiPost({ payload: { op: "resetAll" } });
    notifyRepoChange();
    return;
  }

  await db.transaction("rw", db.people, db.facilities, db.captures, db.profile, async () => {
    await db.people.clear();
    await db.facilities.clear();
    await db.captures.clear();
    await db.profile.clear();
  });
  await ensureSeeded();
  notifyRepoChange();
}
