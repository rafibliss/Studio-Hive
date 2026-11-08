"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2Icon,
  CalendarIcon,
  ClockIcon,
  ImageIcon,
  MapPinIcon,
  RotateCwIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StudioGrid } from "@/components/studios/studio-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

const BOOKINGS_ENDPOINT = "http://localhost:8000/bookings";

type Booking = {
  _id: string;
  studioId: string | null;
  studioTitle: string | null;
  studioImage: string | null;
  location: string | null;
  hourlyRate: number | null;
  bookingDate: string | null;
  timeSlot: string | null;
  status: string | null;
  userEmail: string | null;
};

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; bookings: Booking[] };

// Distinct badge styling per booking status
const STATUS_STYLES: Record<string, string> = {
  Pending: "border-amber-500/40 bg-amber-500/15 text-amber-700",
  Confirmed: "border-primary/40 bg-primary/10 text-primary",
  Completed: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700",
  Cancelled: "border-border bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: string | null }) {
  const label = status ?? "Pending";
  return (
    <Badge
      variant="secondary"
      className={`bg-white/90 uppercase tracking-wide shadow-sm backdrop-blur-sm ${STATUS_STYLES[label] ?? STATUS_STYLES.Pending}`}
    >
      {label}
    </Badge>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();

  // Live better-auth session — this is a private route
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user ?? null;

  const [state, setState] = React.useState<FetchState>({ status: "loading" });
  const [cancelling, setCancelling] = React.useState<string | null>(null);

  // Route protection: signed-out visitors are sent to /login with a
  // redirect back here; wait for the session to resolve first
  React.useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace("/login?redirect=/my-bookings");
    }
  }, [sessionLoading, user, router]);

  // Fetch the signed-in user's bookings
  React.useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;

    fetch(`${BOOKINGS_ENDPOINT}?email=${encodeURIComponent(user.email)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<Booking[]>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: "ready",
          bookings: Array.isArray(data) ? data : [],
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  /** DELETE /bookings/:id — cancels a pending reservation */
  function cancelBooking(booking: Booking) {
    setCancelling(booking._id);

    fetch(`${BOOKINGS_ENDPOINT}/${booking._id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          toast.add({
            title: "Cancel failed",
            description: data?.message ?? "The booking could not be cancelled.",
            type: "error",
          });
          return;
        }
        // Update the local UI state — drop the cancelled booking
        setState((prev) =>
          prev.status === "ready"
            ? {
              status: "ready",
              bookings: prev.bookings.filter((item) => item._id !== booking._id),
            }
            : prev
        );
        toast.add({
          title: "Booking cancelled",
          description: `Your ${booking.bookingDate} slot at "${booking.studioTitle ?? "the studio"}" was released.`,
          type: "success",
        });
      })
      .catch(() => {
        toast.add({
          title: "Something went wrong",
          description: "Couldn't reach the server. Please try again.",
          type: "error",
        });
      })
      .finally(() => setCancelling(null));
  }

  // Skeleton while the session resolves (or redirect is in flight)
  if (sessionLoading || !user || state.status === "loading") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-8 w-56" />
        <Skeleton className="mb-10 h-4 w-96 max-w-full" />
        <StudioGrid>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-88 w-full rounded-xl" key={index} />
          ))}
        </StudioGrid>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <p className="font-medium">Couldn&apos;t load your bookings</p>
            <p className="text-sm text-muted-foreground">
              Make sure the backend on localhost:8000 is running, then try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setState({ status: "loading" })}
              className="mt-1"
            >
              <RotateCwIcon />
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const bookings = state.status === "ready" ? state.bookings : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="max-w-xl text-muted-foreground">
          Your reserved studio sessions — pending reservations can be
          cancelled any time before the host confirms.
        </p>
      </header>

      {bookings.length === 0 ? (
        <Empty className="rounded-xl border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarIcon />
            </EmptyMedia>
            <EmptyTitle className="text-base">No bookings yet</EmptyTitle>
            <EmptyDescription>
              Browse the marketplace and reserve a studio — your sessions will
              show up here.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/studios" />} nativeButton={false}>
            <Building2Icon />
            Explore Studios
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden pt-0 pb-4">
              {/* Studio image with status badge overlay */}
              <div className="relative h-40 w-full">
                {booking.studioImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={booking.studioImage}
                    alt={booking.studioTitle ?? "Studio photo"}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-linear-to-br from-secondary to-background text-muted-foreground">
                    <ImageIcon className="size-8" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <StatusBadge status={booking.status} />
                </div>
              </div>

              <CardContent className="flex flex-col gap-2 pt-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  {booking.studioTitle ?? "Studio session"}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {booking.location ?? "Location TBA"}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-sm">
                  <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{booking.bookingDate}</span>
                </p>
                <p className="flex items-center gap-1.5 text-sm">
                  <ClockIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>{booking.timeSlot ?? "TBA"}</span>
                </p>
                <p className="mt-1">
                  <span className="text-lg font-bold">
                    ${booking.hourlyRate ?? "—"}
                  </span>
                  <span className="text-sm text-muted-foreground"> /hour</span>
                </p>
              </CardContent>

              {/* Cancel only applies to still-pending reservations */}
              {booking.status === "Pending" && (
                <CardFooter className="px-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => cancelBooking(booking)}
                    disabled={cancelling != null}
                  >
                    <XCircleIcon />
                    {cancelling === booking._id ? "Cancelling…" : "Cancel Booking"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
