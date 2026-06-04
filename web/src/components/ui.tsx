"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Warmth } from "@/lib/types";

// Buttons -------------------------------------------------------------------
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "beacon" | "soft" | "ghost" | "quiet";
  size?: "md" | "lg";
};
export function Button({ variant = "soft", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100",
        size === "lg" ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm",
        variant === "beacon" &&
          "beacon text-white shadow-[var(--shadow-beacon)] hover:brightness-105",
        variant === "soft" &&
          "bg-surface text-ink border border-line shadow-[var(--shadow-soft)] hover:bg-surface-2",
        variant === "ghost" && "text-ink-soft hover:bg-surface-2",
        variant === "quiet" && "bg-surface-2 text-ink hover:brightness-[0.98]",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "focus-ring grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 active:scale-95",
        className,
      )}
      {...props}
    />
  );
}

// Card ----------------------------------------------------------------------
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card p-4", className)} {...props}>
      {children}
    </div>
  );
}

// Pills ---------------------------------------------------------------------
export function Pill({ tone = "neutral", className, children }: { tone?: "neutral" | "sage" | "beacon"; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "pill",
        tone === "neutral" && "bg-surface-2 text-ink-soft",
        tone === "sage" && "bg-sage-soft text-sage",
        tone === "beacon" && "bg-warm-soft text-beacon-deep",
        className,
      )}
    >
      {children}
    </span>
  );
}

const warmthStyles: Record<Warmth, { dot: string; soft: string; label: string }> = {
  warm: { dot: "bg-warm", soft: "bg-warm-soft text-[color:var(--color-beacon-deep)]", label: "Warm" },
  cooling: { dot: "bg-cooling", soft: "bg-cooling-soft text-[color:var(--color-cooling)]", label: "Cooling" },
  cold: { dot: "bg-ready", soft: "bg-ready-soft text-[color:var(--color-ready)]", label: "Ready" },
};

export function WarmthDot({ warmth, className }: { warmth: Warmth; className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      {warmth === "cold" && (
        <span className={cn("absolute inset-0 animate-ping rounded-full opacity-40", warmthStyles.cold.dot)} />
      )}
      <span className={cn("relative h-2.5 w-2.5 rounded-full", warmthStyles[warmth].dot)} />
    </span>
  );
}

export function WarmthPill({ warmth }: { warmth: Warmth }) {
  const s = warmthStyles[warmth];
  return (
    <span className={cn("pill", s.soft)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// Avatar --------------------------------------------------------------------
const AVATAR_GRADIENTS = [
  "from-[#f2c879] to-[#d9794a]",
  "from-[#e9b4a0] to-[#c97b6a]",
  "from-[#b9cdb0] to-[#7f9778]",
  "from-[#cdb7e0] to-[#9a7fb0]",
  "from-[#f4cf8f] to-[#e0a23c]",
  "from-[#a9c4cf] to-[#7f97a6]",
];
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const grad = AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-semibold text-white", grad)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

// Form fields ---------------------------------------------------------------
const fieldBase =
  "focus-ring w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[13px] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block px-1 text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldBase, "min-h-24 resize-none leading-relaxed", props.className)} />;
}
export function Select({ options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select {...props} className={cn(fieldBase, "appearance-none bg-[length:0]", props.className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Bottom sheet --------------------------------------------------------------
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[rgba(43,37,32,0.32)] backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 max-h-[88vh] w-full max-w-[34rem] overflow-y-auto rounded-t-[var(--radius-3xl)] border border-line bg-canvas px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-lift)] sm:rounded-[var(--radius-3xl)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{title}</h2>
              <IconButton onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Empty state ---------------------------------------------------------------
export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-beacon">{icon}</div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="px-1 pb-2 pt-1 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{children}</h2>;
}
