"use client";

import { HeartHandshake } from "lucide-react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import { ensureSeeded, notifyRepoChange } from "@/lib/repo";
import { isRemoteConfigured } from "@/lib/backend";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  if (!isRemoteConfigured) return <>{children}</>;

  return (
    <SessionProvider>
      <RemoteAuthGate>{children}</RemoteAuthGate>
    </SessionProvider>
  );
}

function RemoteAuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    ensureSeeded().finally(() => {
      if (active) notifyRepoChange();
    });
    return () => {
      active = false;
    };
  }, [status]);

  if (status === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center px-5">
        <div className="text-center">
          <span className="beacon mx-auto grid h-10 w-10 place-items-center rounded-full">
            <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          </span>
          <p className="mt-4 text-[15px] text-ink-soft">Opening BeaconHaus...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-10">
        <section className="w-full max-w-sm">
          <div className="text-center">
            <span className="beacon mx-auto grid h-12 w-12 place-items-center rounded-full">
              <HeartHandshake className="h-5 w-5 text-white" />
            </span>
            <h1 className="mt-4 font-display text-[30px] leading-tight text-ink">BeaconHaus</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Sign in with Google to keep your circle private and in step.
            </p>
          </div>

          <div className="card mt-6 p-4">
            <Button variant="beacon" className="w-full" onClick={() => signIn("google")}>
              Continue with Google
            </Button>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-ink-faint">
              BeaconHaus uses Google only to identify your private account. Drive access will be asked for separately if you use it later.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

export function SignOutButton() {
  if (!isRemoteConfigured) return null;

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await signOut();
        notifyRepoChange();
      }}
      className="text-ink-faint"
    >
      Sign out
    </Button>
  );
}
