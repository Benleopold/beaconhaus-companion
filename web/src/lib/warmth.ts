import type { Person, Warmth } from "./types";
import { profile as defaults } from "./rulebook.generated";

/** Whole days since an ISO date, or null if never. */
export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/**
 * Warmth model (GovernanceRules R2): warm within warmThresholdDays, cooling up
 * to coolingThresholdDays, otherwise cold (including never touched).
 */
export function computeWarmth(
  lastTouched?: string | null,
  warmDays: number = defaults.warmThresholdDays,
  coolingDays: number = defaults.coolingThresholdDays,
): Warmth {
  const d = daysSince(lastTouched);
  if (d === null) return "cold";
  if (d <= warmDays) return "warm";
  if (d <= coolingDays) return "cooling";
  return "cold";
}

export function isNeverTouched(p: Person): boolean {
  return !p.lastTouched;
}

/**
 * Sort key for the daily ritual (R3): coldest or never-touched first.
 * Never-touched sorts ahead of everyone; otherwise older = colder = earlier.
 */
export function coldnessKey(p: Person): number {
  const d = daysSince(p.lastTouched);
  return d === null ? Number.MAX_SAFE_INTEGER : d;
}

export function byColdestFirst(a: Person, b: Person): number {
  return coldnessKey(b) - coldnessKey(a);
}

export const warmthMeta: Record<Warmth, { label: string; tone: string }> = {
  warm: { label: "Warm", tone: "Recently connected" },
  cooling: { label: "Cooling", tone: "A good time for a gentle hello" },
  cold: { label: "Ready", tone: "Ready for a hello" },
};
