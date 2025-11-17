/* --- THEME UPGRADED CONTEXT MENU --- */
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const menuGlass =
  "rounded-md bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-sm border border-white/10 shadow-xl";

const ContextMenuContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Content
    ref={ref}
    className={cn(menuGlass, "p-1 min-w-[8rem]", className)}
    {...props}
  />
));

const ContextMenuItem = React.forwardRef<any, any>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "flex select-none items-center rounded-sm px-2 py-1.5 text-sm",
      "hover:bg-white/10 focus:bg-white/10 outline-none",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

const ContextMenuSubTrigger = React.forwardRef<any, any>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex items-center rounded-sm px-2 py-1.5 text-sm",
      "hover:bg-white/10 data-[state=open]:bg-white/10",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {props.children}
    <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
  </ContextMenuPrimitive.SubTrigger>
));

const ContextMenuSubContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(menuGlass, "p-1", className)}
    {...props}
  />
));

const ContextMenuSeparator = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-white/10", className)}
    {...props}
  />
));

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator
};
