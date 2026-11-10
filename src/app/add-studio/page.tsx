"use client";

import * as React from "react";
import { cn } from "cn";
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { handleAuthFailure } from "@/lib/api";
import {
  cleanGalleryImages,
  GalleryImageInput,
} from "@/components/studios/gallery-image-input";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";

const API_ENDPOINT = "http://localhost:8000/add-studio";

// Session drives the read-only host fields; nothing to mock anymore.
const CATEGORIES = [
  { value: "photo-studio", label: "Photo Studio" },
  { value: "film-stage", label: "Film Stage" },
  { value: "podcast-lounge", label: "Podcast Lounge" },
  { value: "music-suite", label: "Music Suite" },
  { value: "workshop", label: "Workshop" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

type StudioForm = {
  title: string;
  category: Category | null;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  location: string;
  /** Gallery image URLs — first entry is the cover */
  images: string[];
  overview: string;
};

const INITIAL_FORM: StudioForm = {
  title: "",
  category: null,
  hourlyRate: "",
  securityDeposit: "",
  maxCapacity: "",
  location: "",
  images: [""],
  overview: "",
};

const initialAmenities = ["Wi-Fi", "Ring Light", "Green Room"] as const;

export default function AddStudioPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<StudioForm>(INITIAL_FORM);
  const [amenities, setAmenities] = React.useState<string[]>([...initialAmenities]);
  const [amenityInput, setAmenityInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Route protection via Better Auth — private route. `checking` is true
  // only while the session resolves on load/reload; a signed-out visitor
  // is redirected to /login (returning here after authentication).
  const { user, checking } = useRequireAuth();

  // Branded loading screen while the session resolves instead of
  // rendering the form mid-flight
  if (checking || !user) {
    return <AuthLoadingScreen />;
  }

  function setField<K extends keyof StudioForm>(key: K, value: StudioForm[K]) {
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
      event.preventDefault(); // don't submit the form
      addAmenity();
    }
  }

  function removeAmenity(amenity: string) {
    setAmenities((prev) => prev.filter((item) => item !== amenity));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!form.title.trim() || !form.category || !form.hourlyRate || !form.location.trim() || !form.overview.trim()) {
      toast.add({
        title: "Missing required fields",
        description: "Please fill in the title, category, hourly rate, location, and overview.",
        type: "error",
      });
      return;
    }

    // Extra safety net: the session must be present to attribute the listing
    if (!user) {
      toast.add({
        title: "Please log in",
        description: "You need an active session to list a studio.",
        type: "error",
      });
      router.replace("/login?redirect=/add-studio");
      return;
    }

    const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label ?? "";
    const gallery = cleanGalleryImages(form.images);

    const payload = {
      // backend contract: see studio-space-server/index.js POST /add-studio
      // host identity comes straight from the authenticated session
      hostName: user.name,
      hostEmail: user.email,
      title: form.title.trim(),
      category: categoryLabel,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : null,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
      location: form.location.trim(),
      // gallery: multi-image array; imageUrl stays as the cover for card previews
      images: gallery,
      imageUrl: gallery[0] ?? "",
      amenities,
      overview: form.overview.trim(),
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send the HTTPOnly auth cookie
        body: JSON.stringify(payload),
      });
      // 401 → session expired/absent: toast + return to /login
      if (await handleAuthFailure(res, "/add-studio", router)) return;
      // backend returns JSON: { message, insertedId } on success, { message, error } on failure
      const data = (await res.json().catch(() => null)) as
        | { message?: string; insertedId?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.message ?? `Request failed with status ${res.status}`);
      }

      setForm(INITIAL_FORM);
      setAmenities([]);
      toast.add({
        title: data?.message ?? "Studio submitted",
        description: `"${payload.title}" is now live on StudioHive.`,
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Failed to add studio",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Add New Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          List your space on StudioHive and start receiving booking requests.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8",
          "flex flex-col gap-6"
        )}
        noValidate={false}
      >
        {/* Owner (read-only, driven by the active session) */}
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Owner details</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-name">Your Name</Label>
            <Input
              id="owner-name"
              value={user.name}
              readOnly
              disabled
              aria-describedby="owner-name-hint"
            />
            <p id="owner-name-hint" className="sr-only">
              Filled automatically from your StudioHive account
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-email">Your Email</Label>
            <Input
              id="owner-email"
              value={user.email}
              readOnly
              disabled
              aria-describedby="owner-email-hint"
            />
            <p id="owner-email-hint" className="sr-only">
              Filled automatically from your StudioHive account
            </p>
          </div>
        </fieldset>

        {/* Basics */}
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
              items={CATEGORIES}
              value={form.category}
              onValueChange={(value) => setField("category", value as Category)}
            >
              <SelectTrigger className="w-full" aria-label="Category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
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

          {/* Gallery images — dynamic rows, first URL is the cover */}
          <GalleryImageInput
            value={form.images}
            onChange={(images) =>
              setForm((prev) => ({ ...prev, images }))
            }
          />
        </div>

        {/* Amenities (tags) */}
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

        {/* Overview */}
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

        {/* Submit */}
        <div className="flex justify-end border-t border-border pt-6">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && <Loader2Icon className="animate-spin" />}
            {submitting ? "Submitting…" : "Add Studio"}
          </Button>
        </div>
      </form>
    </div>
  );
}
