"use client";
import { motion } from "framer-motion";
import { ExternalLink, Mail } from "lucide-react";
import { Avatar, WarmthDot } from "@/components/ui";
import { computeWarmth } from "@/lib/warmth";
import { composeEmailHref, linkedInHref } from "@/lib/links";
import { cn, gentleSince } from "@/lib/utils";
import { vocab } from "@/lib/rulebook.generated";
import type { Person } from "@/lib/types";

// Mirrors the IconButton styling, but as an anchor for native mail / link opens.
const quickAction =
  "focus-ring grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 active:scale-95";

const sphereLabel = (value?: string) =>
  value ? vocab.spheres.find((s) => s.value === value)?.label : undefined;

export function PersonCard({
  person,
  onOpen,
}: {
  person: Person;
  onOpen: (person: Person) => void;
}) {
  const warmth = computeWarmth(person.lastTouched);
  const subtitle = person.roleOrg?.trim() || sphereLabel(person.sphere);
  const linkedin = linkedInHref(person);

  // Stop quick-action clicks from also opening the edit sheet.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card flex items-center gap-3.5 p-3.5 transition-colors duration-200 hover:bg-surface-2">
        <button
          type="button"
          onClick={() => onOpen(person)}
          aria-label={`Open ${person.fullName}`}
          className="focus-ring -m-1.5 flex min-w-0 flex-1 items-center gap-3.5 rounded-2xl p-1.5 text-left transition-transform active:scale-[0.99]"
        >
          <div className="relative shrink-0">
            <Avatar name={person.fullName} />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-canvas">
              <WarmthDot warmth={warmth} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] leading-tight text-ink">
              {person.fullName}
            </p>
            {subtitle && (
              <p className="truncate text-[13px] text-ink-soft">{subtitle}</p>
            )}
            <p className="mt-0.5 text-xs text-ink-faint">
              Last hello: {gentleSince(person.lastTouched)}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-0.5" onClick={stop}>
          <a
            href={composeEmailHref(person)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            aria-label={`Email ${person.fullName}`}
            className={cn(quickAction, "hover:text-beacon-deep")}
          >
            <Mail className="h-[18px] w-[18px]" />
          </a>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stop}
              aria-label={`Open ${person.fullName} on LinkedIn`}
              className={cn(quickAction, "hover:text-beacon-deep")}
            >
              <ExternalLink className="h-[18px] w-[18px]" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
