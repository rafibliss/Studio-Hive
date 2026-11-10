import { Aperture, Hexagon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioGrid } from "@/components/studios/studio-card";

/**
 * Branded route-transition fallback — the hive mark with a slowly spinning
 * aperture above a layout-matching skeleton grid. Rendered by `loading.tsx`
 * files while Next.js streams the next route so navigation never feels dead.
 */
export function RouteLoadingScreen() {
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Brand mark */}
      <div className="mb-10 flex justify-center">
        <span className="relative flex size-12 items-center justify-center">
          <Hexagon
            className="absolute size-12 fill-primary text-primary"
            strokeWidth={1.25}
          />
          <Aperture
            className="relative size-6 animate-spin text-primary-foreground [animation-duration:2.5s]"
            strokeWidth={2.25}
          />
        </span>
      </div>

      {/* Layout-matching skeleton (mirrors the marketplace page grid) */}
      <Skeleton className="mx-auto mb-3 h-8 w-64" />
      <Skeleton className="mx-auto mb-10 h-4 w-96 max-w-full" />
      <StudioGrid>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-96 w-full rounded-xl" key={index} />
        ))}
      </StudioGrid>
    </main>
  );
}
