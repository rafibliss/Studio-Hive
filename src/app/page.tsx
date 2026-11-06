import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedStudios } from "@/components/home/featured-studios";
import { StudioCategories } from "@/components/home/studio-categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { HostGuarantee } from "@/components/home/host-guarantee";
import { Banner } from "@/components/home/Banner";

export default function Home() {
  return (
    <>
      {/* Full-bleed hero slider, directly below the sticky navbar */}
      <Banner />

      {/* Browse by Studio Categories */}
      <section aria-label="Browse by studio categories">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-col items-start gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Browse by Studio Categories
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Jump straight to what you need — every card opens the studios
              page with that category already filtered for you.
            </p>
          </header>

          <StudioCategories />
        </div>
      </section>

      {/* Section band: light-blue wash + borders visually separate it
          from the banner above and the rest of the page */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-col items-start gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Featured Studios
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Hand-picked creative spaces from across the hive — photo studios,
              film stages, podcast lounges and more, ready to book by the hour.
            </p>
          </header>

          <FeaturedStudios />

          {/* prominent CTA below the grid */}
          <div className="mt-12 flex justify-center">
            <Button size="lg" className="h-11 px-7 text-base" render={<Link href="/studios" />} nativeButton={false}>
              Explore All Studios
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>

      {/* How Booking Works — scroll target for the navbar "How It Works" link.
          Section band: light-blue wash + top border separates it from the
          featured-studios band above. */}
      <section
        id="how-it-works"
        className="scroll-mt-16 border-y border-border bg-secondary/40"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-col items-start gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              How Booking Works
            </h2>
            <p className="max-w-xl text-muted-foreground">
              From first scroll to final cut — four simple steps between
              finding a space and rolling camera.
            </p>
          </header>

          <HowItWorks />
        </div>
      </section>

      {/* Host Guarantee & Creator Support — plain background below the
          tinted band, whose bottom border separates the two sections */}
      <section aria-label="Host guarantee and creator support">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-col items-start gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Host Guarantee &amp; Creator Support
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Book with confidence — every reservation on StudioHive is
              backed by platform protections from both sides of the deal.
            </p>
          </header>

          <HostGuarantee />
        </div>
      </section>
    </>
  );
}
