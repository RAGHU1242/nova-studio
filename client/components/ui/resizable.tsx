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
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 shadow-md overflow-hidden",
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
      "relative flex w-px items-center justify-center bg-white/10 transition-all duration-300 ease-in-out",
      "hover:w-1 hover:bg-primary/50 hover:shadow-[0_0_10px_rgba(var(--primary),0.5)]",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:after:ring-1 focus-visible:after:ring-ring focus-visible:after:ring-offset-1",
      className
    )}
    {...props}
  >
     <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-white/10 shadow-sm transition-transform duration-200 group-hover:scale-110">
        <div className="h-2 w-0.5 bg-foreground/50" />
      </div>
  </ResizablePrimitive.PanelResizeHandle>
));

ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };