"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  cleanGalleryImages,
  GalleryImageInput,
} from "@/components/studios/gallery-image-input";
import { handleAuthFailure } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
const STUDIOS_ENDPOINT = "http://localhost:8000/studios";
type Listing = {
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
};
const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
] as const;
type EditForm = {
  title: string;
  category: string;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  location: string;
  images: string[];
  overview: string;
};
function listingGallery(listing: Listing): string[] {
  const fromArray = Array.isArray(listing.images)
    ? listing.images.filter(
        (url): url is string => typeof url === "string" && url.trim() !== ""
      )
    : [];
  if (fromArray.length > 0) return fromArray;
  const legacy = listing.imageUrl?.trim();
  return legacy ? [legacy] : [""];
}
type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; listing: Listing };
function categoryItems(category: string | null) {
  const known = CATEGORIES.map((value) => ({ value, label: value }));
  if (!category || (CATEGORIES as readonly string[]).includes(category)) {
    return known;
  }
  return [{ value: category, label: category }, ...known];
}
export default function EditStudioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, checking } = useRequireAuth();
  const [state, setState] = React.useState<FetchState>({ status: "loading" });
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<EditForm>({
    title: "",
    category: "",
    hourlyRate: "",
    securityDeposit: "",
    maxCapacity: "",
    location: "",
    images: [""],
    overview: "",
  });
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [amenityInput, setAmenityInput] = React.useState("");
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`${STUDIOS_ENDPOINT}/${id}`)
      .then(async (res) => {
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
        const listing = (await result.data) as Listing;
        setForm({
          title: listing.title ?? "",
          category: listing.category ?? "",
          hourlyRate: listing.hourlyRate != null ? String(listing.hourlyRate) : "",
          securityDeposit:
            listing.securityDeposit != null ? String(listing.securityDeposit) : "",
          maxCapacity:
            listing.maxCapacity != null ? String(listing.maxCapacity) : "",
          location: listing.location ?? "",
          images: listingGallery(listing),
          overview: listing.overview ?? "",
        });
        setAmenities(listing.amenities ?? []);
        setState({ status: "ready", listing });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  function setField<K extends keyof EditForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function addAmenity() {
    const value = amenityInput.trim();
    if (!value) return;
    setAmenities((prev) =>
      prev.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value]
    );
    setAmenityInput("");
  }
  function handleAmenityKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAmenity();
    }
  }
  function removeAmenity(amenity: string) {
    setAmenities((prev) => prev.filter((item) => item !== amenity));
  }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (
      !form.title.trim() ||
      !form.category ||
      !form.hourlyRate ||
      !form.location.trim() ||
      !form.overview.trim()
    ) {
      toast.add({
        title: "Missing required fields",
        description:
          "Please fill in the title, category, hourly rate, location, and overview.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    const gallery = cleanGalleryImages(form.images);
    fetch(`${STUDIOS_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: form.title.trim(),
        category: form.category,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : null,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
        location: form.location.trim(),
        images: gallery,
        imageUrl: gallery[0] ?? "",
        amenities,
        overview: form.overview.trim(),
      }),
    })
      .then(async (res) => {
        if (await handleAuthFailure(res, `/studios/edit/${id}`, router)) return;
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          toast.add({
            title: "Update failed",
            description: data?.message ?? "The listing could not be updated.",
            type: "error",
          });
          return;
        }
        toast.add({
          title: "Listing updated",
          description: `"${form.title.trim()}" is now live with the new details.`,
          type: "success",
        });
        router.push("/my-listings");
      })
      .catch(() => {
        toast.add({
          title: "Something went wrong",
          description: "Couldn't reach the server. Please try again.",
          type: "error",
        });
      })
      .finally(() => setSubmitting(false));
  }
  if (checking || !user) {
    return <AuthLoadingScreen />;
  }
  if (state.status === "loading") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-40" />
        <Skeleton className="mb-8 h-8 w-72" />
        <Skeleton className="h-160 w-full rounded-xl" />
      </main>
    );
  }
  if (state.status === "not-found") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <p className="font-medium">This listing doesn&apos;t exist</p>
            <p className="text-sm text-muted-foreground">
              It may have been deleted from the hive.
            </p>
            <Button render={<Link href="/my-listings" />} nativeButton={false}>
              Back to My Listings
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  if (state.status === "error") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <p className="font-medium">Couldn&apos;t load the listing</p>
            <p className="text-sm text-muted-foreground">
              Make sure the backend on localhost:8000 is running, then try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setState({ status: "loading" })}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/my-listings"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to My Listings
      </Link>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Update Studio Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit &quot;{state.listing.title ?? "your studio"}&quot; — changes go
          live on the marketplace as soon as you save.
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Owner details</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-name">Your Name</Label>
            <Input
              id="owner-name"
              value={state.listing.hostName ?? ""}
              readOnly
              disabled
              aria-describedby="owner-name-hint"
            />
            <p id="owner-name-hint" className="sr-only">
              Filled automatically from the listing owner — cannot be changed
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-email">Your Email</Label>
            <Input
              id="owner-email"
              value={state.listing.hostEmail ?? ""}
              readOnly
              disabled
              aria-describedby="owner-email-hint"
            />
            <p id="owner-email-hint" className="sr-only">
              Filled automatically from the listing owner — cannot be changed
            </p>
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="title">
              Studio Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Sunlit Photo Studio in Downtown"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              items={categoryItems(state.listing.category)}
              value={form.category}
              onValueChange={(value) => setField("category", value as string)}
            >
              <SelectTrigger className="w-full" aria-label="Category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryItems(state.listing.category).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hourly-rate">
              Hourly Rate ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hourly-rate"
              name="hourlyRate"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 45"
              value={form.hourlyRate}
              onChange={(e) => setField("hourlyRate", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="security-deposit">Security Deposit ($)</Label>
            <Input
              id="security-deposit"
              name="securityDeposit"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 100"
              value={form.securityDeposit}
              onChange={(e) => setField("securityDeposit", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="max-capacity">Max Capacity</Label>
            <Input
              id="max-capacity"
              name="maxCapacity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10"
              value={form.maxCapacity}
              onChange={(e) => setField("maxCapacity", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">
              Location / Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. 21 Creative Ave, Suite 4, Austin TX"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              required
            />
          </div>
          <GalleryImageInput
            value={form.images}
            onChange={(images) =>
              setForm((prev) => ({ ...prev, images }))
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amenities">Amenities</Label>
          <div className="flex gap-2">
            <Input
              id="amenities"
              placeholder="Type an amenity and press Enter (e.g. Projector)"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={handleAmenityKeyDown}
            />
            <Button type="button" variant="outline" size="icon" onClick={addAmenity} aria-label="Add amenity">
              <PlusIcon />
            </Button>
          </div>
          {amenities.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Amenity tags">
              {amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    aria-label={`Remove ${amenity}`}
                    className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                  >
                    <XIcon className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="overview">
            Detailed Overview <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="overview"
            name="overview"
            placeholder="Describe your studio: layout, lighting, equipment included, house rules…"
            rows={6}
            className="resize-y"
            value={form.overview}
            onChange={(e) => setField("overview", e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            render={<Link href="/my-listings" />}
            nativeButton={false}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && <Loader2Icon className="animate-spin" />}
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}