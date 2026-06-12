import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        forest: "bg-forest/10 text-forest",
        nature: "bg-nature/12 text-nature",
        gold: "bg-gold/15 text-gold-600",
        honey: "bg-honey/20 text-[#8a6a12]",
        mint: "bg-mint/15 text-nature",
        terracotta: "bg-terracotta/12 text-terracotta",
        outline: "border border-border text-forest",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "forest" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
