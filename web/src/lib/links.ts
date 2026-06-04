import type { Person } from "./types";
import { profile } from "./rulebook.generated";

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;

/** Gmail compose, prefilled and warm. Works on desktop and mobile for a Google
 *  user (BeaconHaus signs in with Google), unlike a mailto: with no mail client
 *  configured. Opens with the recipient prefilled when known. No dashes (R8). */
export function composeEmailHref(p: Person): string {
  const subject = `Hello from ${profile.displayName}`;
  const body = `Hi ${firstName(p.fullName)},\n\nI was thinking of you and wanted to reach out and say hello. I would love to catch up when the time feels right.\n\nWarmly,\n${profile.displayName}`;
  const params = new URLSearchParams({ view: "cm", fs: "1", to: p.email ?? "", su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** Open in LinkedIn deep link only (GovernanceRules R10: no automation). */
export function linkedInHref(p: Person): string | null {
  return p.linkedinUrl?.trim() || null;
}
