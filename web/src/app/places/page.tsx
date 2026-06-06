"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Key, MapPin, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button, Card, EmptyState, Pill } from "@/components/ui";
import { FacilityForm } from "@/components/facility-form";
import { useFacilities, usePeople } from "@/lib/hooks";
import { vocab } from "@/lib/rulebook.generated";
import type { Facility, Person } from "@/lib/types";

const labelFor = (
  list: readonly { value: string; label: string }[],
  value?: string,
) => (value ? list.find((o) => o.value === value)?.label : undefined);

const isWarmRoute = (value?: string) => Boolean(value && value.startsWith("warm-via-"));

/** Extract the connector's first-name token from "warm-via-mina" → "mina". */
function extractConnectorToken(leadRoute?: string): string | null {
  if (!leadRoute?.startsWith("warm-via-")) return null;
  const token = leadRoute.slice("warm-via-".length).toLowerCase().trim();
  return token && token !== "other" ? token : null;
}

/** Find the person who is the named warm connector for this facility. */
function findConnector(leadRoute: string | undefined, people: Person[]): Person | undefined {
  const token = extractConnectorToken(leadRoute);
  if (!token) return undefined;
  return people.find((p) => p.fullName?.toLowerCase().includes(token));
}

/** Status priority for sorting: active pipeline stages surface first. */
const STATUS_RANK: Record<string, number> = {
  "in-discussion": 0,
  "meeting-set": 1,
  "intro-requested": 2,
  "proposal-sent": 3,
  "to-research": 4,
  "signed": 5,
  "resting": 6,
};
function statusRank(s?: string) {
  return s ? (STATUS_RANK[s] ?? 7) : 7;
}

function FacilityCard({
  facility,
  index,
  connector,
  onOpen,
}: {
  facility: Facility;
  index: number;
  connector: Person | undefined;
  onOpen: () => void;
}) {
  const typeLabel = labelFor(vocab.facilityTypes, facility.type);
  const regionLabel = labelFor(vocab.regions, facility.region);
  const statusLabel = labelFor(vocab.facilityStatuses, facility.status);
  const routeLabel = labelFor(vocab.leadRoutes, facility.leadRoute);
  const alignedLabel = labelFor(vocab.alignmentLevels, facility.aligned);
  const warm = isWarmRoute(facility.leadRoute);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="focus-ring cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:scale-[0.995]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug text-ink">{facility.facilityName}</h3>
          {statusLabel && <Pill tone="beacon">{statusLabel}</Pill>}
        </div>

        {(typeLabel || regionLabel || facility.town) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {typeLabel && <Pill>{typeLabel}</Pill>}
            {regionLabel && <Pill tone="sage">{regionLabel}</Pill>}
            {facility.town && (
              <span className="inline-flex items-center gap-1 text-[13px] text-ink-faint">
                <MapPin className="h-3.5 w-3.5" />
                {facility.town}
              </span>
            )}
          </div>
        )}

        {/* Route + alignment row */}
        {(routeLabel || alignedLabel) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
            {routeLabel &&
              (warm ? (
                <span className="inline-flex items-center gap-1.5 text-beacon-deep">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">{routeLabel}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-ink-soft">
                  <Compass className="h-3.5 w-3.5 text-ink-faint" />
                  {routeLabel}
                </span>
              ))}
            {alignedLabel && facility.aligned !== "unknown" && (
              <span className="text-ink-soft">
                <span className="text-ink-faint">Aligned</span> {alignedLabel}
              </span>
            )}
          </div>
        )}

        {/* Bidirectional connector chip: tapping goes to People */}
        {connector && (
          <Link
            href="/network"
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-warm-soft px-3 py-1 text-[12.5px] font-medium text-beacon-deep hover:bg-warm transition-colors"
            aria-label={`Ask ${connector.fullName} for the introduction`}
          >
            <Key className="h-3 w-3" />
            Ask {connector.fullName}
          </Link>
        )}

        {facility.fitNotes && (
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{facility.fitNotes}</p>
        )}

        {facility.nextStep && (
          <div className="mt-3 rounded-2xl bg-surface-2 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
              Next step
            </span>
            <p className="mt-0.5 text-[14px] leading-relaxed text-ink">{facility.nextStep}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function PlacesSkeleton() {
  return (
    <div className="mt-5 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card h-28 animate-pulse p-4">
          <div className="h-5 w-2/5 rounded-full bg-surface-2" />
          <div className="mt-3 h-3 w-3/5 rounded-full bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export default function PlacesPage() {
  const facilities = useFacilities();
  const people = usePeople();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);

  const sorted = useMemo(() => {
    if (!facilities) return undefined;
    return [...facilities].sort((a, b) => {
      // Warm routes surface before cold; within same route type, sort by pipeline status
      const aWarm = isWarmRoute(a.leadRoute) ? 0 : 1;
      const bWarm = isWarmRoute(b.leadRoute) ? 0 : 1;
      if (aWarm !== bWarm) return aWarm - bWarm;
      const sr = statusRank(a.status) - statusRank(b.status);
      if (sr !== 0) return sr;
      return a.facilityName.localeCompare(b.facilityName, undefined, { sensitivity: "base" });
    });
  }, [facilities]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (f: Facility) => { setEditing(f); setFormOpen(true); };

  const count = sorted?.length ?? 0;
  const countLabel =
    count === 0 ? "Ready when you are" : count === 1 ? "1 place" : `${count} places`;

  return (
    <div className="pt-3">
      <header className="flex items-end justify-between gap-3 pb-1">
        <div>
          <h1 className="font-display text-[28px] leading-tight text-ink">Target places</h1>
          <p className="mt-1 text-[14px] text-ink-soft">{countLabel}</p>
        </div>
        <Button variant="beacon" onClick={openCreate} aria-label="Add a place">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </header>

      {!sorted ? (
        <PlacesSkeleton />
      ) : sorted.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<MapPin className="h-7 w-7" />}
            title="A place for every welcome"
            body="Add the communities you would love to partner with. Just a name to start, the rest can come later."
          />
          <div className="mt-2 flex justify-center">
            <Button variant="soft" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add your first place
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {sorted.map((f, i) => (
            <FacilityCard
              key={f.id}
              facility={f}
              index={i}
              connector={people ? findConnector(f.leadRoute, people) : undefined}
              onOpen={() => openEdit(f)}
            />
          ))}
        </div>
      )}

      <FacilityForm open={formOpen} onClose={() => setFormOpen(false)} facility={editing} />
    </div>
  );
}
