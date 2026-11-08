"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  Aperture,
  Building2,
  CalendarCheck,
  ChevronDown,
  Hexagon,
  // LayoutDashboard,
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
import { authClient } from "@/lib/auth-client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },

  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about-us" },
] as const;

function isActive(pathname: string, href: string) {

  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}


function scrollToHashSection(
  e: ReactMouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string
) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  const targetPath = href.slice(0, hashIndex) || "/";
  if (pathname !== targetPath) return;
  const section = document.getElementById(href.slice(hashIndex + 1));
  if (!section) return;
  e.preventDefault();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="StudioHive home">

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
  const router = useRouter();


  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    const hashLinks = NAV_LINKS.filter((link) => link.href.includes("#"));
    if (hashLinks.length === 0) return;


    const hrefBySectionId = new Map(
      hashLinks.map((link) => [
        link.href.slice(link.href.indexOf("#") + 1),
        link.href,
      ])
    );


    const observer = new IntersectionObserver(
      (entries) => {
        setActiveSection((prev) => {
          let next = prev;
          for (const entry of entries) {
            const href = hrefBySectionId.get(entry.target.id);
            if (!href) continue;
            next = entry.isIntersecting ? href : next === href ? null : next;
          }
          return next;
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const id of hrefBySectionId.keys()) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [pathname]);


  const effectiveActiveSection = pathname === "/" ? activeSection : null;


  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user ?? null;

  async function handleSignOut() {

    await authClient.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Logo />
        </div>


        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active =
              link.href.includes("#")
                ? effectiveActiveSection === link.href
                : isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => scrollToHashSection(e, link.href, pathname)}
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


        <div className="flex items-center justify-end gap-2">
          {sessionLoading ? (

            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="size-8 animate-pulse rounded-full bg-muted" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="gap-2 pr-2 pl-1" aria-label="Open account menu">
                    <Avatar size="sm">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">
                      {user.name}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem> */}
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
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (

            <div className="flex items-center gap-1">
              <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
                Log in
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                className="hidden sm:inline-flex"
              >
                Sign up
              </Button>
            </div>
          )}


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
                  const active =
                    link.href.includes("#")
                      ? effectiveActiveSection === link.href
                      : isActive(pathname, link.href);
                  return (
                    <SheetTrigger
                      key={link.href}
                      render={
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          onClick={(e) => scrollToHashSection(e, link.href, pathname)}
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
