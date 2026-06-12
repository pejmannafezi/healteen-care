"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard, Package, ClipboardList, Activity, Megaphone, CalendarClock,
  Newspaper, GraduationCap, Images, User, Radio, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
  { href: "/admin/consultations", label: "Consultations", icon: CalendarClock },
  { href: "/admin/live", label: "Live Studio", icon: Radio },
  { href: "/admin/conditions", label: "Health Library", icon: Activity },
  { href: "/admin/stories", label: "Stories", icon: Images },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/webinars", label: "Classes", icon: GraduationCap },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/social", label: "Social Drafts", icon: Megaphone },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-row gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card lg:flex-col"
    >
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "bg-forest text-cream shadow-sm"
                : "text-forest/75 hover:bg-forest/5 hover:text-forest"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-gold" : "text-nature/70 group-hover:text-nature"
              )}
            />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
