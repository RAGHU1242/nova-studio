/* --- THEME UPGRADED COLLAPSIBLE --- */
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>) => (
    <CollapsiblePrimitive.CollapsibleContent 
        className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
            className
        )}
        {...props}
    />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };