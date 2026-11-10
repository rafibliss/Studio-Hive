"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

// Official Google "G" logo — no brand icons ship with lucide
function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.27c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.66z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Shared "Continue with Google" button for the auth pages.
 * Triggers Better Auth's social sign-in; on success Google redirects
 * the full page to `callbackURL` (so pending state just stays on).
 */
export function GoogleAuthButton({
  label = "Continue with Google",
  // Default is an ABSOLUTE frontend URL on purpose: Better Auth resolves
  // relative paths against the BACKEND origin (localhost:8000), so a plain
  // "/" would land the user on the backend's root JSON response after
  // Google consent instead of returning to the frontend.
  callbackURL = "http://localhost:3000/",
}: {
  label?: string;
  callbackURL?: string;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleGoogleSignIn() {
    if (pending) return;
    setPending(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL, // redirects to home after a successful Google login
    });

    if (error) {
      setPending(false);
      toast.add({
        title: "Google sign-in failed",
        description:
          error.message ??
          "Google sign-in isn't available right now. Try again in a moment.",
        type: "error",
      });
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full bg-background text-sm"
      disabled={pending}
      onClick={handleGoogleSignIn}
    >
      {pending ? (
        <Loader2Icon className="animate-spin" aria-hidden="true" />
      ) : (
        <GoogleGIcon className="size-4 shrink-0" />
      )}
      {pending ? "Connecting to Google…" : label}
    </Button>
  );
}

/** Small "or" divider shown between the email form and the social button */
export function SocialDivider() {
  return (
    <div className="flex items-center gap-3" aria-label="Or continue with">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">or</span>
      <Separator className="flex-1" />
    </div>
  );
}
