import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/15",
        "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
        "px-3 py-2 text-sm shadow-sm",
        "placeholder:text-muted-foreground/70",
        "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
