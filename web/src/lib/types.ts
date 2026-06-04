// Domain types. Field shapes mirror the rulebook entities (camelCased).
// The rulebook (effortless-rulebook.json) is the source of truth.

export type Warmth = "warm" | "cooling" | "cold";

export interface Person {
  id: string;
  fullName: string;
  owner: string;
  roleOrg?: string;
  sphere?: string; // -> vocab.spheres value
  relationship?: string;
  doorsCanOpen?: string;
  theAsk?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  status?: string; // -> vocab.personStatuses value
  lastTouched?: string | null;
  nextStep?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  facilityName: string;
  owner: string;
  type?: string; // -> vocab.facilityTypes
  town?: string;
  region?: string; // -> vocab.regions
  leadRoute?: string; // -> vocab.leadRoutes
  aligned?: string; // -> vocab.alignmentLevels
  decisionMaker?: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: string; // -> vocab.facilityStatuses
  nextStep?: string;
  fitNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Capture {
  id: string;
  title: string;
  owner: string;
  type?: string; // -> vocab.captureTypes
  detail?: string;
  createdAt: string;
}

export interface Profile {
  accountKey: string;
  displayName: string;
  tagline: string;
  weeklyWarmupGoal: number;
  warmThresholdDays: number;
  coolingThresholdDays: number;
  morningWarmupCount: number;
  weekStart?: string;
  weekCount: number;
}
