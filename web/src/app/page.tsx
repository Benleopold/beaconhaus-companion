"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Coffee,
  Copy,
  ExternalLink,
  Feather,
  Heart,
  HeartHandshake,
  Key,
  Mail,
  MapPin,
  RotateCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, Button, EmptyState, Input, Pill, WarmthPill } from "@/components/ui";
import { useFacilities, usePeople, useProfile } from "@/lib/hooks";
import { quickDraft } from "@/lib/copilot/client";
import { composeEmailHref, linkedInHref } from "@/lib/links";
import { logHello, saveCapture } from "@/lib/repo";
import { profile as profileDefaults, vocab } from "@/lib/rulebook.generated";
import type { Facility, Person } from "@/lib/types";
import { byColdestFirst, computeWarmth } from "@/lib/warmth";

const EASE = [0.22, 1, 0.36, 1] as const;
type Intent = "hello" | "connect" | "place" | "capture";

const labelOf = (list: readonly { value: string; label: string }[], v?: string) =>
  v ? list.find((o) => o.value === v)?.label : undefined;

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function gmailWith(to: string | undefined, subject: string, body: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: to ?? "", su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** One-line reason why this person is surfaced today. */
function whyNow(p: Person): string {
  if (p.doorsCanOpen) return `Connector: can open doors to ${p.doorsCanOpen.toLowerCase()}.`;
  if (!p.lastTouched) return "Ready for a first hello.";
  if (p.relationship) return p.relationship;
  const sphere = labelOf(vocab.spheres, p.sphere);
  return sphere ? `Part of your ${sphere.toLowerCase()} circle.` : "Worth staying close to.";
}

/** Parse "warm-via-mina" → "mina"; return null for "warm-via-other" or non-warm routes. */
function connectorToken(leadRoute?: string): string | null {
  if (!leadRoute?.startsWith("warm-via-")) return null;
  const t = leadRoute.slice("warm-via-".length).toLowerCase().trim();
  return t && t !== "other" ? t : null;
}

function findConnectorForFacility(facility: Facility, people: Person[]): Person | undefined {
  const token = connectorToken(facility.leadRoute);
  if (!token) return undefined;
  return people.find((p) => p.fullName?.toLowerCase().includes(token));
}

export default function TodayPage() {
  const profile = useProfile();
  const people = usePeople();
  const facilities = useFacilities();

  const [intent, setIntent] = useState<Intent | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const name = profile?.displayName ?? profileDefaults.displayName;
  const tagline = profile?.tagline ?? profileDefaults.tagline;

  const personQueue = useMemo(
    () => (people ? [...people].sort(byColdestFirst).filter((p) => !dismissed.has(p.id)) : []),
    [people, dismissed],
  );
  const facilityQueue = useMemo(
    () => (facilities ? facilities.filter((f) => !dismissed.has(f.id)) : []),
    [facilities, dismissed],
  );

  const setAside = (id: string) => setDismissed((s) => new Set(s).add(id));
  const backToMenu = () => setIntent(null);

  return (
    <div className="flex flex-col gap-6 pt-3">
      <header>
        <h1 className="font-display text-[1.9rem] leading-tight tracking-tight text-ink">
          {timeGreeting()}, {name}
        </h1>
        <p className="mt-1 text-[15px] italic text-ink-soft">{tagline}</p>
      </header>

      <WeeklyChip count={profile?.weekCount ?? 0} goal={profile?.weeklyWarmupGoal ?? profileDefaults.weeklyWarmupGoal} />

      <motion.div
        key={intent ?? "menu"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {intent === null && <IntentMenu onPick={setIntent} />}
        {(intent === "hello" || intent === "connect") && (
          <PersonSuggestion
            mode={intent}
            person={personQueue[0]}
            displayName={name}
            onElse={(id) => setAside(id)}
            onBack={backToMenu}
          />
        )}
        {intent === "place" && (
          <PlaceSuggestion
            facility={facilityQueue[0]}
            people={people ?? []}
            onElse={(id) => setAside(id)}
            onBack={backToMenu}
          />
        )}
        {intent === "capture" && <QuickCapture onBack={backToMenu} />}
      </motion.div>
    </div>
  );
}

/* --- Weekly chip ---------------------------------------------------------- */
function WeeklyChip({ count, goal }: { count: number; goal: number }) {
  const met = count >= Math.max(goal, 1);
  return (
    <div className="flex items-center gap-2.5 self-start rounded-full border border-line bg-surface/70 px-3.5 py-1.5">
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.max(goal, count, 1) }, (_, i) => (
          <span key={i} className={i < count ? "beacon h-2 w-2 rounded-full" : "h-2 w-2 rounded-full bg-surface-2"} />
        ))}
      </div>
      <span className="text-[13px] text-ink-soft">
        {met ? `${count} hellos this week. Lovely.` : `${count} of ${goal} hellos this week`}
      </span>
    </div>
  );
}

