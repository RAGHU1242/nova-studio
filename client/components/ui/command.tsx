/* --- THEME UPGRADED COMMAND PALETTE --- */
import * as React from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex flex-col overflow-hidden rounded-xl",
      "bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md shadow-xl border border-white/10",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => (
  <Dialog {...props}>
    <DialogContent className="p-0 shadow-2xl">
      <Command className="border-none">{children}</Command>
    </DialogContent>
  </Dialog>
);

const CommandInput = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-white/10 bg-white/5 backdrop-blur-sm px-3">
    <Search className="mr-2 h-4 w-4 opacity-60" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "h-11 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[320px] overflow-y-auto backdrop-blur-sm",
      className
    )}
    {...props}
  />
));

const CommandGroup = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn("px-2 py-1.5 text-foreground/80", className)}
    {...props}
  />
));

const CommandSeparator = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("my-2 h-px bg-white/10", className)}
    {...props}
  />
));

const CommandItem = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "px-2 py-2 rounded-md cursor-pointer select-none",
      "data-[selected=true]:bg-white/10",
      "hover:bg-white/10 transition-colors",
      className
    )}
    {...props}
  />
));

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandSeparator,
  CommandItem
};
