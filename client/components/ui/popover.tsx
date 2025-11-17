import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<any, any>(
  ({ className, align = "center", sideOffset = 6, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "rounded-xl border border-white/10 shadow-xl",
          "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg",
          "p-4 w-72",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);

export { Popover, PopoverTrigger, PopoverContent };
