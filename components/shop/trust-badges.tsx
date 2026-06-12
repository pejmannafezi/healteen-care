import { ShieldCheck, FlaskConical, BadgeCheck, Stethoscope } from "lucide-react";
import type { TrustBadge } from "@/lib/types";
import { cn } from "@/lib/utils";

const BADGE_META: Record<TrustBadge, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  gmp: { label: "GMP Supported", icon: ShieldCheck },
  lab_tested: { label: "Lab-Tested", icon: FlaskConical },
  third_party: { label: "Third-Party Tested", icon: BadgeCheck },
  doctor_approved: { label: "Doctor-Approved", icon: Stethoscope },
};

export function TrustBadges({
  badges,
  size = "sm",
  className,
  dark = false,
}: {
  badges: TrustBadge[];
  size?: "sm" | "md";
  className?: string;
  dark?: boolean;
}) {
  if (!badges?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((b) => {
        const meta = BADGE_META[b];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <li
            key={b}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide transition-colors",
              dark
                ? "border-cream/25 bg-cream/10 text-cream"
                : "border-gold/35 bg-gradient-to-b from-gold/15 to-gold/5 text-forest",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
            )}
          >
            <Icon className={cn("shrink-0", dark ? "text-gold" : "text-gold-600", size === "sm" ? "size-3.5" : "size-4")} />
            {meta.label}
          </li>
        );
      })}
    </ul>
  );
}
