import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ease-in-out border border-transparent backdrop-blur-sm hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white/5 hover:bg-white/10 data-[state=on]:bg-white/20 data-[state=on]:text-accent-foreground data-[state=on]:shadow-[0_0_10px_rgba(255,255,255,0.1)]",
        outline:
          "border-white/10 hover:bg-white/5 hover:text-accent-foreground data-[state=on]:bg-white/10 data-[state=on]:border-white/20",
      },
      size: {
        default: "h-10 px-3 min-w-[2.5rem]",
        sm: "h-9 px-2.5 min-w-[2.25rem]",
        lg: "h-11 px-5 min-w-[2.75rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };