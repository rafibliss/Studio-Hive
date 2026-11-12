"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import {
  ArrowLeftIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
  BadgeCheckIcon,
  MailIcon,
  ImageIcon,
  StarCheckIcon,
  Loader2Icon,
  WifiIcon,
  Volume2Icon,
  CameraIcon,
  LightbulbIcon,
  SofaIcon,
  MonitorIcon,
  SpeakerIcon,
  PauseIcon,
  PresentationIcon,
  CoffeeIcon,
  DoorOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { API_BASE_URL, apiFetch, handleAuthFailure } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const STUDIOS_API = `${API_BASE_URL}/studios`;
type StudioDetail = {
  _id: string;
  title: string | null;
  category: string | null;
  hourlyRate: number | null;
  securityDeposit: number | null;
  maxCapacity: number | null;
  location: string | null;
  imageUrl: string | null;
  images?: string[] | null;
  amenities: string[] | null;
  overview: string | null;
  hostName: string | null;
  hostEmail: string | null;
  createdAt: string | null;
};
type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; studio: StudioDetail };
const RATINGS = [4.9, 4.7, 4.8, 4.6, 5, 4.8] as const;
const RATING_COUNTS = [132, 64, 87, 41, 156, 73] as const;
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Wi-Fi": WifiIcon,
  "Soundproofing": Volume2Icon,
  "4K Cameras": CameraIcon,
  "Lighting Grid": LightbulbIcon,
  "Green Room": SofaIcon,
  "Broadcast Mics": SpeakerIcon,
  "Multi-Cam Setup": MonitorIcon,
  "Seamless Backdrops": PauseIcon,
  "Natural Light": ImageIcon,
  "Whiteboard": PresentationIcon,
  "Coffee Bar": CoffeeIcon,
  "Private Entrance": DoorOpenIcon,
};
function AmenityIcon({ amenity }: { amenity: string }) {
  const Icon =
    AMENITY_ICONS[amenity] ?? AMENITY_ICONS["Lighting Grid"];
  return <Icon className="size-3.5" />;
}
function resolveGallery(studio: StudioDetail): string[] {
  const fromArray = Array.isArray(studio.images)
    ? studio.images.filter(
      (url): url is string => typeof url === "string" && url.trim() !== ""
    )
    : [];
  if (fromArray.length > 0) return fromArray;
  const legacy = studio.imageUrl?.trim();
  return legacy ? [legacy] : [];
}
function StudioGallery({ images, title }: { images: string[]; title: string | null }) {
  return (
    <Swiper
      modules={[A11y, Keyboard, Navigation, Pagination]}
      loop={images.length > 1}
      pagination={{ clickable: true }}
      navigation={images.length > 1}
      keyboard={{ enabled: true }}
      aria-label="Studio gallery"
      className="detail-gallery h-72 w-full overflow-hidden rounded-xl border border-border bg-secondary/40 sm:h-96 lg:h-104"
    >
      {images.length > 0 ? (
        images.map((src, index) => (
          <SwiperSlide key={`${index}-${src}`} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title ?? "Studio"} photo ${index + 1} of ${images.length}`}
              className="absolute inset-0 size-full object-cover"
            />
          </SwiperSlide>
        ))
      ) : (
        <SwiperSlide className="relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon aria-hidden="true" />
            <p className="text-sm">No photos uploaded yet</p>
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  );
}
function BookingDialog({ studio }: { studio: StudioDetail }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [booked, setBooked] = React.useState(false);
  const hours =
    start && end && end > start
      ? Math.round(
        ((Date.parse(`2000-01-01T${end}`) - Date.parse(`2000-01-01T${start}`)) /
          3600000 +
          Number.EPSILON) *
        100
      ) / 100
      : null;
  const total = studio.hourlyRate != null && hours != null ? studio.hourlyRate * hours : null;
  function handleReserve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !start || !end) {
      toast.add({
        title: "Missing details",
        description: "Please pick a date and both start and end times.",
        type: "error",
      });
      return;
    }
    if (end <= start) {
      toast.add({
        title: "Invalid time range",
        description: "The end time must be after the start time.",
        type: "error",
      });
      return;
    }
    if (!user) {
      toast.add({
        title: "Please log in",
        description: "You need an account to reserve a studio.",
        type: "error",
      });
      setOpen(false);
      router.push(`/login?redirect=/studios/${studio._id}`);
      return;
    }
    setBooked(true);
    apiFetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        studioId: studio._id,
        studioTitle: studio.title,
        studioImage: studio.imageUrl ?? resolveGallery(studio)[0] ?? null,
        location: studio.location,
        hourlyRate: studio.hourlyRate,
        userName: user.name,
        userEmail: user.email,
        bookingDate: date,
        timeSlot: `${start} – ${end}`,
      }),
    })
      .then(async (res) => {
        if (await handleAuthFailure(res, `/studios/${studio._id}`, router)) return;
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          toast.add({
            title: "Booking failed",
            description: data?.message ?? "The reservation could not be saved.",
            type: "error",
          });
          return;
        }
        toast.add({
          title: "Booking confirmed!",
          description: `${studio.title ?? "This studio"} · ${date} · ${start} – ${end}. Track it under My Bookings.`,
          type: "success",
        });
        setDate("");
        setStart("");
        setEnd("");
        setOpen(false);
      })
      .catch(() => {
        toast.add({
          title: "Something went wrong",
          description:
            "Couldn't reach the booking service. Please try again in a moment.",
          type: "error",
        });
      })
      .finally(() => setBooked(false));
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="lg"
        className="h-11 w-full text-base"
        disabled={sessionPending}
        onClick={() => {
          if (!user) {
            toast.add({
              title: "Please log in",
              description: "You need an account to reserve a studio.",
              type: "error",
            });
            router.push(`/login?redirect=/studios/${studio._id}`);
            return;
          }
          setOpen(true);
        }}
      >
        Book Workspace Now
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve {studio.title}</DialogTitle>
          <DialogDescription>
            Pick your shoot window. The host confirms within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleReserve} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="book-date">Date</Label>
            <Input
              id="book-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-start">Start time</Label>
              <Input
                id="book-start"
                type="time"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-end">End time</Label>
              <Input
                id="book-end"
                type="time"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {hours != null ? `${hours} hour${hours === 1 ? "" : "s"}` : "Select a time range"}
              </span>
              <span className="font-medium">
                {total != null ? `$${total.toFixed(2)}` : `$${studio.hourlyRate ?? "—"}/hour`}
              </span>
            </div>
            {studio.securityDeposit != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Plus a ${studio.securityDeposit} refundable security deposit.
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={booked}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={booked} className="w-full sm:w-auto">
              {booked ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Reserving…
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function StudioDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <Skeleton className="h-72 w-full rounded-xl sm:h-96 lg:h-104" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
export default function StudioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = React.useState<FetchState>({ status: "loading" });
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    apiFetch(`${STUDIOS_API}/${id}`)
      .then((res) => {
        if (res.status === 404) return { ok: false, notFound: true, data: null };
        if (!res.ok) return { ok: false, notFound: false, data: null };
        return { ok: true, notFound: false, data: res.json() };
      })
      .then(async (result) => {
        if (cancelled) return;
        if (!result.ok) {
          setState(result.notFound ? { status: "not-found" } : { status: "error" });
          return;
        }
        const studio = (await result.data) as StudioDetail;
        setState({ status: "ready", studio });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (state.status === "loading") {
    return <StudioDetailSkeleton />;
  }
  if (state.status === "not-found") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader className="items-center">
            <CardDescription className="text-lg font-medium text-foreground">
              This studio doesn&apos;t exist
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              The listing you&apos;re looking for was removed or never
              existed. Browse the marketplace for creative spaces like it.
            </p>
            <Button
              render={<Link href="/studios" />}
              nativeButton={false}
              className="w-full"
            >
              Explore All Studios
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  if (state.status === "error") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader className="items-center">
            <CardDescription className="text-lg font-medium text-foreground">
              Couldn&apos;t load this studio
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Make sure the backend server is running, then reload
              the page.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  const { studio } = state;
  const hostInitials = (studio.hostName ?? "San")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/studios"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to studios
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-10">
          <StudioGallery images={resolveGallery(studio)} title={studio.title} />
          <section aria-label="Workspace specifications" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{studio.category ?? "Studio"}</Badge>
              {studio.maxCapacity != null && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UsersIcon className="size-3.5" />
                  Up to {studio.maxCapacity} people
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {studio.title ?? "Untitled Studio"}
            </h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4 shrink-0" />
              <span>{studio.location ?? "Location TBA"}</span>
            </p>
            <p className="flex items-center gap-1 text-sm">
              <StarIcon className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{RATINGS[studio._id.length % RATINGS.length].toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({RATING_COUNTS[studio._id.length % RATING_COUNTS.length].toLocaleString()} reviews)
              </span>
            </p>
            <Separator className="my-2" />
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {studio.overview || "No description added yet."}
            </p>
          </section>
          <section aria-label="Amenities" className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Amenities</h2>
            {studio.amenities && studio.amenities.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {studio.amenities.map((amenity) => (
                  <li key={amenity}>
                    <Badge
                      variant="secondary"
                      className="gap-1.5 bg-secondary/60 py-1.5 pl-2.5 pr-3 text-foreground"
                    >
                      <AmenityIcon amenity={amenity} />
                      {amenity}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ImageIcon />
                  </EmptyMedia>
                  <EmptyTitle>No amenities listed</EmptyTitle>
                  <EmptyDescription>
                    Ask the host about the gear and features available in this
                    space before booking.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </section>
          <section aria-label="Host details" className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Your Host</h2>
            <Card className="gap-4 p-4 sm:flex-row sm:items-center">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {hostInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  {studio.hostName ?? "StudioHive Host"}
                  <BadgeCheckIcon className="size-4 shrink-0 text-primary" aria-label="Verified host" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {studio.hostEmail ?? "hosts@studiohive.com"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Typically responds within 24 hours
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full shrink-0 sm:w-auto"
                render={
                  <a href={`mailto:${studio.hostEmail ?? "hosts@studiohive.com"}`} />
                }
                nativeButton={false}
              >
                <MailIcon />
                Contact
              </Button>
            </Card>
          </section>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-baseline gap-1.5 text-xl">
                <span className="text-2xl font-bold">
                  ${studio.hourlyRate ?? "—"}
                </span>
                <span className="text-sm font-normal text-muted-foreground">/ hour</span>
              </CardTitle>
              {studio.hourlyRate != null && (
                <CardDescription>
                  ≈ ${studio.hourlyRate * 8} for a full 8-hour shoot day
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
                  Flexible hourly slots
                </li>
                {studio.maxCapacity != null && (
                  <li className="flex items-center gap-2">
                    <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
                    Max {studio.maxCapacity} guests
                  </li>
                )}
                {studio.securityDeposit != null && (
                  <li className="flex items-center gap-2">
                    <BadgeCheckIcon className="size-4 shrink-0 text-muted-foreground" />
                    ${studio.securityDeposit} refundable deposit
                  </li>
                )}
              </ul>
              <BookingDialog studio={studio} />
            </CardContent>
          </Card>
        </aside>
      </div>
      <section aria-label="Reviews" className="mt-12 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Reviews ({RATING_COUNTS[studio._id.length % RATING_COUNTS.length]})
        </h2>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StarCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No written reviews yet</EmptyTitle>
            <EmptyDescription>
              This studio is new to the hive. Sessions booked today will be
              able to leave the first review.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    </main>
  );
}