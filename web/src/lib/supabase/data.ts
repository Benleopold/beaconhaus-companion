import { seed, profile as profileSeed } from "@/lib/rulebook.generated";
import type { Capture, Facility, Person, Profile } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { nowISO } from "@/lib/utils";

function personFromRow(row: Record<string, unknown>): Person {
  return {
    id: String(row.id ?? ""),
    fullName: String(row.name ?? ""),
    owner: String(row.user_id ?? ""),
    roleOrg: String(row.role_org ?? "") || undefined,
    sphere: String(row.sphere ?? "") || undefined,
    relationship: String(row.relationship ?? "") || undefined,
    doorsCanOpen: String(row.doors_can_open ?? "") || undefined,
    theAsk: String(row.the_ask ?? "") || undefined,
    email: String(row.email ?? "") || undefined,
    phone: String(row.phone ?? "") || undefined,
    linkedinUrl: String(row.linkedin_url ?? "") || undefined,
    status: String(row.status ?? "") || undefined,
    lastTouched: String(row.last_touched ?? "") || null,
    nextStep: String(row.next_step ?? "") || undefined,
    notes: String(row.notes ?? "") || undefined,
    createdAt: String(row.created_at ?? nowISO()),
    updatedAt: String(row.updated_at ?? nowISO()),
  };
}

function facilityFromRow(row: Record<string, unknown>): Facility {
  return {
    id: String(row.id ?? ""),
    facilityName: String(row.facility_name ?? ""),
    owner: String(row.user_id ?? ""),
    type: String(row.type ?? "") || undefined,
    town: String(row.town ?? "") || undefined,
    region: String(row.region ?? "") || undefined,
    leadRoute: String(row.lead_route ?? "") || undefined,
    aligned: String(row.aligned ?? "") || undefined,
    decisionMaker: String(row.decision_maker ?? "") || undefined,
    title: String(row.title ?? "") || undefined,
    email: String(row.email ?? "") || undefined,
    phone: String(row.phone ?? "") || undefined,
    website: String(row.website ?? "") || undefined,
    status: String(row.status ?? "") || undefined,
    nextStep: String(row.next_step ?? "") || undefined,
    fitNotes: String(row.fit_notes ?? "") || undefined,
    createdAt: String(row.created_at ?? nowISO()),
    updatedAt: String(row.updated_at ?? nowISO()),
  };
}

function captureFromRow(row: Record<string, unknown>): Capture {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    owner: String(row.user_id ?? ""),
    type: String(row.type ?? "") || undefined,
    detail: String(row.detail ?? "") || undefined,
    createdAt: String(row.created_at ?? nowISO()),
  };
}

function profileFromRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.user_id ?? ""),
    accountKey: String(row.user_id ?? ""),
    displayName: String(row.display_name ?? profileSeed.displayName),
    tagline: String(row.tagline ?? profileSeed.tagline),
    weeklyWarmupGoal: Number(row.weekly_warmup_goal ?? profileSeed.weeklyWarmupGoal),
    warmThresholdDays: Number(row.warm_threshold_days ?? profileSeed.warmThresholdDays),
    coolingThresholdDays: Number(row.cooling_threshold_days ?? profileSeed.coolingThresholdDays),
    morningWarmupCount: Number(row.morning_warmup_count ?? profileSeed.morningWarmupCount),
    weekStart: row.week_start ? String(row.week_start) : undefined,
    weekCount: Number(row.week_count ?? 0),
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function ensureSupabaseSeeded(): Promise<void> {
  const userId = await getCurrentUserId();

  const profileResponse = await supabase.from("profile").select("*").single();
  if (profileResponse.error && profileResponse.error.status !== 406) {
    throw profileResponse.error;
  }

  if (!profileResponse.data) {
    const insertProfile = await supabase.from("profile").insert({
      user_id: userId,
      display_name: profileSeed.displayName,
      tagline: profileSeed.tagline,
      weekly_warmup_goal: profileSeed.weeklyWarmupGoal,
      warm_threshold_days: profileSeed.warmThresholdDays,
      cooling_threshold_days: profileSeed.coolingThresholdDays,
      morning_warmup_count: profileSeed.morningWarmupCount,
      week_start: null,
      week_count: 0,
    });
    if (insertProfile.error) throw insertProfile.error;
  }

  const peopleCount = await supabase.from("people").select("id", { count: "exact", head: true });
  if (peopleCount.error) throw peopleCount.error;

  if ((peopleCount.count ?? 0) === 0) {
    const peopleRows = seed.people.map((item) => ({
      user_id: userId,
      name: item.fullName,
      role_org: item.roleOrg,
      sphere: item.sphere,
      relationship: item.relationship,
      doors_can_open: item.doorsCanOpen,
      the_ask: item.theAsk,
      email: item.email,
      phone: item.phone,
      linkedin_url: item.linkedinUrl,
      status: item.status,
      last_touched: item.lastTouched,
      next_step: item.nextStep,
      notes: item.notes,
    }));
    const insertPeople = await supabase.from("people").insert(peopleRows);
    if (insertPeople.error) throw insertPeople.error;
  }

  const facilitiesCount = await supabase.from("facilities").select("id", { count: "exact", head: true });
  if (facilitiesCount.error) throw facilitiesCount.error;

  if ((facilitiesCount.count ?? 0) === 0) {
    const facilityRows = seed.facilities.map((item) => ({
      user_id: userId,
      facility_name: item.facilityName,
      type: item.type,
      town: item.town,
      region: item.region,
      lead_route: item.leadRoute,
      aligned: item.aligned,
      decision_maker: item.decisionMaker,
      title: item.title,
      email: item.email,
      phone: item.phone,
      website: item.website,
      status: item.status,
      next_step: item.nextStep,
      fit_notes: item.fitNotes,
    }));
    const insertFacilities = await supabase.from("facilities").insert(facilityRows);
    if (insertFacilities.error) throw insertFacilities.error;
  }

  const capturesCount = await supabase.from("captures").select("id", { count: "exact", head: true });
  if (capturesCount.error) throw capturesCount.error;

  if ((capturesCount.count ?? 0) === 0) {
    const captureRows = seed.captures.map((item) => ({
      user_id: userId,
      title: item.title,
      type: item.type,
      detail: item.detail,
    }));
    const insertCaptures = await supabase.from("captures").insert(captureRows);
    if (insertCaptures.error) throw insertCaptures.error;
  }
}

