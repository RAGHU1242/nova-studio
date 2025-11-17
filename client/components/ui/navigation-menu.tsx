import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const glass =
  "bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-lg";

const NavigationMenu = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative flex max-w-max items-center justify-center z-10", className)}
    {...props}
  />
));

const NavigationMenuList = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));

const NavigationMenuTrigger = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "px-4 py-2 rounded-md text-sm font-medium",
      "hover:bg-white/10 focus:bg-white/10",
      className
    )}
    {...props}
  >
    {props.children}
    <ChevronDown className="ml-1 h-3 w-3 opacity-70" />
  </NavigationMenuPrimitive.Trigger>
));

const NavigationMenuContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(glass, "rounded-lg p-4 min-w-[200px]", className)}
    {...props}
  />
));

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent
};
