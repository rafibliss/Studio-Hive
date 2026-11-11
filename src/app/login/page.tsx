"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  GoogleAuthButton,
  SocialDivider,
} from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (signInError) {
        const message =
          signInError.message ||
          "Login failed. Please check your credentials and try again.";
        setError(message);
        toast.add({
          title: "Login failed",
          description: message,
          type: "error",
        });
        return;
      }
      const redirect =
        new URLSearchParams(window.location.search).get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch {
      const message =
        "Couldn't reach the authentication service. Please try again in a moment.";
      setError(message);
      toast.add({
        title: "Something went wrong",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="flex items-center justify-center px-4 py-12 sm:py-16">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Log in to book studios, manage listings and track your sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <TriangleAlertIcon className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 w-full text-sm"
            >
              {submitting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Logging in…
                </>
              ) : (
                "Log in"
              )}
            </Button>
            <SocialDivider />
            <GoogleAuthButton label="Continue with Google" />
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}