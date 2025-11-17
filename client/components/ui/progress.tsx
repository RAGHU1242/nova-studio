import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<any, any>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full",
      "bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      className="h-full bg-primary rounded-full shadow-lg"
    />
  </ProgressPrimitive.Root>
));

export { Progress };
