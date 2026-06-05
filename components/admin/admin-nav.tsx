"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard, Package, ClipboardList, Activity, Megaphone, CalendarClock,
  Newspaper, GraduationCap, Images, User, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
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
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-forest text-cream" : "text-forest/80 hover:bg-forest/5"
            )}
          >
            <Icon className="size-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
