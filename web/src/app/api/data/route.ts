import { seed, profile as profileSeed } from "@/lib/rulebook.generated";
import type { Capture, Facility, Person, Profile } from "@/lib/types";
import { withProfileDb, type DbClient } from "@/lib/server/db";
import { mondayOf } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  op?: string;
  id?: string;
  input?: Partial<Person> | Partial<Facility> | Partial<Capture>;
  patch?: Partial<Profile>;
};

const textOrNull = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const uuid = () => crypto.randomUUID();

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";
  return new Response(message, { status: message === "Not signed in" ? 401 : 500 });
}

export async function GET(req: Request) {
  const resource = new URL(req.url).searchParams.get("resource");

  try {
    const data = await withProfileDb(async (client, profile) => {
      if (resource === "profile") {
        const result = await client.query("SELECT * FROM vw_profiles WHERE profiles_id = $1", [profile.profileId]);
        return result.rows[0] ?? null;
      }

      if (resource === "people") {
        const result = await client.query("SELECT * FROM vw_people WHERE owner = $1 ORDER BY full_name", [profile.owner]);
        return result.rows;
      }

      if (resource === "facilities") {
        const result = await client.query("SELECT * FROM vw_facilities WHERE owner = $1 ORDER BY facility_name", [profile.owner]);
        return result.rows;
      }

      if (resource === "captures") {
        const result = await client.query("SELECT * FROM vw_captures WHERE owner = $1 ORDER BY created_at DESC", [profile.owner]);
        return result.rows;
      }

      throw new Error("Unknown resource");
    });

    return Response.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  try {
    const data = await withProfileDb(async (client, profile) => {
      switch (payload.op) {
        case "updateProfile":
          await updateProfile(client, profile.profileId, payload.patch ?? {});
          return { ok: true };
        case "logHello":
          await logHello(client, profile.profileId, profile.owner, payload.id);
          return { ok: true };
        case "savePerson":
          return savePerson(client, profile.owner, payload.input as Partial<Person>);
        case "deletePerson":
          await deleteById(client, "people", "people_id", profile.owner, payload.id);
          return { ok: true };
        case "saveFacility":
          return saveFacility(client, profile.owner, payload.input as Partial<Facility>);
        case "deleteFacility":
          await deleteById(client, "facilities", "facilities_id", profile.owner, payload.id);
          return { ok: true };
        case "saveCapture":
          return saveCapture(client, profile.owner, payload.input as Partial<Capture>);
        case "deleteCapture":
          await deleteById(client, "captures", "captures_id", profile.owner, payload.id);
          return { ok: true };
        case "resetAll":
          await resetAll(client, profile.profileId, profile.owner);
          return { ok: true };
        default:
          throw new Error("Unknown operation");
      }
    });

    return Response.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

async function updateProfile(client: DbClient, profileId: string, patch: Partial<Profile>) {
  await client.query(
    `UPDATE profiles
      SET display_name = COALESCE($2, display_name),
          tagline = COALESCE($3, tagline),
          weekly_warmup_goal = COALESCE($4, weekly_warmup_goal),
          morning_warmup_count = COALESCE($5, morning_warmup_count),
          warm_threshold_days = COALESCE($6, warm_threshold_days),
          cooling_threshold_days = COALESCE($7, cooling_threshold_days),
          week_start = COALESCE($8, week_start),
          week_count = COALESCE($9, week_count)
      WHERE profiles_id = $1`,
    [
      profileId,
      patch.displayName ?? null,
      patch.tagline ?? null,
      patch.weeklyWarmupGoal ?? null,
      patch.morningWarmupCount ?? null,
      patch.warmThresholdDays ?? null,
      patch.coolingThresholdDays ?? null,
      patch.weekStart ?? null,
      patch.weekCount ?? null,
    ],
  );
}

async function logHello(client: DbClient, profileId: string, owner: string, id?: string) {
  if (!id) throw new Error("Missing person id");

  await client.query(
    `UPDATE people
      SET last_touched = now(),
          status = CASE WHEN status = 'to-reach-out' THEN 'reached-out' ELSE status END
      WHERE people_id = $1 AND owner = $2`,
    [id, owner],
  );

  await client.query(
    `UPDATE profiles
      SET week_start = date_trunc('week', now()),
          week_count = CASE
            WHEN week_start::date = date_trunc('week', now())::date THEN COALESCE(week_count, 0) + 1
            ELSE 1
          END
      WHERE profiles_id = $1`,
    [profileId],
  );
}

async function savePerson(client: DbClient, owner: string, input: Partial<Person> = {}) {
  if (!input.fullName) throw new Error("Missing full name");
  const id = input.id ?? uuid();
  const values = [
    id,
    owner,
    input.fullName,
    textOrNull(input.roleOrg),
    textOrNull(input.sphere),
    textOrNull(input.relationship),
    textOrNull(input.doorsCanOpen),
    textOrNull(input.theAsk),
    textOrNull(input.email),
    textOrNull(input.phone),
    textOrNull(input.linkedinUrl),
    textOrNull(input.status) ?? "to-reach-out",
    input.lastTouched ?? null,
    textOrNull(input.nextStep),
    textOrNull(input.notes),
  ];

  if (input.id) {
    await client.query(
      `UPDATE people
        SET full_name = $3,
            role_org = $4,
            sphere = $5,
            relationship = $6,
            doors_can_open = $7,
            the_ask = $8,
            email = $9,
            phone = $10,
            linkedin_url = $11,
            status = $12,
            last_touched = $13,
            next_step = $14,
            notes = $15
        WHERE people_id = $1 AND owner = $2`,
      values,
    );
  } else {
    await client.query(
      `INSERT INTO people (
        people_id, owner, full_name, role_org, sphere, relationship,
        doors_can_open, the_ask, email, phone, linkedin_url, status,
        last_touched, next_step, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      values,
    );
  }

  return { id };
}

async function saveFacility(client: DbClient, owner: string, input: Partial<Facility> = {}) {
  if (!input.facilityName) throw new Error("Missing facility name");
  const id = input.id ?? uuid();
  const values = [
    id,
    owner,
    input.facilityName,
    textOrNull(input.type),
    textOrNull(input.town),
    textOrNull(input.region),
    textOrNull(input.leadRoute),
    textOrNull(input.aligned),
    textOrNull(input.decisionMaker),
    textOrNull(input.title),
    textOrNull(input.email),
    textOrNull(input.phone),
    textOrNull(input.website),
    textOrNull(input.status) ?? "to-research",
    textOrNull(input.nextStep),
    textOrNull(input.fitNotes),
  ];

  if (input.id) {
    await client.query(
      `UPDATE facilities
        SET facility_name = $3,
            type = $4,
            town = $5,
            region = $6,
            lead_route = $7,
            aligned = $8,
            decision_maker = $9,
            title = $10,
            email = $11,
            phone = $12,
            website = $13,
            status = $14,
            next_step = $15,
            fit_notes = $16
        WHERE facilities_id = $1 AND owner = $2`,
      values,
    );
  } else {
    await client.query(
      `INSERT INTO facilities (
        facilities_id, owner, facility_name, type, town, region, lead_route,
        aligned, decision_maker, title, email, phone, website, status,
        next_step, fit_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      values,
    );
  }

  return { id };
}

async function saveCapture(client: DbClient, owner: string, input: Partial<Capture> = {}) {
  if (!input.title) throw new Error("Missing title");
  const id = input.id ?? uuid();
  const values = [
    id,
    owner,
    input.title,
    textOrNull(input.type) ?? "idea",
    textOrNull(input.detail),
  ];

  if (input.id) {
    await client.query(
      `UPDATE captures
        SET title = $3,
            type = $4,
            detail = $5
        WHERE captures_id = $1 AND owner = $2`,
      values,
    );
  } else {
    await client.query(
      `INSERT INTO captures (captures_id, owner, title, type, detail)
      VALUES ($1, $2, $3, $4, $5)`,
      values,
    );
  }

  return { id };
}

async function deleteById(client: DbClient, table: string, idColumn: string, owner: string, id?: string) {
  if (!id) throw new Error("Missing id");
  await client.query(`DELETE FROM ${table} WHERE ${idColumn} = $1 AND owner = $2`, [id, owner]);
}

async function resetAll(client: DbClient, profileId: string, owner: string) {
  await client.query("DELETE FROM people WHERE owner = $1", [owner]);
  await client.query("DELETE FROM facilities WHERE owner = $1", [owner]);
  await client.query("DELETE FROM captures WHERE owner = $1", [owner]);

  for (const p of seed.people as readonly Partial<Person>[]) {
    await savePerson(client, owner, { ...p, id: undefined, owner });
  }
  for (const f of seed.facilities as readonly Partial<Facility>[]) {
    await saveFacility(client, owner, { ...f, id: undefined, owner });
  }
  for (const c of seed.captures as readonly Partial<Capture>[]) {
    await saveCapture(client, owner, { ...c, id: undefined, owner });
  }

  await updateProfile(client, profileId, {
    displayName: profileSeed.displayName,
    tagline: profileSeed.tagline,
    weeklyWarmupGoal: profileSeed.weeklyWarmupGoal,
    warmThresholdDays: profileSeed.warmThresholdDays,
    coolingThresholdDays: profileSeed.coolingThresholdDays,
    morningWarmupCount: profileSeed.morningWarmupCount,
    weekStart: mondayOf(),
    weekCount: 0,
  });
}
