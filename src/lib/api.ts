import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";


export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const isDev = process.env.NODE_ENV !== "production";

const fullTokenLogging = process.env.NEXT_PUBLIC_DEBUG_AUTH === "1";

function describeToken(token: string): string {
  return `"${token.slice(0, 12)}…" (${token.length} chars)`;
}


async function getJwtTokenDirectly(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[auth] direct GET /api/auth/token → ${res.status} ${res.statusText}`,
        body ? body.slice(0, 300) : "(empty body)"
      );
      return null;
    }
    const data = (await res.json().catch(() => null)) as
      | { token?: string }
      | null;
    const token = data?.token ?? null;
    if (token) {
      console.warn(
        "[auth] direct fallback recovered the JWT after authClient.token() failed — the auth client's baseURL is likely cross-origin/misconfigured (check NEXT_PUBLIC_BETTER_AUTH_URL)."
      );
      if (isDev) console.debug(`[auth] fresh JWT obtained (fallback): ${describeToken(token)}`);
    } else {
      console.warn("[auth] direct GET /api/auth/token returned no token:", data);
    }
    return token;
  } catch (thrown) {
    console.error(
      "[auth] direct GET /api/auth/token THREW:",
      thrown,
      thrown instanceof Error ? thrown.stack : undefined
    );
    return null;
  }
}


export async function getJwtToken(): Promise<string | null> {
  const result = await authClient.token().catch((thrown: unknown) => {
    console.error(
      "[auth] authClient.token() THREW:",
      thrown,
      thrown instanceof Error ? thrown.stack : undefined
    );
    return {
      data: null,
      error: { status: 0, message: thrown instanceof Error ? thrown.message : String(thrown) },
    };
  });
  const { data, error } = result;
  if (error) {
    if (error.status === 401) {

      if (isDev) {
        console.debug(
          "[auth] no active session (401 from /token) — request will be sent without an Authorization header"
        );
      }
      return null;
    }

    console.error("[auth] authClient.token() failed unexpectedly:", error);
    return getJwtTokenDirectly();
  }
  const token = data?.token ?? null;
  if (!token) {
    console.warn(
      "[auth] authClient.token() succeeded but returned no token:",
      data
    );
    return getJwtTokenDirectly();
  }
  if (isDev) {
    console.debug(`[auth] fresh JWT obtained: ${describeToken(token)}`);
    if (fullTokenLogging) console.debug("[auth] JWT:", token);
  }
  return token;
}


export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = init.method ?? "GET";
  const token = await getJwtToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    if (isDev) {
      console.debug(
        `[api] ${method} ${url} → Authorization: Bearer ${describeToken(token)}`
      );
    }
  } else {
    if (isDev) {
      console.debug(`[api] ${method} ${url} → no Authorization header attached`);
    }
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
}

export async function handleAuthFailure(
  res: Response,
  redirectPath: string,
  navigate: { push: (url: string) => void }
): Promise<boolean> {
  if (res.status !== 401) return false;
  const detail = (await res
    .clone()
    .json()
    .catch(() => null)) as { message?: string; error?: string } | null;
  console.error(
    `[api] 401 from ${res.url}${detail ? ` — ${detail.message ?? detail.error}` : ""}`
  );
  await authClient.signOut().catch(() => undefined);
  toast.add({
    title: "Session expired",
    description:
      detail?.message || detail?.error || "Please log in again to continue.",
    type: "error",
  });
  navigate.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  return true;
}
