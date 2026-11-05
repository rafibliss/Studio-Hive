"use client";

import Link from "next/link";
import { cn } from "cn";
import { MapPinIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export type Studio = {
  _id: string;
  title: string;
  category: string | null;
  hourlyRate: number | null;
  securityDeposit: number | null;
  maxCapacity: number | null;
  location: string | null;
  imageUrl: string | null;
  overview: string | null;
  createdAt: string | null;
};

// TODO: read rating/review count from the studio document once the backend tracks them
const RATINGS = [4.9, 4.7, 4.8, 4.6, 5, 4.8] as const;
const RATING_COUNTS = [132, 64, 87, 41, 156, 73] as const;

function ApertureMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-10 text-primary/30"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83m15.79-4-5.74 9.94" />
    </svg>
  );
}

function StudioPlaceholder() {
  return (
    <div className="flex h-44 items-center justify-center bg-linear-to-br from-secondary to-background">
      <ApertureMark />
    </div>
  );
}

/**
 * The canonical studio card used by the Home featured section and the
 * Explore Studios page. Pass `index` so the hardcoded ratings vary per card.
 * NOTE: the CTA uses Base UI's `render={<Link/>} nativeButton={false}`
 * (the equivalent of Radix `asChild`) to avoid nativeButton console warnings.
 */
export function StudioCard({ studio, index }: { studio: Studio; index: number }) {
  const rating = RATINGS[index % RATINGS.length];
  const ratingCount = RATING_COUNTS[index % RATING_COUNTS.length];

  return (
    <Card className="overflow-hidden pt-0 pb-4 transition-shadow hover:shadow-md">
      {/* Image with overlaid title badge */}
      <div className="relative h-44 w-full">
        {studio.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={studio.imageUrl}
            alt={studio.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <StudioPlaceholder />
        )}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] bg-white/90 shadow-sm backdrop-blur-sm"
        >
          <span className="truncate">{studio.title}</span>
        </Badge>
      </div>

      <CardContent className="flex flex-col gap-2 pt-4">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          {studio.category ?? "Studio"}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" />
          <span className="truncate">{studio.location ?? "Location TBA"}</span>
        </p>
        {/* hardcoded star rating */}
        <p className="flex items-center gap-1 text-sm">
          <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({ratingCount.toLocaleString()} reviews)</span>
        </p>
        <p className="mt-1">
          <span className="text-lg font-bold text-foreground">
            ${studio.hourlyRate ?? "—"}
          </span>
          <span className="text-sm text-muted-foreground"> /hour</span>
        </p>
      </CardContent>

      <CardFooter className="px-4">
        {/* Detail pages not built yet — lands on the studios listing for now */}
        <Button variant="outline" size="lg" className="w-full" render={<Link href="/studios" />} nativeButton={false}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

/** The shared responsive grid used on the Home and Explore pages. */
export function StudioGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3")}>
      {children}
    </div>
  );
}

export function StudioGridSkeleton() {
  return (
    <StudioGrid>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </StudioGrid>
  );
}
