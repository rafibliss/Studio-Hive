"use client";
import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchIcon, RotateCwIcon, SlidersHorizontalIcon } from "lucide-react";
import { cn } from "cn";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Studio,
  StudioCard,
  StudioGrid,
  StudioGridSkeleton,
} from "@/components/studios/studio-card";
const STUDIOS_ENDPOINT = `${API_BASE_URL}/studios`;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];
const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
] as const;
type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; studios: Studio[] };
const INITIAL_FILTERS = {
  search: "",
  category: "All" as string,
  sort: "newest" as SortOption,
};
function matchesSearch(studio: Studio, query: string) {
  const haystack = [studio.title, studio.location, studio.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}
function sortStudios(studios: Studio[], sort: SortOption) {
  const byDate = (studio: Studio) =>
    studio.createdAt ? Date.parse(studio.createdAt) : 0;
  const byRate = (studio: Studio) =>
    studio.hourlyRate ?? Number.POSITIVE_INFINITY;
  const sorted = [...studios];
  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => byDate(a) - byDate(b));
      break;
    case "price-asc":
      sorted.sort((a, b) => byRate(a) - byRate(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => byRate(b) - byRate(a));
      break;
    default:
      sorted.sort((a, b) => byDate(b) - byDate(a));
  }
  return sorted;
}
function categoryFromParam(param: string | null) {
  return param && (CATEGORIES as readonly string[]).includes(param)
    ? param
    : "All";
}
export default function ExploreStudiosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <StudioGridSkeleton />
        </div>
      }
    >
      <ExploreStudiosContent />
    </Suspense>
  );
}
function ExploreStudiosContent() {
  const searchParams = useSearchParams();
  const [state, setState] = React.useState<FetchState>({ status: "loading" });
  const [attempt, setAttempt] = React.useState(0);
  const [filters, setFilters] = React.useState(() => ({
    ...INITIAL_FILTERS,
    category: categoryFromParam(searchParams.get("category")),
  }));
  React.useEffect(() => {
    let cancelled = false;
    apiFetch(STUDIOS_ENDPOINT)
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
  const visibleStudios =
    state.status === "ready"
      ? sortStudios(
          state.studios.filter(
            (studio) =>
              (filters.category === "All" || studio.category === filters.category) &&
              (filters.search === "" || matchesSearch(studio, filters.search))
          ),
          filters.sort
        )
      : [];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col items-start gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Explore All Studios</h1>
        <p className="max-w-xl text-muted-foreground">
          Browse every creative space on the StudioHive marketplace — filter by
          category, search by name or city, and sort to find your perfect fit.
        </p>
      </header>
      <section
        aria-label="Studio filters"
        className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-end"
      >
        <div className="flex flex-col gap-1.5 md:max-w-xs md:flex-1">
          <Label htmlFor="studio-search" className="sr-only">
            Search studios
          </Label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="studio-search"
              placeholder="Search by title, location, or city…"
              className="pl-8"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </div>
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap items-center gap-1"
        >
          {(["All", ...CATEGORIES]).map((category) => {
            const active = filters.category === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters((prev) => ({ ...prev, category }))}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-1.5 md:ml-auto md:w-56">
          <Label htmlFor="studio-sort" className="sr-only">
            Sort studios
          </Label>
          <Select
            items={SORT_OPTIONS}
            value={filters.sort}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sort: value as SortOption }))
            }
          >
            <SelectTrigger id="studio-sort" className="w-full" aria-label="Sort studios">
              <SlidersHorizontalIcon className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
      {state.status === "loading" && <StudioGridSkeleton />}
      {state.status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center">
          <p className="font-medium">Couldn&apos;t reach the studio service</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Studios could not be loaded. Make sure the backend server is
            running, then try again.
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
      {state.status === "ready" && visibleStudios.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center">
          <p className="font-medium">
            {state.studios.length === 0
              ? "No studios listed yet"
              : "No studios found matching your filters"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {state.studios.length === 0
              ? "Be the first host on StudioHive — list your space and it will appear here."
              : "Try a different search term or category, or clear everything and start fresh."}
          </p>
          {state.studios.length === 0 ? (
            <Button className="mt-1" render={<Link href="/add-studio" />} nativeButton={false}>
              Add Your Studio
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-1"
              onClick={() => setFilters(INITIAL_FILTERS)}
            >
              Reset filters
            </Button>
          )}
        </div>
      )}
      {state.status === "ready" && visibleStudios.length > 0 && (
        <StudioGrid>
          {visibleStudios.map((studio, index) => (
            <StudioCard key={studio._id ?? studio.title} studio={studio} index={index} />
          ))}
        </StudioGrid>
      )}
    </div>
  );
}