/* --- The doorways -------------------------------------------------------- */
const DOORS: { intent: Intent; icon: typeof Coffee; label: string; hint: string }[] = [
  { intent: "hello", icon: Coffee, label: "A quick hello", hint: "one small warm touch" },
  { intent: "connect", icon: HeartHandshake, label: "Really connect", hint: "I will help you write it" },
  { intent: "place", icon: MapPin, label: "Move a place forward", hint: "one step on a target" },
  { intent: "capture", icon: Feather, label: "Capture a spark", hint: "park a thought here" },
];

function IntentMenu({ onPick }: { onPick: (i: Intent) => void }) {
  return (
    <section>
      <p className="mb-3 px-1 text-[15px] text-ink-soft">How do you want to show up right now?</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DOORS.map((d, i) => {
          const Icon = d.icon;
          return (
            <motion.button
              key={d.intent}
              onClick={() => onPick(d.intent)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
              className="card focus-ring flex items-center gap-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:scale-[0.99]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-warm-soft text-beacon-deep">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[17px] leading-tight text-ink">{d.label}</span>
                <span className="block text-[13px] text-ink-faint">{d.hint}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <button onClick={onBack} className="focus-ring mb-4 -ml-1 flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] text-ink-soft hover:bg-surface-2">
      <ArrowLeft className="h-4 w-4" />
      {title}
    </button>
  );
}

/* --- Person suggestion --------------------------------------------------- */
function PersonSuggestion({
  mode,
  person,
  displayName,
  onElse,
  onBack,
}: {
  mode: "hello" | "connect";
  person: Person | undefined;
  displayName: string;
  onElse: (id: string) => void;
  onBack: () => void;
}) {
  const [greeted, setGreeted] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!person) {
    return (
      <div>
        <BackBar onBack={onBack} title="Back" />
        <div className="card">
          <EmptyState
            icon={<Heart className="h-7 w-7" />}
            title="That is everyone for now"
            body="You have looked in on your whole circle. Add someone new in People."
          />
          <div className="-mt-4 flex justify-center gap-2 px-8 pb-10">
            <Link href="/network">
              <Button variant="beacon">Add someone</Button>
            </Link>
            <Button variant="soft" onClick={onBack}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const warmth = computeWarmth(person.lastTouched);
  const role = person.roleOrg || labelOf(vocab.spheres, person.sphere);
  const li = linkedInHref(person);

  const sayHello = async () => {
    await logHello(person.id);
    setGreeted(true);
  };
  const makeDraft = async () => {
    setDrafting(true);
    setDraft(null);
    try {
      const text = await quickDraft(
        `Draft a short, warm outreach message I (${displayName}) can send to ${person.fullName}. Two or three sentences in a calm, human voice, leading with later-life planning and community connection. Return only the message text, no preamble, no dashes.`,
        "/",
      );
      setDraft(text);
    } finally {
      setDrafting(false);
    }
  };
  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div>
      <BackBar onBack={onBack} title={mode === "connect" ? "Really connect" : "A quick hello"} />
      <div className="card relative overflow-hidden px-6 py-7">
        <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-glow/30 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <Avatar name={person.fullName} size={76} />
          <h2 className="mt-3 font-display text-[1.55rem] leading-tight tracking-tight text-ink">{person.fullName}</h2>
          {role && <p className="mt-0.5 text-sm text-ink-soft">{role}</p>}
          <div className="mt-2.5">
            <WarmthPill warmth={warmth} />
          </div>
          <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-ink">{whyNow(person)}</p>
        </div>

        {greeted ? (
          <div className="relative mt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-[15px] text-ink-soft">A small light sent. That is plenty.</p>
            {/* Connector nudge: if they can open doors, surface it post-greeting */}
            {person.doorsCanOpen && (
              <p className="max-w-xs text-[13px] leading-relaxed text-ink-faint">
                They can open doors to{" "}
                <Link href="/places" className="text-beacon-deep hover:underline">
                  {person.doorsCanOpen.toLowerCase()}
                </Link>
                {person.theAsk && <> &mdash; ask: {person.theAsk.toLowerCase()}</>}.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="soft" onClick={() => onElse(person.id)}>
                <RotateCw className="h-4 w-4" /> Someone else
              </Button>
              <Button variant="quiet" onClick={onBack}>Done for now</Button>
            </div>
          </div>
        ) : draft || drafting ? (
          <div className="relative mt-5">
            <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
              {drafting ? (
                <p className="text-[14.5px] italic text-ink-faint">Writing something warm...</p>
              ) : (
                <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{draft}</p>
              )}
            </div>
            {draft && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a href={gmailWith(person.email, `Hello from ${displayName}`, draft)} target="_blank" rel="noopener noreferrer">
                  <Button variant="beacon">
                    <Mail className="h-4 w-4" /> Send this
                  </Button>
                </a>
                <Button variant="soft" onClick={copyDraft}>
                  {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="ghost" onClick={makeDraft}>
                  <RotateCw className="h-4 w-4" /> Try again
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative mt-7 flex flex-col items-center gap-3">
            {mode === "connect" ? (
              <Button variant="beacon" size="lg" className="w-full max-w-xs" onClick={makeDraft}>
                <Sparkles className="h-[18px] w-[18px]" /> Draft a warm note
              </Button>
            ) : (
              <Button variant="beacon" size="lg" className="w-full max-w-xs" onClick={sayHello}>
                <Heart className="h-[18px] w-[18px]" /> Say hello
              </Button>
            )}
            <div className="flex w-full max-w-xs flex-wrap items-center justify-center gap-2">
              {mode === "connect" && (
                <Button variant="soft" className="flex-1" onClick={sayHello}>
                  <Heart className="h-4 w-4" /> Just say hello
                </Button>
              )}
              <a href={composeEmailHref(person)} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="soft" className="w-full">
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </a>
              {li && (
                <a href={li} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="soft" className="w-full">
                    <ExternalLink className="h-4 w-4" /> LinkedIn
                  </Button>
                </a>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <button onClick={() => onElse(person.id)} className="focus-ring rounded-full px-3 py-1 text-[13px] text-ink-soft hover:bg-surface-2">
                Someone else
              </button>
              <span className="text-ink-faint">.</span>
              <button onClick={onBack} className="focus-ring rounded-full px-3 py-1 text-[13px] text-ink-soft hover:bg-surface-2">
                Not today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Place suggestion ---------------------------------------------------- */
function PlaceSuggestion({
  facility,
  people,
  onElse,
  onBack,
}: {
  facility: Facility | undefined;
  people: Person[];
  onElse: (id: string) => void;
  onBack: () => void;
}) {
  const [idea, setIdea] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  if (!facility) {
    return (
      <div>
        <BackBar onBack={onBack} title="Back" />
        <div className="card">
          <EmptyState
            icon={<MapPin className="h-7 w-7" />}
            title="No place to tend right now"
            body="Add a target place in Places, or come back to this when you are ready."
          />
          <div className="-mt-4 flex justify-center gap-2 px-8 pb-10">
            <Link href="/places">
              <Button variant="beacon">Add a place</Button>
            </Link>
            <Button variant="soft" onClick={onBack}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const type = labelOf(vocab.facilityTypes, facility.type);
  const region = labelOf(vocab.regions, facility.region);
  const status = labelOf(vocab.facilityStatuses, facility.status);
  const connector = findConnectorForFacility(facility, people);

  const suggest = async () => {
    setThinking(true);
    setIdea(null);
    try {
      const text = await quickDraft(
        `Give me one concrete, small next step to move the facility "${facility.facilityName}" forward, in one or two sentences. Ground it in what you know about this place and my warm network. No dashes, no preamble.`,
        "/",
      );
      setIdea(text);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div>
      <BackBar onBack={onBack} title="Move a place forward" />
      <div className="card px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[1.35rem] leading-tight text-ink">{facility.facilityName}</h2>
          {status && <Pill tone="beacon">{status}</Pill>}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {type && <Pill>{type}</Pill>}
          {region && <Pill tone="sage">{region}</Pill>}
        </div>

        {/* Bidirectional connector: show who can open this door */}
        {connector ? (
          <div className="mt-3.5 flex items-center gap-2 rounded-2xl bg-warm-soft px-3.5 py-2.5">
            <Key className="h-4 w-4 shrink-0 text-beacon" />
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-beacon-deep">
                Ask {connector.fullName} for the introduction
              </p>
              {connector.theAsk && (
                <p className="mt-0.5 text-[12px] text-ink-soft">{connector.theAsk}</p>
              )}
            </div>
            <Link
              href="/network"
              className="ml-auto shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium text-beacon-deep hover:bg-warm transition-colors"
            >
              See {connector.fullName}
            </Link>
          </div>
        ) : facility.nextStep ? (
          <div className="mt-3.5 rounded-2xl bg-surface-2 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Next step</span>
            <p className="mt-0.5 text-[14px] leading-relaxed text-ink">{facility.nextStep}</p>
          </div>
        ) : null}

        {facility.fitNotes && (
          <p className="mt-3 text-[13.5px] italic text-ink-faint">{facility.fitNotes}</p>
        )}

        {(idea || thinking) && (
          <div className="mt-4 rounded-2xl border border-line bg-surface-2/60 p-4">
            {thinking ? (
              <p className="text-[14px] italic text-ink-faint">Thinking of a gentle next step...</p>
            ) : (
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{idea}</p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="beacon" onClick={suggest}>
            <Sparkles className="h-4 w-4" /> Suggest a next step
          </Button>
          {facility.website && (
            <a href={/^https?:\/\//.test(facility.website) ? facility.website : `https://${facility.website}`} target="_blank" rel="noopener noreferrer">
              <Button variant="soft">
                <ExternalLink className="h-4 w-4" /> Website
              </Button>
            </a>
          )}
          <Button variant="ghost" onClick={() => onElse(facility.id)}>
            <RotateCw className="h-4 w-4" /> Different place
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --- Quick capture ------------------------------------------------------- */
function QuickCapture({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    await saveCapture({ title: title.trim(), type: "idea" });
    setTitle("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div>
      <BackBar onBack={onBack} title="Capture a spark" />
      <div className="card p-5">
        <p className="mb-3.5 text-[15px] text-ink-soft">What is on your mind? Park it here and let it go.</p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void save(); }}
          placeholder="A thought, a pain point, an idea..."
          autoFocus
        />
        <div className="mt-3.5 flex items-center gap-2">
          <Button variant="beacon" onClick={save} disabled={!title.trim()}>
            <Feather className="h-4 w-4" /> Keep it
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-[13px] text-sage">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <Link href="/capture" className="ml-auto text-[13px] text-ink-soft underline-offset-2 hover:underline">
            See all captures
          </Link>
        </div>
      </div>
    </div>
  );
}
