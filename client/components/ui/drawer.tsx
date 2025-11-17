/* --- THEME UPGRADED DRAWER --- */
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Drawer = (props: any) => <DrawerPrimitive.Root {...props} />;
const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerOverlay = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm", className)}
    {...props}
  />
));

const DrawerContent = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed bottom-0 inset-x-0 rounded-t-2xl",
        "bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-xl",
        "border-t border-white/10 shadow-2xl p-4",
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/30"></div>
      {children}
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));

export { Drawer, DrawerTrigger, DrawerContent };
