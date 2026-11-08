import { Aperture, Hexagon } from "lucide-react";

/**
 * Branded in-flight screen shown while Better Auth resolves the session
 * on a private route — the hive mark with a slowly spinning aperture.
 */
export function AuthLoadingScreen() {
  return (
    <main
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="relative flex size-10 items-center justify-center">
        <Hexagon
          className="absolute size-10 fill-primary text-primary"
          strokeWidth={1.25}
        />
        <Aperture
          className="relative size-5 animate-spin text-primary-foreground [animation-duration:2.5s]"
          strokeWidth={2.25}
        />
      </span>
      <p className="text-sm text-muted-foreground">Checking your session…</p>
    </main>
  );
}
