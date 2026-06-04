"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Heart, Mail, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, Button, EmptyState, WarmthPill } from "@/components/ui";
import { useProfile, useTodayQueue } from "@/lib/hooks";
import { linkedInHref, mailtoHref } from "@/lib/links";
import { logHello } from "@/lib/repo";
import { profile as profileDefaults, vocab } from "@/lib/rulebook.generated";
import type { Person } from "@/lib/types";
import { computeWarmth, warmthMeta } from "@/lib/warmth";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
   Today: the daily ritual. A calm, one-at-a-time warmup of Liz's circle.
   Implements GovernanceRules R3 (daily ritual) and R4 (weekly encouragement).
   -------------------------------------------------------------------------- */

const sphereLabel = (value?: string): string | null =>
  vocab.spheres.find((s) => s.value === value)?.label ?? null;

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TodayPage() {
  const profile = useProfile();
  const goalCount = profile?.morningWarmupCount ?? profileDefaults.morningWarmupCount;
  const queue = useTodayQueue(goalCount);

  // Track who has been greeted in this session so we can advance through the
  // queue without it reshuffling beneath us as lastTouched updates.
  const [greeted, setGreeted] = useState<Set<string>>(new Set());

  const remaining = useMemo(
    () => (queue ? queue.filter((p) => !greeted.has(p.id)) : undefined),
    [queue, greeted],
  );
  const current = remaining?.[0];

  return (
    <div className="flex flex-col gap-8 pt-3">
      <Greeting profile={profile} />
      <WeeklyEncouragement profile={profile} />

      <section>
        <AnimatePresence mode="wait" initial={false}>
          {queue === undefined ? (
            <FocalSkeleton key="skeleton" />
          ) : queue.length === 0 ? (
            <motion.div key="none" {...fade}>
              <NoPeople />
            </motion.div>
          ) : current ? (
            <FocalCard
              key={current.id}
              person={current}
              profile={profile}
              onSayHello={async () => {
                await logHello(current.id);
                setGreeted((prev) => new Set(prev).add(current.id));
              }}
            />
          ) : (
            <motion.div key="complete" {...fade}>
              <CompletionState />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

/* --- Greeting ----------------------------------------------------------- */

function Greeting({ profile }: { profile: ReturnType<typeof useProfile> }) {
  const name = profile?.displayName ?? profileDefaults.displayName;
  const tagline = profile?.tagline ?? profileDefaults.tagline;
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="font-display text-[1.95rem] leading-tight tracking-tight text-ink">
        {timeGreeting()}, {name}
      </h1>
      <p className="mt-1 text-[15px] italic text-ink-soft">{tagline}</p>
    </motion.header>
  );
}

/* --- Weekly encouragement (R4) ------------------------------------------ */

function WeeklyEncouragement({ profile }: { profile: ReturnType<typeof useProfile> }) {
  if (!profile) return <WeeklySkeleton />;

  const goal = Math.max(profile.weeklyWarmupGoal, 1);
  const count = profile.weekCount ?? 0;
  const met = count >= goal;
  const dots = Math.max(goal, count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card flex items-center gap-4 px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: dots }, (_, idx) => {
          const filled = idx < count;
          return (
            <motion.span
              key={idx}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 + idx * 0.05, type: "spring", stiffness: 320, damping: 20 }}
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                filled ? "beacon" : "bg-surface-2 ring-1 ring-inset ring-line",
              )}
            />
          );
        })}
      </div>
      <p className="text-[15px] leading-snug text-ink-soft">
        {met ? (
          <span className="font-medium text-beacon-deep">
            {count} hellos this week. Your circle is glowing.
          </span>
        ) : (
          <>
            <span className="font-medium text-ink">{count}</span> of {goal} hellos this week
          </>
        )}
      </p>
    </motion.div>
  );
}

/* --- Focal card: one person at a time ----------------------------------- */

