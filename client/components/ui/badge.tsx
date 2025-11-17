import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground hover:from-primary/85",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary/70 to-secondary/50 text-secondary-foreground",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600/70 to-red-600/55 text-white",
        outline:
          "bg-transparent border border-muted text-foreground/90 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
