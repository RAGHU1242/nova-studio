/* --- THEME UPGRADED CHART --- */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k: string]: { label?: React.ReactNode; icon?: React.ComponentType; color?: string };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);
const useChart = () => React.useContext(ChartContext)!;

const ChartContainer = React.forwardRef<HTMLDivElement, any>(
  ({ id, className, children, config, ...props }, ref) => {
    const uuid = React.useId();
    const chartId = `chart-${id || uuid.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center rounded-xl",
            "bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-sm shadow-lg border border-white/10 p-3",
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
  }
);
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config?: ChartConfig }) => {
  const entries = Object.entries(config ?? {}) as [string, { color?: string }][];

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
${entries
  .map(([k, v]) => `--color-${k}: ${v.color ?? "hsl(210 90% 60%)"};`)
  .join("\n")}
}
`,
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ active, payload, className }, ref) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-2 shadow-xl backdrop-blur-md text-xs",
          className
        )}
      >
        {payload.map((item: any) => (
          <div key={item.name} className="flex justify-between gap-4">
            <span className="text-foreground/80">{item.name}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
};