function FocalCard({
  person,
  profile,
  onSayHello,
}: {
  person: Person;
  profile: ReturnType<typeof useProfile>;
  onSayHello: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const warmth = computeWarmth(
    person.lastTouched,
    profile?.warmThresholdDays,
    profile?.coolingThresholdDays,
  );
  const tone = warmthMeta[warmth].tone;
  const sphere = sphereLabel(person.sphere);
  const reason = person.relationship || person.doorsCanOpen || null;
  const liUrl = linkedInHref(person);

  const handleHello = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onSayHello();
    } catch {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="card relative overflow-hidden px-6 py-7"
    >
      {/* soft beacon glow behind the avatar */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-glow/40 blur-3xl"
      />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 22 }}
        >
          <Avatar name={person.fullName} size={84} />
        </motion.div>

        <h2 className="mt-4 font-display text-[1.7rem] leading-tight tracking-tight text-ink">
          {person.fullName}
        </h2>

        {(sphere || person.roleOrg) && (
          <p className="mt-1 text-sm text-ink-soft">
            {[person.roleOrg, sphere].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-3">
          <WarmthPill warmth={warmth} />
        </div>

        {reason && (
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink">{reason}</p>
        )}

        <p className="mt-3 text-sm italic text-ink-faint">{tone}</p>

        {/* Primary action */}
        <div className="mt-7 w-full max-w-xs">
          <Button
            variant="beacon"
            size="lg"
            onClick={handleHello}
            disabled={busy}
            className="w-full"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2.2} />
            {busy ? "Sending warmth" : "Say hello"}
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="mt-3 flex w-full max-w-xs items-center justify-center gap-2">
          <a href={mailtoHref(person)} className="flex-1">
            <Button variant="soft" className="w-full">
              <Mail className="h-[17px] w-[17px]" />
              Email
            </Button>
          </a>
          {liUrl && (
            <a href={liUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="soft" className="w-full">
                <ExternalLink className="h-[17px] w-[17px]" />
                LinkedIn
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* --- Completion state --------------------------------------------------- */

function CompletionState() {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative"
      >
        <span className="beacon grid h-20 w-20 place-items-center rounded-full">
          <motion.span
            animate={{ scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-8 w-8 text-white" strokeWidth={2} />
          </motion.span>
        </span>
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-glow/50 blur-2xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <h2 className="mt-6 font-display text-2xl tracking-tight text-ink">
        You have tended your circle today
      </h2>
      <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-soft">
        Every hello is a small light. Rest easy now and let it glow. There is nothing more to do.
      </p>
    </div>
  );
}

/* --- No people at all --------------------------------------------------- */

function NoPeople() {
  return (
    <div className="card">
      <EmptyState
        icon={<UserPlus className="h-7 w-7" />}
        title="Your circle starts here"
        body="Add someone you would love to stay close to, and a gentle daily hello will be ready for you."
      />
      <div className="px-8 pb-10 -mt-4 flex justify-center">
        <Link href="/network">
          <Button variant="beacon" size="lg">
            <UserPlus className="h-[18px] w-[18px]" />
            Add your first person
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* --- Skeletons ---------------------------------------------------------- */

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
};

function WeeklySkeleton() {
  return (
    <div className="card flex items-center gap-4 px-5 py-4">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }, (_, idx) => (
          <span key={idx} className="h-2.5 w-2.5 rounded-full bg-surface-2" />
        ))}
      </div>
      <div className="h-3.5 w-32 rounded-full bg-surface-2" />
    </div>
  );
}

function FocalSkeleton() {
  return (
    <div className="card flex flex-col items-center px-6 py-7">
      <div className="h-[84px] w-[84px] animate-pulse rounded-full bg-surface-2" />
      <div className="mt-5 h-6 w-40 animate-pulse rounded-full bg-surface-2" />
      <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-surface-2" />
      <div className="mt-4 h-4 w-56 animate-pulse rounded-full bg-surface-2" />
      <div className="mt-7 h-12 w-full max-w-xs animate-pulse rounded-full bg-surface-2" />
    </div>
  );
}
