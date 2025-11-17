/* --- THEME UPGRADED FORM COMPONENTS --- */
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = (props: any) => <>{props.children}</>;

const FormItem = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <div
      ref={ref}
      data-form-item-id={id}
      className={cn("space-y-2 rounded-xl p-2", "bg-white/5 border border-white/10 backdrop-blur-sm", className)}
      {...props}
    />
  );
});

const FormLabel = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
));

const FormControl = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("rounded-md border border-white/10 bg-white/10 backdrop-blur-sm p-2", className)}
    {...props}
  />
));

const FormDescription = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));

const FormMessage = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-red-500", className)} {...props} />
));

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
