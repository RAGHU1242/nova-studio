/* --- THEME UPGRADED DROPDOWN MENU --- */
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const menuGlass =
  "rounded-md bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm border border-white/10 shadow-xl";

const DropdownMenuContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={cn(menuGlass, "p-1 min-w-[8rem]", className)}
    {...props}
  />
));

const DropdownMenuItem = React.forwardRef<any, any>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "px-2 py-1.5 rounded-sm select-none text-sm cursor-pointer",
      "hover:bg-white/10 focus:bg-white/10 outline-none",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
};
