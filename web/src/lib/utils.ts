import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nowISO = () => new Date().toISOString();

/** Most recent Monday (local), as an ISO date string at 00:00. */
export function mondayOf(d = new Date()): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // 0 = Monday
  date.setDate(date.getDate() - day);
  return date.toISOString();
}

/** A gentle relative-time phrase. No guilt, no "overdue" (GovernanceRules R5). */
export function gentleSince(iso?: string | null): string {
  if (!iso) return "Not yet";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "Last month";
  return `${Math.floor(days / 30)} months ago`;
}
