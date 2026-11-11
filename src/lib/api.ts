import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
export async function handleAuthFailure(
  res: Response,
  redirectPath: string,
  navigate: { push: (url: string) => void }
): Promise<boolean> {
  if (res.status !== 401) return false;
  await authClient.signOut().catch(() => undefined);
  toast.add({
    title: "Session expired",
    description: "Please log in again to continue.",
    type: "error",
  });
  navigate.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  return true;
}