import { ShieldCheckIcon, BadgeCheckIcon, WrenchIcon, HeadsetIcon } from "lucide-react";
const ASSURANCES = [
  {
    title: "Liability Protection",
    description:
      "Every booking is backed by coverage — damage during a session is handled through the platform, not out of your pocket.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Verified Profiles",
    description:
      "Hosts and creators go through identity checks before they can list or book, so you always know who is on the other side.",
    icon: BadgeCheckIcon,
  },
  {
    title: "Equipment Safety",
    description:
      "Listed gear is inspected and condition-checked, with secure check-in/check-out tracked on every reservation.",
    icon: WrenchIcon,
  },
  {
    title: "24/7 Host Support",
    description:
      "Questions at 2 AM before a morning shoot? Our support team answers around the clock, before and after every booking.",
    icon: HeadsetIcon,
  },
] as const;
export function HostGuarantee() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ASSURANCES.map((item) => (
        <div key={item.title} className="flex flex-col gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <item.icon className="size-5" />
          </span>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}