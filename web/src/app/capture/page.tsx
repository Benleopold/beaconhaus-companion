"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Feather, Sparkles, X } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Pill,
  Textarea,
} from "@/components/ui";
import { useCaptures } from "@/lib/hooks";
import { saveCapture, deleteCapture } from "@/lib/repo";
import { vocab } from "@/lib/rulebook.generated";
import { gentleSince, cn } from "@/lib/utils";

const TYPES = vocab.captureTypes;
const DEFAULT_TYPE = "idea";

/** Short usage hint shown on each saved capture card. */
const TYPE_USE: Record<string, string> = {
  "pain-point": "Pitch material",
  "case-study": "Proof for outreach",
  "idea": "Worth revisiting",
};

function typeLabel(value?: string): string {
  return TYPES.find((t) => t.value === value)?.label ?? "Idea";
}

export default function CapturePage() {
  const captures = useCaptures();

  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState<string>(DEFAULT_TYPE);
  const [saving, setSaving] = useState(false);

  const loading = captures === undefined;
  const count = captures?.length ?? 0;

  const countLabel =
    count === 0
      ? "A quiet place for your thoughts"
      : count === 1
        ? "1 thought captured"
        : `${count} thoughts captured`;

  const onSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await saveCapture({ title: title.trim(), detail: detail.trim() || undefined, type });
      setTitle("");
      setDetail("");
      setType(DEFAULT_TYPE);
    } finally {
      setSaving(false);
    }
  };

  // Selected type description from vocab, shown below type chips as inline hint.
  const selectedTypeDesc = TYPES.find((t) => t.value === type)?.description;

  return (
    <div className="pt-3">
      {/* Header */}
      <div className="pb-4">
        <h1 className="font-display text-[28px] leading-tight text-ink">Capture a thought</h1>
        <p className="mt-0.5 text-sm text-ink-soft">{countLabel}</p>
      </div>

      {/* Composer */}
      <Card className="mb-6 p-4 sm:p-5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(); }}
          placeholder="What is on your mind?"
          aria-label="Title"
          className="border-transparent bg-surface-2 text-base"
        />

        <AnimatePresence initial={false}>
          {(title.trim().length > 0 || detail.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              className="overflow-hidden"
            >
              <Textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Add a little more, if you like"
                aria-label="Detail"
                className="border-transparent bg-surface-2"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type chooser */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={active}
                className={cn(
                  "focus-ring rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]",
                  active
                    ? "beacon border-transparent text-white shadow-[var(--shadow-beacon)]"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-2",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Inline hint: what the selected type is for */}
        {selectedTypeDesc && (
          <p className="mt-1.5 text-[12px] text-ink-faint">{selectedTypeDesc}</p>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="beacon" onClick={onSave} disabled={!title.trim() || saving}>
            <Feather className="h-[18px] w-[18px]" />
            Save
          </Button>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card space-y-3 p-4" style={{ opacity: 1 - i * 0.22 }}>
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-2" />
              <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-surface-2" />
              <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-surface-2" />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-7 w-7" />}
          title="A blank page, ready for you"
          body="Jot down a pain point, a story worth telling, or an idea to revisit. Every good thing starts as a small note."
        />
      ) : (
        <CaptureList captures={captures!} />
      )}
    </div>
  );
}

function CaptureList({
  captures,
}: {
  captures: NonNullable<ReturnType<typeof useCaptures>>;
}) {
  const items = useMemo(() => captures, [captures]);

  return (
    <motion.div layout className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((c) => {
          const usageHint = TYPE_USE[c.type ?? ""] ?? null;
          return (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 360 }}
            >
              <Card className="group p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={c.type === "case-study" ? "sage" : "beacon"}>
                      {typeLabel(c.type)}
                    </Pill>
                    {usageHint && (
                      <span className="text-[12px] text-ink-faint">{usageHint}</span>
                    )}
                  </div>
                  <IconButton
                    onClick={() => deleteCapture(c.id)}
                    aria-label="Remove this thought"
                    className="-mr-1.5 -mt-1.5 h-9 w-9 text-ink-faint opacity-0 transition-opacity hover:text-ink-soft focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </IconButton>
                </div>

                <h3 className="mt-3 font-display text-[17px] leading-snug text-ink">
                  {c.title}
                </h3>

                {c.detail && (
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                    {c.detail}
                  </p>
                )}

                <p className="mt-3 text-xs text-ink-faint">
                  {gentleSince(c.createdAt)}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
