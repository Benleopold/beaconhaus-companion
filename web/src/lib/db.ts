import Dexie, { type Table } from "dexie";
import type { Person, Facility, Capture, Profile } from "./types";
import type { Chat, ChatMessage } from "./copilot/types";

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
  chats!: Table<Chat, string>;
  messages!: Table<ChatMessage, string>;

  constructor() {
    super("beaconhaus");
    this.version(1).stores({
      people: "id, owner, status, sphere, lastTouched, fullName",
      facilities: "id, owner, status, region, leadRoute, facilityName",
      captures: "id, owner, type, createdAt",
      profile: "accountKey",
    });
    this.version(2).stores({
      people: "id, owner, status, sphere, lastTouched, fullName",
      facilities: "id, owner, status, region, leadRoute, facilityName",
      captures: "id, owner, type, createdAt",
      profile: "accountKey",
      chats: "id, updatedAt",
      messages: "id, chatId, createdAt",
    });
  }
}

export const db = new BeaconDB();
