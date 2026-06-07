import { Pool, type PoolClient } from "@neondatabase/serverless";
import { auth } from "@/auth";
import type { Session } from "next-auth";

type AuthProfile = {
  profileId: string;
  owner: string;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type DbClient = PoolClient;

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sessionIdentity(session: Session | null) {
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id) return null;
  return { subject: user.id, email: user.email ?? "", name: user.name ?? "" };
}

export async function withProfileDb<T>(work: (client: DbClient, profile: AuthProfile) => Promise<T>): Promise<T> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not configured");

  const session = (await auth()) as Session | null;
  const identity = sessionIdentity(session);
  if (!identity) throw new Error("Not signed in");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ensured = await client.query(
      "SELECT profiles_id FROM ensure_profile_for_auth($1, $2, $3)",
      [identity.subject, identity.email, identity.name],
    );
    const profileId = String(ensured.rows[0]?.profiles_id ?? "");
    const profileRows = await client.query(
      "SELECT profiles_id, name FROM vw_profiles WHERE profiles_id = $1",
      [profileId],
    );
    const owner = String(profileRows.rows[0]?.name ?? "");
    if (!owner) throw new Error("Could not resolve the current profile");

    await client.query("SELECT set_config('beaconhaus.current_profile', $1, true)", [owner]);

    const result = await work(client, { profileId, owner });
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
