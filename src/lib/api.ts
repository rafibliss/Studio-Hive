import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

/** Base URL of the external Express API. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const isDev = process.env.NODE_ENV !== "production";
/** Set NEXT_PUBLIC_DEBUG_AUTH=1 to log the full JWT (dev debugging only). */
const fullTokenLogging = process.env.NEXT_PUBLIC_DEBUG_AUTH === "1";

function describeToken(token: string): string {
  return `"${token.slice(0, 12)}…" (${token.length} chars)`;
}

/**
 * Fallback: fetch the token endpoint directly with a RELATIVE URL (always
 * same-origin, so cookies and CORS can't interfere). Used when
 * `authClient.token()` fails, so a misconfigured client baseURL can't break
 * authenticated API calls — and its status/body reveal the real cause.
 */
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

/**
 * Retrieves a FRESH JWT from Better Auth's jwt() plugin (GET /api/auth/token)
 * on every call — the server signs a new short-lived token each time, so
 * there is no client-side caching. Returns `null` when there is no active
 * session (normal for logged-out visitors on public pages — logged quietly)
 * or the token endpoint fails unexpectedly (logged loudly + direct fallback).
 */
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
      // No active session — expected for logged-out visitors. Keep it quiet
      // so it doesn't spam the Next.js dev overlay as a console error.
      if (isDev) {
        console.debug(
          "[auth] no active session (401 from /token) — request will be sent without an Authorization header"
        );
      }
      return null;
    }
    // Unexpected failure (5xx, network, malformed response) — diagnose loudly
    // and try the direct same-origin fallback.
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

/**
 * fetch wrapper for calls to the external Express API. Always retrieves a
 * fresh JWT first and attaches it as `Authorization: Bearer <token>`; if no
 * token is available the request is still sent (so public endpoints work),
 * but a warning is logged so missing-token bugs are visible.
 */
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
    // getJwtToken() already logged why (usually: no active session).
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
  // Surface the backend's own 401 reason (e.g. invalid JWT vs. expired
  // session) instead of always assuming the session expired.
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
