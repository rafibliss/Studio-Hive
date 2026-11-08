import { toast } from "@/components/ui/toast";

/**
 * HTTPOnly cookie-based auth support (Challenge 1).
 *
 * Mutating and user-specific requests send the auth cookie to the backend
 * with `credentials: "include"`. When one of those requests is rejected
 * with `401 Unauthorized` (expired/absent session), this helper surfaces
 * a toast and returns the user to /login — the login page honors the
 * `?redirect=` parameter to bring them back afterwards.
 *
 * Returns `true` when the response was a handled 401; call sites should
 * stop their normal success flow in that case.
 */
export function handleAuthFailure(
  res: Response,
  redirectPath: string,
  navigate: { push: (url: string) => void }
): boolean {
  if (res.status !== 401) return false;

  toast.add({
    title: "Session expired",
    description: "Please log in again to continue.",
    type: "error",
  });
  navigate.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  return true;
}
