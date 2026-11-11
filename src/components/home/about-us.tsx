import Link from "next/link";
import {
  Building2Icon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
const STATS = [
  { value: "250+", label: "Studios listed", icon: Building2Icon },
  { value: "12k", label: "Creators booked", icon: UsersIcon },
  { value: "30+", label: "Cities covered", icon: MapPinIcon },
  { value: "4.9", label: "Average rating", icon: StarIcon },
] as const;
export function AboutUs() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">
          StudioHive started with a simple frustration: great creative work
          kept waiting on spaces. Shoot days got pushed because the right
          studio was impossible to find, and beautiful spaces sat empty
          because the creators who needed them never knew they existed.
        </p>
        <p className="text-muted-foreground">
          So we built the hive — a single marketplace where photographers,
          podcasters, filmmakers, musicians and makers can discover,
          compare, and instantly book real creative spaces from verified
          hosts. For hosts, we make listing effortless and handle the
          trust side of things: liability protection, verified profiles,
          and support that never sleeps.
        </p>
        <p className="text-muted-foreground">
          Today, StudioHive connects thousands of creators with studio
          owners across the country — so the next big idea never has to
          wait for a room to happen.
        </p>
        <div className="mt-2">
          <Button
            variant="outline"
            className="h-11 px-7 text-base"
            render={<Link href="/studios" />}
            nativeButton={false}
          >
            Meet the Studios
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 self-start">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <stat.icon
              className="size-5 text-primary"
              aria-hidden="true"
            />
            <dd className="text-2xl font-bold tracking-tight">{stat.value}</dd>
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}