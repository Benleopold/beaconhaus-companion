"use client";

import { HeartHandshake } from "lucide-react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import { ensureSeeded, notifyRepoChange } from "@/lib/repo";
import { isRemoteConfigured, isNeonConfigured, isSupabaseConfigured } from "@/lib/backend";
import { signInWithOtp, signOutSupabase, getSupabaseUser, onSupabaseAuthStateChange } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  if (!isRemoteConfigured) return <>{children}</>;

  if (isSupabaseConfigured) {
    return <SupabaseAuthGate>{children}</SupabaseAuthGate>;
  }

  return (
    <SessionProvider>
      <RemoteAuthGate>{children}</RemoteAuthGate>
    </SessionProvider>
  );
}

function SupabaseAuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
  const [user, setUser] = useState<null | { id: string; email?: string | null }>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSupabaseUser()
      .then((currentUser) => {
        if (!mounted) return;
        if (currentUser) {
          setUser({ id: currentUser.id, email: currentUser.email });
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus("unauthenticated");
        }
      });

    const { subscription } = onSupabaseAuthStateChange((_, session) => {
      if (!mounted) return;
      if (session?.access_token) {
        getSupabaseUser().then((currentUser) => {
          setUser(currentUser ? { id: currentUser.id, email: currentUser.email } : null);
          setStatus(currentUser ? "authenticated" : "unauthenticated");
        });
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const signInEmail = async () => {
    if (!email.trim()) {
      setMessage("Enter your email to receive a magic sign-in link.");
      return;
    }

    const { error } = await signInWithOtp(email.trim());
    if (error) {
      setMessage(error.message || "Unable to send sign-in link.");
    } else {
      setMessage("Check your inbox for a magic sign-in link.");
    }
  };

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

  if (!user) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-10">
        <section className="w-full max-w-sm">
          <div className="text-center">
            <span className="beacon mx-auto grid h-12 w-12 place-items-center rounded-full">
              <HeartHandshake className="h-5 w-5 text-white" />
            </span>
            <h1 className="mt-4 font-display text-[30px] leading-tight text-ink">BeaconHaus</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Sign in with your email to keep your circle private and in step.
            </p>
          </div>

          <div className="card mt-6 p-4">
            <label className="block text-left text-[13px] font-semibold text-ink-soft">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-ink-100 bg-surface-1 px-4 py-3 text-[15px] text-ink outline-none transition focus:border-beacon focus:ring-2 focus:ring-beacon/20"
              placeholder="liz@example.com"
              aria-label="Email address"
            />
            <Button variant="beacon" className="mt-4 w-full" onClick={signInEmail}>
              Send magic link
            </Button>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-ink-faint">
              BeaconHaus uses email sign-in only to identify your private account. Nothing else is stored without your permission.
            </p>
            {message ? (
              <p className="mt-3 text-center text-[13px] text-ink-soft">{message}</p>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
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
        if (isSupabaseConfigured) {
          await signOutSupabase();
        } else {
          await signOut();
        }
        notifyRepoChange();
      }}
      className="text-ink-faint"
    >
      Sign out
    </Button>
  );
}
