"use client";
import { motion } from "framer-motion";
import { useCopilot } from "./CopilotProvider";
import { CopilotPanel } from "./CopilotPanel";

export function CopilotOverlay() {
  const { view, close } = useCopilot();
  if (view === "hidden") return null;

  if (view === "popup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="fixed bottom-24 right-3 z-50 h-[min(76vh,640px)] w-[min(94vw,400px)] overflow-hidden rounded-3xl border border-line bg-canvas shadow-[var(--shadow-lift)] md:bottom-6 md:right-6"
      >
        <CopilotPanel compact />
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-[rgba(43,37,32,0.28)] backdrop-blur-sm sm:items-center sm:p-6">
      <div className="absolute inset-0" onClick={close} aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-full w-full overflow-hidden border border-line bg-canvas shadow-[var(--shadow-lift)] sm:h-[min(88vh,820px)] sm:max-w-4xl sm:rounded-3xl"
      >
        <CopilotPanel compact={false} />
      </motion.div>
    </div>
  );
}
