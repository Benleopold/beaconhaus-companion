import Dexie, { type Table } from "dexie";
import type { Person, Facility, Capture, Profile } from "./types";

/**
 * Local-first store (IndexedDB). This is the "local" adapter of a swappable
 * data layer; a Supabase or Google Drive adapter can implement the same repo
 * surface later without touching the UI. Operations only run in the browser.
 */
class BeaconDB extends Dexie {
  people!: Table<Person, string>;
  facilities!: Table<Facility, string>;
  captures!: Table<Capture, string>;
  profile!: Table<Profile, string>;

  constructor() {
    super("beaconhaus");
    this.version(1).stores({
      people: "id, owner, status, sphere, lastTouched, fullName",
      facilities: "id, owner, status, region, leadRoute, facilityName",
      captures: "id, owner, type, createdAt",
      profile: "accountKey",
    });
  }
}

export const db = new BeaconDB();
