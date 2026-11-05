"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Aperture,
  Building2,
  CalendarCheck,
  ChevronDown,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Menu,
  SquarePlus,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * TODO(auth): replace with real better-auth session (`authClient.useSession()`).
 * Until auth is implemented, the header is hardcoded to the authenticated state.
 * Flip MOCK_AUTHENTICATED to false to preview the logged-out state.
 */
const MOCK_AUTHENTICATED = true;

const MOCK_USER = {
  name: "Alex Rivera",
  email: "alex@studiohive.com",
  image: "https://i.pravatar.cc/150?u=studiohive-alex",
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="StudioHive home">
      {/* Hive mark: deep-blue hexagon with a white aperture lens */}
      <span className="relative flex size-9 items-center justify-center">
        <Hexagon className="absolute size-9 fill-primary text-primary" strokeWidth={1.25} />
        <Aperture className="relative size-4 text-primary-foreground" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Studio<span className="text-primary">Hive</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Nav centered between the logo and the avatar */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* TODO(auth): replace mock state — `MOCK_USER` + tenant links — with session data */}
        <div className="flex items-center justify-end gap-2">
          {MOCK_AUTHENTICATED ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="gap-2 pr-2 pl-1" aria-label="Open account menu">
                    <Avatar size="sm">
                      <AvatarImage src={MOCK_USER.image} alt={MOCK_USER.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {MOCK_USER.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">
                      {MOCK_USER.name}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                    <span className="text-sm font-medium text-foreground">{MOCK_USER.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {MOCK_USER.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/add-studio" />}>
                  <SquarePlus />
                  Add New Studio
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/my-listings" />}>
                  <Building2 />
                  My Studio Listings
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/my-bookings" />}>
                  <CalendarCheck />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* TODO(auth): wire to better-auth `authClient.signOut()` */}
                <DropdownMenuItem variant="destructive" onClick={() => { }}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Unauthenticated state per spec: Log in / Sign up actions
            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
                Log in
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false}>Sign up</Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="relative flex size-8 items-center justify-center">
                    <Hexagon className="absolute size-8 fill-primary text-primary" strokeWidth={1.25} />
                    <Aperture className="relative size-3.5 text-primary-foreground" strokeWidth={2.25} />
                  </span>
                  StudioHive
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <SheetTrigger
                      key={link.href}
                      render={
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      }
                    />
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
