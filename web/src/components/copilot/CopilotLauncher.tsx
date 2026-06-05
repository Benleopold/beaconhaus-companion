"use client";
import { Sparkles } from "lucide-react";
import { useCopilot } from "./CopilotProvider";

/** Floating button shown on every page when the copilot is closed. */
export function CopilotLauncher() {
  const { view, open } = useCopilot();
  if (view !== "hidden") return null;
  return (
    <button
      onClick={() => open("popup")}
      aria-label="Open the BeaconHaus copilot"
      className="beacon focus-ring fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-[var(--shadow-beacon)] transition-transform hover:scale-[1.04] active:scale-95 md:bottom-6 md:right-6"
    >
      <Sparkles className="h-5 w-5" />
      <span className="text-sm font-semibold">Ask</span>
    </button>
  );
}
