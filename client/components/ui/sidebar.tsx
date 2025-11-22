import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <aside
    className={cn(
      "h-full w-64 p-4 border-r border-white/10 shadow-lg",
      "bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-xl",
      className
    )}
    {...props}
  />
);

export { Sidebar };
