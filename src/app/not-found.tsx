import Link from "next/link";
import { HomeIcon, ClapperboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Creative 404 — a film-set scene where a vintage movie camera spells
 * "404": the two film reels read "4", and the lens is the zero. The
 * spotlight beams sweep the empty stage where the missing page would be.
 */
function StudioSceneIllustration() {
  return (
    <svg
      viewBox="0 0 360 220"
      role="img"
      aria-label="Illustration of a film studio stage with a movie camera spelling 404"
      className="mx-auto w-full max-w-md"
    >
      {/* Crossed spotlight beams sweeping the empty stage */}
      <polygon points="30,0 105,0 200,150 80,150" className="fill-primary/10" />
      <polygon points="255,0 330,0 280,150 160,150" className="fill-primary/10" />

      {/* Hanging set lights */}
      <g className="stroke-foreground/70" strokeLinecap="round">
        <line x1="60" y1="8" x2="60" y2="26" strokeWidth="2" />
        <line x1="300" y1="8" x2="300" y2="26" strokeWidth="2" />
        <circle cx="60" cy="32" r="7" className="fill-primary" strokeWidth="2" />
        <circle cx="300" cy="32" r="7" className="fill-primary" strokeWidth="2" />
      </g>

      {/* Backdrop wall + stage floor */}
      <rect
        x="20"
        y="44"
        width="320"
        height="132"
        rx="14"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <line
        x1="34"
        y1="150"
        x2="326"
        y2="150"
        className="stroke-border"
        strokeWidth="2"
      />

      {/* Hive mark painted on the backdrop */}
      <g className="stroke-primary/25" fill="none" strokeWidth="2" strokeLinejoin="round">
        <polygon points="288,84 300,91 300,105 288,112 276,105 276,91" />
        <polygon points="264,98 276,105 276,119 264,126 252,119 252,105" />
        <polygon points="288,112 300,119 300,133 288,140 276,133 276,119" />
      </g>

      {/* Vintage movie camera — reels spell "4", the lens is the "0" */}
      <g className="stroke-foreground" strokeLinecap="round" strokeLinejoin="round">
        {/* Film reels */}
        <circle cx="160" cy="82" r="24" className="fill-background" strokeWidth="2.5" />
        <circle cx="216" cy="82" r="24" className="fill-background" strokeWidth="2.5" />
        <circle cx="160" cy="82" r="4" className="fill-foreground" strokeWidth="2" />
        <circle cx="216" cy="82" r="4" className="fill-foreground" strokeWidth="2" />
        <text
          x="160"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fontWeight="800"
          className="fill-foreground stroke-none"
        >
          4
        </text>
        <text
          x="216"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fontWeight="800"
          className="fill-foreground stroke-none"
        >
          4
        </text>

        {/* Body + lens */}
        <rect x="140" y="98" width="96" height="44" rx="10" className="fill-primary" strokeWidth="2.5" />
        <rect x="228" y="108" width="22" height="24" rx="5" className="fill-primary" strokeWidth="2.5" />
        <circle cx="262" cy="120" r="15" className="fill-primary" strokeWidth="2.5" />
        <text
          x="262"
          y="121"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="15"
          fontWeight="800"
          className="fill-primary-foreground stroke-none"
        >
          0
        </text>

        {/* Tripod */}
        <line x1="178" y1="142" x2="152" y2="196" strokeWidth="3.5" />
        <line x1="198" y1="142" x2="224" y2="196" strokeWidth="3.5" />
        <line x1="188" y1="142" x2="188" y2="190" strokeWidth="3.5" />
      </g>

      {/* Stage floor shadow */}
      <ellipse cx="188" cy="202" rx="92" ry="8" className="fill-foreground/10" />

      {/* Sparkles */}
      <g className="stroke-primary/50" strokeWidth="2" strokeLinecap="round">
        <path d="M96 64 v10 M91 69 h10" />
        <path d="M238 52 v10 M233 57 h10" />
        <path d="M120 130 h10 M125 125 v10" />
      </g>
    </svg>
  );
}

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <StudioSceneIllustration />

      <header className="flex flex-col items-center gap-2">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide text-secondary-foreground uppercase">
          <ClapperboardIcon className="size-3.5" />
          Error 404 · Scene missing
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          This set was never built
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          The page you&apos;re looking for isn&apos;t on the studio lot — it
          may have been moved, wrapped, or never shot at all.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" render={<Link href="/" />} nativeButton={false}>
          <HomeIcon />
          Return to Home
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/studios" />}
          nativeButton={false}
        >
          Browse Studios
        </Button>
      </div>
    </main>
  );
}
