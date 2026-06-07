"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  Input,
  Select,
  Sheet,
  Textarea,
} from "@/components/ui";
import { vocab } from "@/lib/rulebook.generated";
import { deleteFacility, saveFacility } from "@/lib/repo";
import type { Facility } from "@/lib/types";

const toOptions = (list: readonly { value: string; label: string }[]) =>
  list.map((o) => ({ value: o.value, label: o.label }));

type FormState = {
  facilityName: string;
  type: string;
  town: string;
  region: string;
  leadRoute: string;
  aligned: string;
  status: string;
  decisionMaker: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  nextStep: string;
  fitNotes: string;
};

const blank: FormState = {
  facilityName: "",
  type: "",
  town: "",
  region: "",
  leadRoute: "",
  aligned: "",
  status: "",
  decisionMaker: "",
  title: "",
  email: "",
  phone: "",
  website: "",
  nextStep: "",
  fitNotes: "",
};

function fromFacility(f: Facility): FormState {
  return {
    facilityName: f.facilityName ?? "",
    type: f.type ?? "",
    town: f.town ?? "",
    region: f.region ?? "",
    leadRoute: f.leadRoute ?? "",
    aligned: f.aligned ?? "",
    status: f.status ?? "",
    decisionMaker: f.decisionMaker ?? "",
    title: f.title ?? "",
    email: f.email ?? "",
    phone: f.phone ?? "",
    website: f.website ?? "",
    nextStep: f.nextStep ?? "",
    fitNotes: f.fitNotes ?? "",
  };
}

/** Add or edit a target place. Pass `facility` to edit, omit to create. */
export function FacilityForm({
  open,
  onClose,
  facility,
}: {
  open: boolean;
  onClose: () => void;
  facility?: Facility | null;
}) {
  const editing = Boolean(facility);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  // Refresh the form each time the sheet opens for a given record.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(facility ? fromFacility(facility) : blank);
  }, [open, facility]);

  const set = <K extends keyof FormState>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSave = form.facilityName.trim().length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const trimmed = (s: string) => {
        const v = s.trim();
        return v.length ? v : undefined;
      };
      await saveFacility({
        ...(facility ? { id: facility.id } : {}),
        facilityName: form.facilityName.trim(),
        type: trimmed(form.type),
        town: trimmed(form.town),
        region: trimmed(form.region),
        leadRoute: trimmed(form.leadRoute),
        aligned: trimmed(form.aligned),
        status: trimmed(form.status),
        decisionMaker: trimmed(form.decisionMaker),
        title: trimmed(form.title),
        email: trimmed(form.email),
        phone: trimmed(form.phone),
        website: trimmed(form.website),
        nextStep: trimmed(form.nextStep),
        fitNotes: trimmed(form.fitNotes),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!facility) return;
    setSaving(true);
    try {
      await deleteFacility(facility.id);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Edit place" : "Add a place"}>
      <div className="flex flex-col gap-4">
        <Field label="Facility name" hint="The only thing we need to begin.">
          <Input
            value={form.facilityName}
            onChange={(e) => set("facilityName", e.target.value)}
            placeholder="Mount Alverno"
            autoFocus={!editing}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select
              options={toOptions(vocab.facilityTypes)}
              placeholder="Choose a type"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select
              options={toOptions(vocab.facilityStatuses)}
              placeholder="Where things stand"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Town">
            <Input
              value={form.town}
              onChange={(e) => set("town", e.target.value)}
              placeholder="Warwick"
            />
          </Field>
          <Field label="Region">
            <Select
              options={toOptions(vocab.regions)}
              placeholder="Choose a region"
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Lead route" hint="A warm introduction goes a long way.">
            <Select
              options={toOptions(vocab.leadRoutes)}
              placeholder="How we get in"
              value={form.leadRoute}
              onChange={(e) => set("leadRoute", e.target.value)}
            />
          </Field>
          <Field label="Aligned with us">
            <Select
              options={toOptions(vocab.alignmentLevels)}
              placeholder="Values fit"
              value={form.aligned}
              onChange={(e) => set("aligned", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Decision maker">
            <Input
              value={form.decisionMaker}
              onChange={(e) => set("decisionMaker", e.target.value)}
              placeholder="Who to speak with"
            />
          </Field>
          <Field label="Their title">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Executive Director"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="hello@place.org"
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(845) 555 0100"
            />
          </Field>
        </div>

        <Field label="Website">
          <Input
            type="url"
            inputMode="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="placewebsite.org"
          />
        </Field>

        <Field label="Next step">
          <Input
            value={form.nextStep}
            onChange={(e) => set("nextStep", e.target.value)}
            placeholder="Confirm the right contact"
          />
        </Field>

        <Field label="Fit notes" hint="Why this place feels like a good home for us.">
          <Textarea
            value={form.fitNotes}
            onChange={(e) => set("fitNotes", e.target.value)}
            placeholder="What makes this a warm match"
          />
        </Field>

        <div className="mt-1 flex flex-col gap-3">
          <Button
            variant="beacon"
            size="lg"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full"
          >
            <Sparkles className="h-4 w-4" />
            {editing ? "Save changes" : "Add this place"}
          </Button>

          {editing && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="focus-ring mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-ink-faint transition-colors hover:text-ink-soft disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove this place
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
