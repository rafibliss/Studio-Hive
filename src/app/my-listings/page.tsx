"use client";

import * as React from "react";
import Link from "next/link";
import {
    Building2Icon,
    ImageIcon,
    MapPinIcon,
    SquarePenIcon,
    Trash2Icon,
    RotateCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioGrid } from "@/components/studios/studio-card";
import { toast } from "@/components/ui/toast";
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
    overview: string | null;
    hostName: string | null;
    hostEmail: string | null;
};

type FetchState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; listings: Listing[] };

function ListingPlaceholder() {
    return (
        <div className="flex h-44 items-center justify-center bg-linear-to-br from-secondary to-background text-muted-foreground">
            <ImageIcon className="size-8" aria-hidden="true" />
        </div>
    );
}

export default function MyListingsPage() {
    // Route protection via Better Auth — private route. `checking` is true
    // only while the session resolves on load/reload; a signed-out visitor
    // is redirected to /login (returning here after authentication).
    const { user, checking } = useRequireAuth();

    const [state, setState] = React.useState<FetchState>({ status: "loading" });
    const [busy, setBusy] = React.useState(false);

    // Modals
    const [listingToDelete, setListingToDelete] = React.useState<Listing | null>(null);

    React.useEffect(() => {
        if (!user?.email) return;
        let cancelled = false;

        fetch(`${STUDIOS_ENDPOINT}?email=${encodeURIComponent(user.email)}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json() as Promise<Listing[]>;
            })
            .then((data) => {
                if (cancelled) return;
                setState({ status: "ready", listings: Array.isArray(data) ? data : [] });
            })
            .catch(() => {
                if (!cancelled) setState({ status: "error" });
            });

        return () => {
            cancelled = true;
        };
    }, [user?.email]);

    /** DELETE /studios/:id — removes the document from MongoDB */
    function confirmDelete() {
        if (!listingToDelete) return;
        setBusy(true);

        fetch(`${STUDIOS_ENDPOINT}/${listingToDelete._id}`, { method: "DELETE" })
            .then(async (res) => {
                if (!res.ok) {
                    const data = (await res.json().catch(() => null)) as
                        | { message?: string }
                        | null;
                    toast.add({
                        title: "Delete failed",
                        description: data?.message ?? "The listing could not be deleted.",
                        type: "error",
                    });
                    return;
                }
                setState((prev) =>
                    prev.status === "ready"
                        ? {
                            status: "ready",
                            listings: prev.listings.filter(
                                (item) => item._id !== listingToDelete._id
                            ),
                        }
                        : prev
                );
                toast.add({
                    title: "Listing deleted",
                    description: `"${listingToDelete.title ?? "Studio"}" has been removed from the hive.`,
                    type: "success",
                });
                setListingToDelete(null);
            })
            .catch(() => {
                toast.add({
                    title: "Something went wrong",
                    description: "Couldn't reach the server. Please try again.",
                    type: "error",
                });
            })
            .finally(() => setBusy(false));
    }

    // Branded loading screen while the session resolves (or the redirect
    // for signed-out visitors is in flight) — never a flash of content
    if (checking || !user) {
        return <AuthLoadingScreen />;
    }

    // Skeleton while the page's own data loads
    if (state.status === "loading") {
        return (
            <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <Skeleton className="mb-2 h-8 w-64" />
                <Skeleton className="mb-10 h-4 w-96 max-w-full" />
                <StudioGrid>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton className="h-96 w-full rounded-xl" key={index} />
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
                        <p className="font-medium">Couldn&apos;t load your listings</p>
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

    const { listings: readyListings } = state;

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">My Studio Listings</h1>
                    <p className="max-w-xl text-muted-foreground">
                        Manage, update, or remove the creative spaces you listed on the
                        hive.
                    </p>
                </header>
                <Button render={<Link href="/add-studio" />} nativeButton={false}>
                    <Building2Icon />
                    Add New Studio
                </Button>
            </div>

            {readyListings.length === 0 ? (
                <Empty className="rounded-xl border bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2Icon />
                        </EmptyMedia>
                        <EmptyTitle className="text-base">You haven&apos;t listed any studios yet</EmptyTitle>
                        <EmptyDescription>
                            List your first creative space and it will show up here, ready to
                            manage and edit.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button render={<Link href="/add-studio" />} nativeButton={false}>
                        <Building2Icon />
                        Add Your First Studio
                    </Button>
                </Empty>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {readyListings.map((listing) => (
                        <ManageCard
                            key={listing._id}
                            listing={listing}
                            onDelete={() => setListingToDelete(listing)}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirmation modal */}
            <Dialog
                open={listingToDelete != null}
                onOpenChange={(open) => {
                    if (!open) setListingToDelete(null);
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete this listing?</DialogTitle>
                        <DialogDescription>
                            &quot;{listingToDelete?.title ?? "This studio"}&quot; will be
                            permanently removed from MongoDB. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setListingToDelete(null)}
                            disabled={busy}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={busy}
                            className="w-full sm:w-auto"
                        >
                            <Trash2Icon />
                            {busy ? "Deleting…" : "Yes, delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

function ManageCard({
    listing,
    onDelete,
}: {
    listing: Listing;
    onDelete: () => void;
}) {
    return (
        <Card className="overflow-hidden pt-0 pb-4">
            {/* Image, themed placeholder when no photo was uploaded */}
            <div className="relative h-44 w-full">
                {listing.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.imageUrl}
                        alt={listing.title ?? "Studio photo"}
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <ListingPlaceholder />
                )}
                <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] bg-white/90 shadow-sm backdrop-blur-sm"
                >
                    <span className="truncate">{listing.category ?? "Studio"}</span>
                </Badge>
            </div>

            <CardContent className="flex flex-col gap-2 pt-4">
                <h3 className="text-lg font-semibold tracking-tight">
                    {listing.title ?? "Untitled Studio"}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPinIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{listing.location ?? "Location TBA"}</span>
                </p>
                <p className="mt-1">
                    <span className="text-lg font-bold">
                        ${listing.hourlyRate ?? "—"}
                    </span>
                    <span className="text-sm text-muted-foreground"> /hour</span>
                </p>
            </CardContent>

            <CardFooter className="flex gap-2 px-4">
                {/* "Update" navigates to the dedicated edit route */}
                <Button
                    variant="outline"
                    className="flex-1"
                    render={<Link href={`/studios/edit/${listing._id}`} />}
                    nativeButton={false}
                >
                    <SquarePenIcon />
                    Update
                </Button>
                <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={onDelete}
                >
                    <Trash2Icon />
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
