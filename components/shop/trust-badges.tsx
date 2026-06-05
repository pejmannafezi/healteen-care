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
              "inline-flex items-center gap-1.5 rounded-full border font-medium",
              dark ? "border-cream/20 bg-cream/10 text-cream" : "border-gold/40 bg-gold/10 text-forest",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            )}
          >
            <Icon className="size-3.5 text-gold-600" />
            {meta.label}
          </li>
        );
      })}
    </ul>
  );
}
