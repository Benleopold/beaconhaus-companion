"use client";
import { motion } from "framer-motion";
import { Feather, MapPin, Settings, Sunrise, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSeed } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Today", icon: Sunrise, match: (p: string) => p === "/" },
  { href: "/network", label: "People", icon: Users, match: (p: string) => p.startsWith("/network") },
  { href: "/places", label: "Places", icon: MapPin, match: (p: string) => p.startsWith("/places") },
  { href: "/capture", label: "Capture", icon: Feather, match: (p: string) => p.startsWith("/capture") },
];

function BeaconMark() {
  return (
    <span className="beacon grid h-7 w-7 place-items-center rounded-full">
      <span className="h-2 w-2 rounded-full bg-white/90" />
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useSeed();
  const settingsActive = pathname.startsWith("/settings");

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line/70 bg-[rgba(255,253,249,0.5)] px-4 py-6 backdrop-blur-sm md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <BeaconMark />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">BeaconHaus</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="focus-ring relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-side"
                    className="absolute inset-0 rounded-2xl bg-warm-soft"
                    transition={{ type: "spring", damping: 30, stiffness: 360 }}
                  />
                )}
                <Icon
                  className={cn("relative h-5 w-5 transition-colors", active ? "text-beacon-deep" : "text-ink-faint")}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={cn("relative text-[15px] font-medium transition-colors", active ? "text-beacon-deep" : "text-ink-soft")}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/settings"
          className={cn(
            "focus-ring mt-auto flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-colors",
            settingsActive ? "bg-warm-soft text-beacon-deep" : "text-ink-soft hover:bg-surface-2",
          )}
        >
          <Settings className="h-5 w-5" strokeWidth={settingsActive ? 2.4 : 2} />
          <span className="text-[15px] font-medium">Settings</span>
        </Link>
      </aside>

      {/* Content area (mobile top bar + page + mobile bottom nav) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md md:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <BeaconMark />
            <span className="font-display text-lg font-semibold tracking-tight text-ink">BeaconHaus</span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              "focus-ring grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2",
              settingsActive && "bg-surface-2 text-ink",
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </header>

        <main className="flex-1 px-5 pb-32 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-xl md:max-w-2xl">
            {/* Keyed fade-in only. No AnimatePresence / exit, so client-side
                navigation can never get stuck waiting on an exit animation. */}
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-1 rounded-full border border-line bg-[rgba(255,253,249,0.82)] p-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="focus-ring relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 sm:px-5"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-bottom"
                    className="absolute inset-0 rounded-full bg-warm-soft"
                    transition={{ type: "spring", damping: 30, stiffness: 360 }}
                  />
                )}
                <Icon
                  className={cn("relative h-5 w-5 transition-colors", active ? "text-beacon-deep" : "text-ink-faint")}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={cn("relative text-[11px] font-medium transition-colors", active ? "text-beacon-deep" : "text-ink-faint")}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
