"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export function useRequireAuth() {
  const router = useRouter();
  const { data: session, isPending: checking } = authClient.useSession();
  const user = session?.user ?? null;
  React.useEffect(() => {
    if (checking) return;
    if (user) return;
    const attempted =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    router.replace(`/login?redirect=${encodeURIComponent(attempted)}`);
  }, [checking, user, router]);
  return { user, checking };
}