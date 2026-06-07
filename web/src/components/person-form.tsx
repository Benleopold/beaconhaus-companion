"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  Button,
  Field,
  Input,
  Select,
  Sheet,
  Textarea,
} from "@/components/ui";
import { savePerson, deletePerson } from "@/lib/repo";
import { vocab } from "@/lib/rulebook.generated";
import type { Person } from "@/lib/types";

const sphereOptions = [...vocab.spheres]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((o) => ({ value: o.value, label: o.label }));

const statusOptions = [...vocab.personStatuses]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((o) => ({ value: o.value, label: o.label }));

type FormState = {
  fullName: string;
  roleOrg: string;
  sphere: string;
  status: string;
  relationship: string;
  doorsCanOpen: string;
  theAsk: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  nextStep: string;
  notes: string;
};

const empty: FormState = {
  fullName: "",
  roleOrg: "",
  sphere: "",
  status: "",
  relationship: "",
  doorsCanOpen: "",
  theAsk: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  nextStep: "",
  notes: "",
};

function fromPerson(p: Person): FormState {
  return {
    fullName: p.fullName ?? "",
    roleOrg: p.roleOrg ?? "",
    sphere: p.sphere ?? "",
    status: p.status ?? "",
    relationship: p.relationship ?? "",
    doorsCanOpen: p.doorsCanOpen ?? "",
    theAsk: p.theAsk ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    linkedinUrl: p.linkedinUrl ?? "",
    nextStep: p.nextStep ?? "",
    notes: p.notes ?? "",
  };
}

export function PersonForm({
  open,
  onClose,
  person,
}: {
  open: boolean;
  onClose: () => void;
  person?: Person;
}) {
  const editing = Boolean(person);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  // Reload the form whenever the sheet opens or the target person changes.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(person ? fromPerson(person) : empty);
    setSaving(false);
  }, [open, person]);

  const set = <K extends keyof FormState>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = form.fullName.trim().length > 0 && !saving;

  const trim = (s: string) => {
    const t = s.trim();
    return t.length ? t : undefined;
  };

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await savePerson({
      ...(person?.id ? { id: person.id } : {}),
      fullName: form.fullName.trim(),
      roleOrg: trim(form.roleOrg),
      sphere: trim(form.sphere),
      status: trim(form.status),
      relationship: trim(form.relationship),
      doorsCanOpen: trim(form.doorsCanOpen),
      theAsk: trim(form.theAsk),
      email: trim(form.email),
      phone: trim(form.phone),
      linkedinUrl: trim(form.linkedinUrl),
      nextStep: trim(form.nextStep),
      notes: trim(form.notes),
    });
    onClose();
  }

  async function handleRemove() {
    if (!person?.id) return;
    setSaving(true);
    await deletePerson(person.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Edit person" : "Add to your circle"}>
      <div className="flex flex-col gap-4">
        <Field label="Full name" hint="The only thing we need to begin.">
          <Input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Who would you like to remember?"
            autoFocus={!editing}
          />
        </Field>

        <Field label="Role or organization">
          <Input
            value={form.roleOrg}
            onChange={(e) => set("roleOrg", e.target.value)}
            placeholder="Director, Willow Grove"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sphere">
            <Select
              options={sphereOptions}
              placeholder="Choose a sphere"
              value={form.sphere}
              onChange={(e) => set("sphere", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select
              options={statusOptions}
              placeholder="Where things stand"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Relationship">
          <Input
            value={form.relationship}
            onChange={(e) => set("relationship", e.target.value)}
            placeholder="How you know each other"
          />
        </Field>

        <Field label="Doors they can open">
          <Textarea
            value={form.doorsCanOpen}
            onChange={(e) => set("doorsCanOpen", e.target.value)}
            placeholder="Introductions or possibilities they might offer"
          />
        </Field>

        <Field label="The ask">
          <Textarea
            value={form.theAsk}
            onChange={(e) => set("theAsk", e.target.value)}
            placeholder="What you might gently invite them into"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="LinkedIn">
          <Input
            type="url"
            inputMode="url"
            value={form.linkedinUrl}
            onChange={(e) => set("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </Field>

        <Field label="Next step">
          <Input
            value={form.nextStep}
            onChange={(e) => set("nextStep", e.target.value)}
            placeholder="A small, kind next move"
          />
        </Field>

        <Field label="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anything worth holding onto"
          />
        </Field>

        <div className="sticky bottom-0 -mx-1 mt-1 flex items-center gap-3 bg-gradient-to-t from-canvas via-canvas to-transparent pt-3">
          <motion.div className="flex-1" whileTap={{ scale: 0.985 }}>
            <Button
              variant="beacon"
              size="lg"
              className="w-full"
              disabled={!canSave}
              onClick={handleSave}
            >
              {editing ? "Save changes" : "Add to circle"}
            </Button>
          </motion.div>
          {editing && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleRemove}
              disabled={saving}
              aria-label="Remove from circle"
              className="text-ink-faint hover:text-ink-soft"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
