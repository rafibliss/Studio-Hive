import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedStudios } from "@/components/home/featured-studios";
import { Banner } from "@/components/home/Banner";

export default function Home() {
  return (
    <>
      {/* Full-bleed hero slider, directly below the sticky navbar */}
      <Banner />

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
    </>
  );
}
