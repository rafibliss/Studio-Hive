import { SearchIcon, CalendarClockIcon, ZapIcon, ClapperboardIcon } from "lucide-react";
const STEPS = [
  {
    number: "1",
    title: "Discover Spaces",
    description:
      "Browse verified studios by category, city, or vibe — with real photos, rates, and availability up front.",
    icon: SearchIcon,
  },
  {
    number: "2",
    title: "Select Shoot Hours",
    description:
      "Pick the date and hourly slots that fit your schedule. Only the time you need — nothing more.",
    icon: CalendarClockIcon,
  },
  {
    number: "3",
    title: "Book Instantly",
    description:
      "Confirm and pay in a few clicks. The host gets notified right away and your slot is locked in.",
    icon: ZapIcon,
  },
  {
    number: "4",
    title: "Create & Produce",
    description:
      "Show up, shoot, and produce. On-site amenities and host support keep the session running smooth.",
    icon: ClapperboardIcon,
  },
] as const;
export function HowItWorks() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => (
        <div
          key={step.number}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {step.number}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className="text-muted-foreground/60 sm:hidden lg:block"
              >
                →
              </span>
            ) : null}
            <step.icon className="hidden text-muted-foreground sm:block" aria-hidden="true" />
          </div>
          <h3 className="font-semibold">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}