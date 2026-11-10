import { createAuthClient } from "better-auth/react"

// NOTE: this client runs in the BROWSER. Next.js only inlines NEXT_PUBLIC_*
// env vars into client bundles — plain process.env vars are undefined there,
// which used to make the client silently fall back to same-origin (:3000)
// and hit the leftover local auth instance instead of the backend.
// Add NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000 to .env.
export const authClient = createAuthClient({
    baseURL:
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
        process.env.BETTER_AUTH_URL || // server-side fallback
        "http://localhost:8000",
});
