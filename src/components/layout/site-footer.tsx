"use client";

import Link from "next/link";
import { useState } from "react";
import { Hexagon, Aperture, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about-us" },
  { label: "Add Your Studio", href: "/add-studio" },
] as const;


const POPULAR_CATEGORIES = [
  { label: "Photo Studios", value: "Photo Studio" },
  { label: "Sound Stages", value: "Film Stage" },
  { label: "Podcast Rooms", value: "Podcast Lounge" },
  { label: "Music Suites", value: "Music Suite" },
  { label: "Art Workshops", value: "Workshop" },
] as const;

const SOCIALS = [
  { label: "X", href: "https://x.com/studiohive" },
  { label: "Instagram", href: "https://instagram.com/studiohive" },
  { label: "LinkedIn", href: "https://linkedin.com/company/studiohive" },
  { label: "Facebook", href: "https://facebook.com/studiohive" },
] as const;


const SOCIAL_ICON_PATHS = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  Facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
} as const;

function BrandIcon({
  label,
  className,
}: {
  label: keyof typeof SOCIAL_ICON_PATHS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {SOCIAL_ICON_PATHS[label]}
    </svg>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function FooterLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="StudioHive home"
    >

      <span className="relative flex size-9 items-center justify-center">
        <Hexagon
          className="absolute size-9 fill-primary-foreground text-primary-foreground"
          strokeWidth={1.25}
        />
        <Aperture className="relative size-4 text-primary" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-bold tracking-tight text-primary-foreground">
        Studio<span className="text-primary-foreground/85">Hive</span>
      </span>
    </Link>
  );
}

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (email.trim()) setSubscribed(true);
  }

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr] lg:py-16">
          <div className="flex flex-col items-start gap-4">
            <FooterLogo />
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/75">
              StudioHive is the hive where creators find and instantly book
              photo studios, film stages, podcast rooms, music suites and
              workshops — by the hour, from verified hosts, in cities across
              the country.
            </p>

            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`StudioHive on ${social.label}`}
                  className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  {social.label === "X" ? (
                    <XLogo className="size-4" />
                  ) : (
                    <BrandIcon label={social.label} className="size-4.5" />
                  )}
                </a>
              ))}
            </div>
          </div>


          <nav aria-label="Footer quick links" className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>


          <nav
            aria-label="Popular studio categories"
            className="flex flex-col gap-3"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Popular Categories
            </h3>
            <ul className="flex flex-col gap-2">
              {POPULAR_CATEGORIES.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(category.value)}`}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>


          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              Newsletter
            </h3>
            <p className="text-sm text-primary-foreground/75">
              New studios, city openings and booking tips — straight to your
              inbox, once a month. No noise.
            </p>
            {subscribed ? (
              <p
                role="status"
                className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2.5 text-sm"
              >
                You&apos;re in! Welcome to the hive — see you next issue.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full items-start gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
                <Button type="submit" className="shrink-0" aria-label="Subscribe">
                  <Send />
                </Button>
              </form>
            )}
          </div>
        </div>


        <div className="flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} StudioHive. All rights reserved.
            Every studio is independently operated by its verified host.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="transition-colors hover:text-primary-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