export async function getSupabaseProfile(): Promise<Profile> {
  const userId = await getCurrentUserId();
  const response = await supabase.from("profile").select("*").eq("user_id", userId).single();
  if (response.error && response.error.status !== 406) throw response.error;
  if (!response.data) {
    await ensureSupabaseSeeded();
    return getSupabaseProfile();
  }
  return profileFromRow(response.data);
}

export async function updateSupabaseProfile(patch: Partial<Profile>): Promise<void> {
  const userId = await getCurrentUserId();
  const response = await supabase.from("profile").update({
    display_name: patch.displayName ?? undefined,
    tagline: patch.tagline ?? undefined,
    weekly_warmup_goal: patch.weeklyWarmupGoal ?? undefined,
    morning_warmup_count: patch.morningWarmupCount ?? undefined,
    warm_threshold_days: patch.warmThresholdDays ?? undefined,
    cooling_threshold_days: patch.coolingThresholdDays ?? undefined,
    week_start: patch.weekStart ?? undefined,
    week_count: patch.weekCount ?? undefined,
  }).eq("user_id", userId);
  if (response.error) throw response.error;
}

export async function listSupabasePeople(): Promise<Person[]> {
  const response = await supabase.from("people").select("*").order("name", { ascending: true });
  if (response.error) throw response.error;
  return (response.data ?? []).map(personFromRow);
}

export async function saveSupabasePerson(input: Partial<Person> & { fullName: string }): Promise<string> {
  if (!input.fullName) throw new Error("Missing full name");
  if (input.id) {
    const response = await supabase.from("people").update({
      name: input.fullName,
      role_org: input.roleOrg ?? undefined,
      sphere: input.sphere ?? undefined,
      relationship: input.relationship ?? undefined,
      doors_can_open: input.doorsCanOpen ?? undefined,
      the_ask: input.theAsk ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      linkedin_url: input.linkedinUrl ?? undefined,
      status: input.status ?? undefined,
      last_touched: input.lastTouched ?? undefined,
      next_step: input.nextStep ?? undefined,
      notes: input.notes ?? undefined,
    }).eq("id", input.id);
    if (response.error) throw response.error;
    return input.id;
  }

  const response = await supabase.from("people").insert([
    {
      name: input.fullName,
      role_org: input.roleOrg,
      sphere: input.sphere,
      relationship: input.relationship,
      doors_can_open: input.doorsCanOpen,
      the_ask: input.theAsk,
      email: input.email,
      phone: input.phone,
      linkedin_url: input.linkedinUrl,
      status: input.status ?? "to-reach-out",
      last_touched: input.lastTouched,
      next_step: input.nextStep,
      notes: input.notes,
    },
  ]);

  if (response.error) throw response.error;
  return String(response.data?.[0]?.id ?? "");
}

