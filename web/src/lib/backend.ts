export const backend = (process.env.NEXT_PUBLIC_BEACONHAUS_BACKEND ?? "").toLowerCase();
export const isNeonConfigured = backend === "neon";
export const isSupabaseConfigured = backend === "supabase";
export const isRemoteConfigured = isNeonConfigured || isSupabaseConfigured;

type ApiOptions = {
  resource?: string;
  payload?: unknown;
};

export async function apiGet<T>(resource: string): Promise<T> {
  const res = await fetch(`/api/data?resource=${encodeURIComponent(resource)}`, {
    method: "GET",
    cache: "no-store",
  });
  return readApi<T>(res);
}

export async function apiPost<T>({ resource, payload }: ApiOptions): Promise<T> {
  const res = await fetch(`/api/data${resource ? `?resource=${encodeURIComponent(resource)}` : ""}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  return readApi<T>(res);
}

async function readApi<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T;
  const message = await res.text().catch(() => "");
  throw new Error(message || `Request failed with ${res.status}`);
}
