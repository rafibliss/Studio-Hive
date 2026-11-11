"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleCheckIcon,
  CircleXIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
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
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
] as const;
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const ruleStates = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const passwordValid = ruleStates.every((rule) => rule.passed);
  const showChecklist = password.length > 0;
  function reportError(message: string) {
    setError(message);
    toast.add({
      title: "Registration failed",
      description: message,
      type: "error",
    });
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!passwordValid) {
      reportError("Password doesn't meet the requirements below.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(photoUrl.trim() ? { image: photoUrl.trim() } : {}),
      });
      if (signUpError) {
        reportError(
          signUpError.message ||
          "Registration failed. Please check your details and try again."
        );
        return;
      }
      toast.add({
        title: "Account created",
        description: "Welcome to the hive! Log in with your new credentials.",
        type: "success",
      });
      router.push("/");
    } catch {
      reportError(
        "Couldn't reach the authentication service. Please try again in a moment."
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="flex items-center justify-center px-4 py-12 sm:py-16">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription>
            Join the hive — book creative spaces or list your own studio.
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>
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
              <Label htmlFor="photoUrl">
                Photo URL
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="photoUrl"
                name="photoUrl"
                type="text"
                autoComplete="url"
                placeholder="https://example.com/avatar.png"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={showChecklist && !passwordValid ? true : undefined}
              />
              {showChecklist && (
                <ul
                  className="mt-1 flex flex-col gap-1 pl-0.5"
                  aria-label="Password requirements"
                >
                  {ruleStates.map((rule) => (
                    <li
                      key={rule.label}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {rule.passed ? (
                        <CircleCheckIcon
                          className="size-3.5 shrink-0 text-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <CircleXIcon
                          className="size-3.5 shrink-0 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={
                          rule.passed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {rule.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 w-full text-sm"
            >
              {submitting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Register"
              )}
            </Button>
            <SocialDivider />
            <GoogleAuthButton label="Sign up with Google" />
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}