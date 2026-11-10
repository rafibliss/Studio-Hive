import Link from "next/link";
import {
  CameraIcon,
  ClapperboardIcon,
  MicIcon,
  MusicIcon,
  PaletteIcon,
} from "lucide-react";


const CATEGORIES = [
  {
    label: "Photo Studios",
    description: "Light-ready spaces for shoots and product photography.",
    value: "Photo Studio",
    icon: CameraIcon,
  },
  {
    label: "Film Stages",
    value: "Film Stage",
    description: "Film-grade stages with blackout and grip support.",
    icon: ClapperboardIcon,
  },
  {
    label: "Podcast Rooms",
    value: "Podcast Lounge",
    description: "Acoustically treated rooms tuned for crisp conversation.",
    icon: MicIcon,
  },
  {
    label: "Music Suites",
    value: "Music Suite",
    description: "Rehearsal and recording suites with gear on hand.",
    icon: MusicIcon,
  },
  {
    label: "Art Workshops",
    value: "Workshop",
    description: "Open studio floors for making, crafting and teaching.",
    icon: PaletteIcon,
  },
] as const;

export function StudioCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CATEGORIES.map((category) => (
        <Link
          key={category.value}
          href={`/studios?category=${encodeURIComponent(category.value)}`}
          className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <category.icon className="size-5" />
          </span>
          <span className="font-medium">{category.label}</span>
          <span className="text-sm text-muted-foreground">
            {category.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
