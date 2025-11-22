import * as React from "react";
import { cn } from "@/lib/utils";
import * as ResizablePrimitive from "react-resizable-panels";

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn(
      "rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 shadow-md",
      className
    )}
    {...props}
  />
));

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-2 items-center justify-center bg-transparent",
      "before:absolute before:h-16 before:w-[3px] before:rounded-full",
      "before:bg-white/20 hover:before:bg-white/40",
      className
    )}
    {...props}
  />
));

ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
