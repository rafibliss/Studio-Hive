"use client";
import * as React from "react";
import Link from "next/link";
import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import {
  Studio,
  StudioCard,
  StudioGrid,
  StudioGridSkeleton,
} from "@/components/studios/studio-card";
const STUDIOS_ENDPOINT = `${API_BASE_URL}/studios?limit=6`;
type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; studios: Studio[] };
export function FeaturedStudios() {
  const [state, setState] = React.useState<FetchState>({ status: "loading" });
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    fetch(STUDIOS_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        const studios = Array.isArray(data) ? (data as Studio[]) : [];
        setState({ status: "ready", studios });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  return (
    <div className="flex flex-col gap-8">
      {state.status === "loading" && <StudioGridSkeleton />}
      {state.status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center">
          <p className="font-medium">Couldn&apos;t reach the studio service</p>
          <p className="max-w-md text-sm text-muted-foreground">
            The featured studios could not be loaded. Make sure the backend
            server is running, then try again.
          </p>
          <Button
            variant="outline"
            className="mt-1"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((prev) => prev + 1);
            }}
          >
            <RotateCwIcon />
            Retry
          </Button>
        </div>
      )}
      {state.status === "ready" && state.studios.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center">
          <p className="font-medium">No studios listed yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Be the first host on StudioHive — list your space and it will appear right here.
          </p>
          <Button className="mt-1" render={<Link href="/add-studio" />} nativeButton={false}>
            Add Your Studio
          </Button>
        </div>
      )}
      {state.status === "ready" && state.studios.length > 0 && (
        <StudioGrid>
          {state.studios.map((studio, index) => (
            <StudioCard key={studio._id ?? studio.title} studio={studio} index={index} />
          ))}
        </StudioGrid>
      )}
    </div>
  );
}