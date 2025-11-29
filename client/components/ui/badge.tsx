import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_10px_-3px_rgba(var(--primary),0.6)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-[0_0_10px_-3px_rgba(239,68,68,0.6)]",
        outline:
          "text-foreground hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
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
    <motion.div
      className={cn(badgeVariants({ variant }), className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 0.1,
      }}
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
