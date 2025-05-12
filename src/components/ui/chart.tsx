import { cn } from "@/lib/utils";
import * as React from "react";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
    icon?: React.ComponentType<any>;
    theme?: {
      light: string;
      dark: string;
    };
  };
}

export function ChartContainer({
  children,
  config,
  className,
  ...props
}: React.PropsWithChildren<{
  config?: ChartConfig;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    >
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  // This is a passthrough for Recharts' Tooltip component
  return content;
}

export function ChartTooltipContent() {
  // This is a placeholder for custom tooltip content
  // You can customize this as needed for your app
  return <div className="p-2 text-xs">Tooltip</div>;
}

export function ChartLegend({ content }: { content: React.ReactNode }) {
  return content;
}

export function ChartLegendContent() {
  return <div className="p-2 text-xs">Legend</div>;
} 