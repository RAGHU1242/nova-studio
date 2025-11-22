import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;

const SheetOverlay = React.forwardRef<any, any>((props, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
    {...props}
  />
));

const SheetContent = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 w-[350px] border-l border-white/10",
        "bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-xl shadow-2xl p-6",
        "outline-none", className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100">
        <X />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));

export { Sheet, SheetTrigger, SheetContent };
