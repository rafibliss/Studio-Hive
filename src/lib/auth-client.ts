import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Auth is served by this Next.js app at `/api/auth/*`, so the client targets
 * the browsing origin by default (works for localhost, 127.0.0.1, a LAN IP,
 * or the production domain alike). Pinning a fixed origin here breaks every
 * auth call with a CORS error whenever the app is browsed from another host.
 *
 * Only set NEXT_PUBLIC_BETTER_AUTH_URL if auth is genuinely served from a
 * different origin than the frontend.
 */
export const authClient = createAuthClient({
  ...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? { baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL }
    : {}),
  // Adds `authClient.token()` / `authClient.jwks()` for JWTs sent to the
  // external Express API.
  plugins: [jwtClient()],
});
