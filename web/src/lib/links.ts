import type { Person } from "./types";
import { profile } from "./rulebook.generated";

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;

/** Native email compose (architecture: native, login-free). Warm, no dashes (R8). */
export function mailtoHref(p: Person): string {
  const subject = `Hello from ${profile.displayName}`;
  const body = `Hi ${firstName(p.fullName)},\n\nI was thinking of you and wanted to reach out and say hello. I would love to catch up when the time feels right.\n\nWarmly,\n${profile.displayName}`;
  return `mailto:${p.email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Open in LinkedIn deep link only (GovernanceRules R10: no automation). */
export function linkedInHref(p: Person): string | null {
  return p.linkedinUrl?.trim() || null;
}
