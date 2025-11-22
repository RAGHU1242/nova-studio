import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<any, any>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-white/10",
        "bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm shadow-sm px-3 text-sm",
        "focus:ring-2 focus:ring-primary/40",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-60" />
    </SelectPrimitive.Trigger>
  )
);

const SelectContent = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] rounded-xl border border-white/10 shadow-xl",
        "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg p-1",
        className
      )}
      {...props}
    />
  )
);

const SelectItem = React.forwardRef<any, any>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm",
        "hover:bg-white/10 focus:bg-white/10 outline-none",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
