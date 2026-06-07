"use client";
import { useCallback, useEffect, useState } from "react";
import { ensureSeeded, getProfile, listCaptures, listFacilities, listPeople, subscribeRepo } from "./repo";
import { byColdestFirst } from "./warmth";
import type { Capture, Facility, Person, Profile } from "./types";

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

function useRepoQuery<T>(loader: () => Promise<T>): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    let active = true;
    const load = () => {
      loader()
        .then((next) => {
          if (active) setValue(next);
        })
        .catch(() => {
          if (active) setValue(undefined);
        });
    };

    load();
    const unsubscribe = subscribeRepo(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loader]);

  return value;
}

export const usePeople = (): Person[] | undefined => useRepoQuery(listPeople);

export const useFacilities = (): Facility[] | undefined => useRepoQuery(listFacilities);

export const useCaptures = (): Capture[] | undefined => useRepoQuery(listCaptures);

export const useProfile = (): Profile | undefined => useRepoQuery(getProfile);

export const usePerson = (id?: string): Person | undefined => {
  const loader = useCallback(async () => (id ? (await listPeople()).find((p) => p.id === id) : undefined), [id]);
  return useRepoQuery(loader);
};

/** The daily ritual queue (R3): coldest or never-touched first. */
export function useTodayQueue(count: number): Person[] | undefined {
  const people = usePeople();
  if (!people) return undefined;
  return [...people].sort(byColdestFirst).slice(0, count);
}
