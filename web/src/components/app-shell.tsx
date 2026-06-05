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
    // Block flow + min-h-dvh. The page body is the scroll container; nothing here
    // constrains height, so every page can always scroll to its very bottom.
    <div className="min-h-dvh overflow-x-hidden">
      {/* Desktop sidebar: fixed, out of flow, with its own scroll if ever needed. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-line/70 bg-[rgba(255,253,249,0.6)] px-4 py-6 backdrop-blur-sm md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <BeaconMark />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">BeaconHaus</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="focus-ring relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
                {active && (
                  <motion.span
                    layoutId="nav-pill-side"
                    className="absolute inset-0 rounded-2xl bg-warm-soft"
                    transition={{ type: "spring", damping: 30, stiffness: 360 }}
                  />
                )}
                <Icon className={cn("relative h-5 w-5 transition-colors", active ? "text-beacon-deep" : "text-ink-faint")} strokeWidth={active ? 2.4 : 2} />
                <span className={cn("relative text-[15px] font-medium transition-colors", active ? "text-beacon-deep" : "text-ink-soft")}>{t.label}</span>
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

      {/* Mobile top bar: sticky, in flow. */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md md:hidden">
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

      {/* Content: offset past the fixed sidebar on desktop; normal document flow. */}
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-xl px-5 pb-32 pt-1 md:max-w-2xl md:px-10 md:pb-16 md:pt-8">
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

      {/* Mobile bottom navigation: fixed. */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-1 rounded-full border border-line bg-[rgba(255,253,249,0.82)] p-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="focus-ring relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 sm:px-5">
                {active && (
                  <motion.span
                    layoutId="nav-pill-bottom"
                    className="absolute inset-0 rounded-full bg-warm-soft"
                    transition={{ type: "spring", damping: 30, stiffness: 360 }}
                  />
                )}
                <Icon className={cn("relative h-5 w-5 transition-colors", active ? "text-beacon-deep" : "text-ink-faint")} strokeWidth={active ? 2.4 : 2} />
                <span className={cn("relative text-[11px] font-medium transition-colors", active ? "text-beacon-deep" : "text-ink-faint")}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
