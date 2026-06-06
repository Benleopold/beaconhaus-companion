"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";
import { Button, EmptyState, Input } from "@/components/ui";
import { PersonCard } from "@/components/person-card";
import { PersonForm } from "@/components/person-form";
import { usePeople } from "@/lib/hooks";
import type { Person } from "@/lib/types";

export default function NetworkPage() {
  const people = usePeople();
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Person | undefined>(undefined);

  const filtered = useMemo(() => {
    if (!people) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const name = p.fullName?.toLowerCase() ?? "";
      const role = p.roleOrg?.toLowerCase() ?? "";
      return name.includes(q) || role.includes(q);
    });
  }, [people, query]);

  const loading = people === undefined;
  const count = people?.length ?? 0;
  const connectorCount = people?.filter((p) => p.doorsCanOpen).length ?? 0;

  const openCreate = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (person: Person) => {
    setEditing(person);
    setSheetOpen(true);
  };

  const countLabel =
    count === 0 ? "Ready to begin" : count === 1 ? "1 person" : `${count} people`;

  return (
    <div className="pt-3">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 pb-2">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-tight text-ink">
            Your warm circle
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">{countLabel}</p>
          {connectorCount > 0 && (
            <p className="mt-0.5 text-[12.5px] text-beacon-deep">
              {connectorCount === 1 ? "1 connector" : `${connectorCount} connectors`} who can open doors to target places
            </p>
          )}
        </div>
        <Button variant="beacon" onClick={openCreate} aria-label="Add a person">
          <Plus className="h-[18px] w-[18px]" />
          Add
        </Button>
      </div>

      {/* Search */}
      {(loading || count > 0) && (
        <div className="relative mb-4 mt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or role"
            className="pl-11"
            aria-label="Search your circle"
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="card flex items-center gap-3.5 p-3.5"
              style={{ opacity: 1 - i * 0.16 }}
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/5 animate-pulse rounded-full bg-surface-2" />
                <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="Your circle is waiting"
          body="Add the first person you would love to stay close to. A name is all you need to begin."
        />
      ) : filtered && filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-7 w-7" />}
          title="No one by that name yet"
          body="Try a different name or role, or add someone new to your circle."
        />
      ) : (
        <motion.div layout className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filtered?.map((person) => (
              <PersonCard key={person.id} person={person} onOpen={openEdit} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <PersonForm
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        person={editing}
      />
    </div>
  );
}
