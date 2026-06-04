"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Cloud,
  HeartHandshake,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Button, Card, Field, Input, SectionLabel } from "@/components/ui";
import { useProfile } from "@/lib/hooks";
import { updateProfile } from "@/lib/repo";
import { governance, profile as profileSeed } from "@/lib/rulebook.generated";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

// The editable shape of the rhythm form (everything is a draft string while typing).
type Draft = {
  displayName: string;
  tagline: string;
  weeklyWarmupGoal: string;
  morningWarmupCount: string;
  warmThresholdDays: string;
  coolingThresholdDays: string;
};

function draftFromProfile(p: Profile): Draft {
  return {
    displayName: p.displayName ?? "",
    tagline: p.tagline ?? "",
    weeklyWarmupGoal: String(p.weeklyWarmupGoal ?? ""),
    morningWarmupCount: String(p.morningWarmupCount ?? ""),
    warmThresholdDays: String(p.warmThresholdDays ?? ""),
    coolingThresholdDays: String(p.coolingThresholdDays ?? ""),
  };
}

// Keep a number gently sensible: fall back to the rulebook default, clamp to >= 1.
function toCount(value: string, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export default function SettingsPage() {
  const profile = useProfile();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seed local state once the profile arrives.
  useEffect(() => {
    if (profile && draft === null) setDraft(draftFromProfile(profile));
  }, [profile, draft]);

  // Let the "Saved" note linger softly, then fade.
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2400);
    return () => clearTimeout(t);
  }, [saved]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const onSave = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      await updateProfile({
        displayName: draft.displayName.trim() || profileSeed.displayName,
        tagline: draft.tagline.trim() || profileSeed.tagline,
        weeklyWarmupGoal: toCount(draft.weeklyWarmupGoal, profileSeed.weeklyWarmupGoal),
        morningWarmupCount: toCount(draft.morningWarmupCount, profileSeed.morningWarmupCount),
        warmThresholdDays: toCount(draft.warmThresholdDays, profileSeed.warmThresholdDays),
        coolingThresholdDays: toCount(
          draft.coolingThresholdDays,
          profileSeed.coolingThresholdDays,
        ),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-2">
      <header className="pb-5">
        <h1 className="font-display text-[28px] leading-tight text-ink">Settings</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          A few gentle dials, set to your own pace.
        </p>
      </header>

      {/* Your rhythm ------------------------------------------------------- */}
      <section className="mb-8">
        <SectionLabel>Your rhythm</SectionLabel>

        {draft === null ? (
          <RhythmSkeleton />
        ) : (
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <Field label="Your name">
                <Input
                  value={draft.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Liz"
                  aria-label="Your name"
                />
              </Field>

              <Field label="Your tagline" hint="The words that light the way.">
                <Input
                  value={draft.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Illuminating Life, Legacy, and Love"
                  aria-label="Your tagline"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Hellos each week"
                  hint="A gentle goal to reach for."
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.weeklyWarmupGoal}
                    onChange={(e) => set("weeklyWarmupGoal", e.target.value)}
                    aria-label="Hellos each week"
                  />
                </Field>

                <Field
                  label="People each morning"
                  hint="How many to greet in the daily ritual."
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.morningWarmupCount}
                    onChange={(e) => set("morningWarmupCount", e.target.value)}
                    aria-label="People each morning"
                  />
                </Field>

                <Field
                  label="Warm for (days)"
                  hint="Recently connected within this many days."
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.warmThresholdDays}
                    onChange={(e) => set("warmThresholdDays", e.target.value)}
                    aria-label="Warm for, in days"
                  />
                </Field>

                <Field
                  label="Cooling until (days)"
                  hint="After this, ready for a fresh hello."
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.coolingThresholdDays}
                    onChange={(e) => set("coolingThresholdDays", e.target.value)}
                    aria-label="Cooling until, in days"
                  />
                </Field>
              </div>

              <div className="mt-1 flex items-center justify-end gap-3">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sage"
                    >
                      <Check className="h-4 w-4" />
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button variant="beacon" onClick={onSave} disabled={saving}>
                  <HeartHandshake className="h-[18px] w-[18px]" />
                  {saving ? "Saving" : "Save"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Your data -------------------------------------------------------- */}
      <section className="mb-8">
        <SectionLabel>Your data</SectionLabel>
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-sage">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-[17px] leading-snug text-ink">
                Your circle lives with you
              </h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                Everyone you are tending to is kept privately on this device, just for
                you. Nothing leaves your phone.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-surface-2 p-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-beacon-deep">
              <Cloud className="h-4 w-4" />
              Coming soon
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              Soon you will be able to keep your circle safely backed up and in step
              across your phone and computer, with a private folder in your own Google
              Drive.
            </p>
            <div className="mt-3.5">
              <Button variant="soft" disabled aria-label="Connect Google Drive, coming soon">
                <Cloud className="h-4 w-4" />
                Connect Google Drive
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* How BeaconHaus thinks -------------------------------------------- */}
      <section className="mb-8">
        <SectionLabel>How BeaconHaus thinks</SectionLabel>
        <Card className="p-2 sm:p-2.5">
          <div className="px-2 pb-1.5 pt-1.5">
            <div className="flex items-center gap-2 text-[14px] text-ink-soft">
              <ShieldCheck className="h-4 w-4 text-sage" />
              <span>The quiet principles this companion lives by.</span>
            </div>
          </div>
          <ul className="mt-1 flex flex-col">
            {governance.map((rule) => (
              <GovernanceRow key={rule.code} rule={rule} />
            ))}
          </ul>
        </Card>
      </section>

      {/* Footer ----------------------------------------------------------- */}
      <footer className="pb-4 pt-2 text-center">
        <span className="beacon mx-auto mb-3 grid h-7 w-7 place-items-center rounded-full">
          <span className="h-2 w-2 rounded-full bg-white/90" />
        </span>
        <p className="font-display text-[15px] italic text-ink-soft">
          {draft?.tagline?.trim() || profileSeed.tagline}
        </p>
      </footer>
    </div>
  );
}

function GovernanceRow({
  rule,
}: {
  rule: { code: string; title: string; statement: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-line-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-warm-soft px-1.5 text-[12px] font-semibold text-beacon-deep">
          {rule.code}
        </span>
        <span className="flex-1 text-[15px] font-medium text-ink">{rule.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-2 pb-3.5 pl-12 pr-2 text-[14px] leading-relaxed text-ink-soft">
              {rule.statement}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function RhythmSkeleton() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-2" />
            <div className="h-11 w-full animate-pulse rounded-2xl bg-surface-2" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-2" />
              <div className="h-11 w-full animate-pulse rounded-2xl bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
