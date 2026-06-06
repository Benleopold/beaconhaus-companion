import { readFileSync } from "node:fs";
import { join } from "node:path";

// The Field Manual is the authoritative BD protocol the Copilot coaches from. It
// is a plain markdown document on purpose: business logic lives there in plain
// language, editable without touching code, and the Copilot reads it each turn.
const MANUAL_PATH = join(process.cwd(), "src", "content", "field-manual.md");

const FALLBACK =
  "(The BeaconHaus Field Manual could not be loaded. Coach from the four " +
  "principles: warm before cold, pain then proof, one small ask, a rhythm not a " +
  "sprint. Offer small concrete next steps, grounded only in the user's data.)";

let cached: string | null = null;

/** The manual text. Re-read on every call in dev so edits show up immediately;
 *  cached in production. Never throws: returns a safe fallback if it is missing. */
export function loadManual(): string {
  if (process.env.NODE_ENV === "production" && cached !== null) return cached;
  try {
    const text = readFileSync(MANUAL_PATH, "utf8");
    cached = text;
    return text;
  } catch {
    return cached ?? FALLBACK;
  }
}
