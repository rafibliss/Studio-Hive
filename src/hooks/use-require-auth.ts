"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/**
 * Route protection for private pages via Better Auth (`authClient.useSession()`).
 *
 * - While the session is being fetched (`checking === true`) the caller
 *   renders a branded loading screen — it never redirects immediately, so
 *   reloading a private route never bounces a logged-in user to /login.
 * - Once the session resolves without an active user, the visitor is
 *   redirected to /login with `?redirect=<the attempted route>`, which the
 *   login page honors to send them back after authenticating.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { data: session, isPending: checking } = authClient.useSession();
  const user = session?.user ?? null;

  React.useEffect(() => {
    if (checking) return; // session still resolving — don't redirect yet
    if (user) return;

    const attempted =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    router.replace(`/login?redirect=${encodeURIComponent(attempted)}`);
  }, [checking, user, router]);

  return { user, checking };
}