export async function getSupabasePerson(id: string): Promise<Person | null> {
  const response = await supabase.from("people").select("*").eq("id", id).single();
  if (response.error && response.error.status !== 406) throw response.error;
  return response.data ? personFromRow(response.data) : null;
}

export async function patchSupabasePerson(id: string, patch: Partial<Person>): Promise<void> {
  const response = await supabase.from("people").update({
    name: patch.fullName ?? undefined,
    role_org: patch.roleOrg ?? undefined,
    sphere: patch.sphere ?? undefined,
    relationship: patch.relationship ?? undefined,
    doors_can_open: patch.doorsCanOpen ?? undefined,
    the_ask: patch.theAsk ?? undefined,
    email: patch.email ?? undefined,
    phone: patch.phone ?? undefined,
    linkedin_url: patch.linkedinUrl ?? undefined,
    status: patch.status ?? undefined,
    last_touched: patch.lastTouched ?? undefined,
    next_step: patch.nextStep ?? undefined,
    notes: patch.notes ?? undefined,
    updated_at: patch.updatedAt ?? undefined,
  }).eq("id", id);
  if (response.error) throw response.error;
}

export async function deleteSupabasePerson(id: string): Promise<void> {
  const response = await supabase.from("people").delete().eq("id", id);
  if (response.error) throw response.error;
}

export async function listSupabaseFacilities(): Promise<Facility[]> {
  const response = await supabase.from("facilities").select("*").order("facility_name", { ascending: true });
  if (response.error) throw response.error;
  return (response.data ?? []).map(facilityFromRow);
}

export async function saveSupabaseFacility(input: Partial<Facility> & { facilityName: string }): Promise<string> {
  if (!input.facilityName) throw new Error("Missing facility name");
  if (input.id) {
    const response = await supabase.from("facilities").update({
      facility_name: input.facilityName,
      type: input.type ?? undefined,
      town: input.town ?? undefined,
      region: input.region ?? undefined,
      lead_route: input.leadRoute ?? undefined,
      aligned: input.aligned ?? undefined,
      decision_maker: input.decisionMaker ?? undefined,
      title: input.title ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      website: input.website ?? undefined,
      status: input.status ?? undefined,
      next_step: input.nextStep ?? undefined,
      fit_notes: input.fitNotes ?? undefined,
    }).eq("id", input.id);
    if (response.error) throw response.error;
    return input.id;
  }

  const response = await supabase.from("facilities").insert([
    {
      facility_name: input.facilityName,
      type: input.type,
      town: input.town,
      region: input.region,
      lead_route: input.leadRoute,
      aligned: input.aligned,
      decision_maker: input.decisionMaker,
      title: input.title,
      email: input.email,
      phone: input.phone,
      website: input.website,
      status: input.status ?? "to-research",
      next_step: input.nextStep,
      fit_notes: input.fitNotes,
    },
  ]);

  if (response.error) throw response.error;
  return String(response.data?.[0]?.id ?? "");
}

export async function deleteSupabaseFacility(id: string): Promise<void> {
  const response = await supabase.from("facilities").delete().eq("id", id);
  if (response.error) throw response.error;
}

export async function listSupabaseCaptures(): Promise<Capture[]> {
  const response = await supabase.from("captures").select("*").order("created_at", { ascending: false });
  if (response.error) throw response.error;
  return (response.data ?? []).map(captureFromRow);
}

export async function saveSupabaseCapture(input: Partial<Capture> & { title: string }): Promise<string> {
  if (!input.title) throw new Error("Missing title");
  if (input.id) {
    const response = await supabase.from("captures").update({
      title: input.title,
      type: input.type ?? undefined,
      detail: input.detail ?? undefined,
    }).eq("id", input.id);
    if (response.error) throw response.error;
    return input.id;
  }

  const response = await supabase.from("captures").insert([
    {
      title: input.title,
      type: input.type ?? "idea",
      detail: input.detail,
    },
  ]);

  if (response.error) throw response.error;
  return String(response.data?.[0]?.id ?? "");
}

export async function deleteSupabaseCapture(id: string): Promise<void> {
  const response = await supabase.from("captures").delete().eq("id", id);
  if (response.error) throw response.error;
}

export async function resetSupabaseAll(): Promise<void> {
  const userId = await getCurrentUserId();
  const peopleDelete = await supabase.from("people").delete().eq("user_id", userId);
  if (peopleDelete.error) throw peopleDelete.error;
  const facilitiesDelete = await supabase.from("facilities").delete().eq("user_id", userId);
  if (facilitiesDelete.error) throw facilitiesDelete.error;
  const capturesDelete = await supabase.from("captures").delete().eq("user_id", userId);
  if (capturesDelete.error) throw capturesDelete.error;
  await ensureSupabaseSeeded();
}
