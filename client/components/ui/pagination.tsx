import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: any) => (
  <nav className={cn("flex justify-center", className)} {...props} />
);

const PaginationContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
));

const PaginationItem = React.forwardRef<any, any>((props, ref) => <li ref={ref} {...props} />);

const PaginationLink = ({ className, isActive, size = "icon", ...props }: any) => (
  <a
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size
      }),
      "rounded-md bg-white/5 border border-white/10 shadow-sm",
      className
    )}
    {...props}
  />
);

export { Pagination, PaginationContent, PaginationItem, PaginationLink };
