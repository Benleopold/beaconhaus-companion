"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { db } from "./db";
import { ensureSeeded } from "./repo";
import { byColdestFirst } from "./warmth";
import type { Person } from "./types";

/** Seed once on the client, then signal readiness. */
export function useSeed(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    ensureSeeded().finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  return ready;
}

export const usePeople = () =>
  useLiveQuery(() => db.people.toArray().then((xs) => xs.sort((a, b) => a.fullName.localeCompare(b.fullName))), []);

export const useFacilities = () =>
  useLiveQuery(
    () => db.facilities.toArray().then((xs) => xs.sort((a, b) => a.facilityName.localeCompare(b.facilityName))),
    [],
  );

export const useCaptures = () =>
  useLiveQuery(() => db.captures.orderBy("createdAt").reverse().toArray(), []);

export const useProfile = () => useLiveQuery(() => db.profile.toCollection().first(), []);

export const usePerson = (id?: string) => useLiveQuery(() => (id ? db.people.get(id) : undefined), [id]);

/** The daily ritual queue (R3): coldest or never-touched first. */
export function useTodayQueue(count: number): Person[] | undefined {
  const people = useLiveQuery(() => db.people.toArray(), []);
  if (!people) return undefined;
  return [...people].sort(byColdestFirst).slice(0, count);
}
