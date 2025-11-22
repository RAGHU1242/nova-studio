import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
      <SliderPrimitive.Range className="absolute h-full bg-primary shadow-lg" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="h-5 w-5 rounded-full border border-white/30 bg-white/80 shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-primary/40" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
