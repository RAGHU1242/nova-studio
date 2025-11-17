import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const glass =
  "bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-md border border-white/10 shadow-lg";

const Menubar = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("flex items-center space-x-1 rounded-lg p-1", glass, className)}
    {...props}
  />
));

const MenubarTrigger = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "px-3 py-1.5 text-sm rounded-md",
      "hover:bg-white/10 focus:bg-white/10 outline-none",
      className
    )}
    {...props}
  />
));

const MenubarContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Content
    ref={ref}
    className={cn(glass, "p-1 min-w-[10rem] rounded-lg", className)}
    {...props}
  />
));

const MenubarItem = React.forwardRef<any, any>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "px-2 py-1.5 rounded-md text-sm cursor-pointer",
      "hover:bg-white/10 focus:bg-white/10 outline-none",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

export {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarItem
};
