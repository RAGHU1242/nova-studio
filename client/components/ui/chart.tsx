/* --- THEME UPGRADED CHART --- */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs rounded-xl",
          "bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-sm shadow-lg border border-white/10 p-4",
          "transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config?: ChartConfig }) => {
  const colorConfig = Object.entries(config || {}).filter(
    ([_, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config || {})
          .map(([key, itemConfig]) => {
            const color = itemConfig.color || "";
            return `[data-chart=${id}] { --color-${key}: ${color}; }`;
          })
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(({ active, payload, className, indicator = "dot", label, labelFormatter, hideLabel, hideIndicator, color, nameKey, labelKey }, ref) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-xl border border-white/10 bg-gradient-to-br from-background/90 to-background/50 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur-md",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
    >
        {/* Simplified Tooltip Logic for brevity, assumes custom rendering or basic list */}
        {payload.map((item: any, index: number) => (
            <div key={index} className="flex gap-2 items-center">
                 <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                 <span className="font-medium">{item.name}:</span>
                 <span>{item.value}</span>
            </div>
        ))}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };