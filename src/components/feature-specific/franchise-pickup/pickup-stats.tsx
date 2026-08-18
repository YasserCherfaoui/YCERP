import { Skeleton } from "@/components/ui/skeleton";
import { FranchisePickupStatusCounts } from "@/models/data/franchise-pickup.model";
import { cn } from "@/lib/utils";
import { Ban, CheckCircle2, Clock3, PackageX, Split } from "lucide-react";

const STATS = [
  {
    key: "pending",
    label: "Pending",
    hint: "Awaiting pickup",
    icon: Clock3,
    accent: "text-amber-700 dark:text-amber-300",
    ring: "data-[active=true]:ring-amber-500/40",
  },
  {
    key: "picked",
    label: "Picked",
    hint: "Stock deducted",
    icon: CheckCircle2,
    accent: "text-emerald-700 dark:text-emerald-300",
    ring: "data-[active=true]:ring-emerald-600/40",
  },
  {
    key: "partial",
    label: "Partial",
    hint: "Some items missing",
    icon: Split,
    accent: "text-sky-700 dark:text-sky-300",
    ring: "data-[active=true]:ring-sky-500/40",
  },
  {
    key: "not_available",
    label: "Not available",
    hint: "Could not fulfill",
    icon: PackageX,
    accent: "text-muted-foreground",
    ring: "data-[active=true]:ring-border",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    hint: "Closed by company",
    icon: Ban,
    accent: "text-destructive",
    ring: "data-[active=true]:ring-destructive/40",
  },
] as const;

interface PickupStatsProps {
  counts?: FranchisePickupStatusCounts;
  activeStatus?: string;
  onStatusChange?: (status: string) => void;
  loading?: boolean;
}

export function PickupStats({
  counts,
  activeStatus = "all",
  onStatusChange,
  loading,
}: PickupStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[4.5rem] rounded-xl sm:h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = counts?.[stat.key] ?? 0;
        const active = activeStatus === stat.key;
        const interactive = Boolean(onStatusChange);
        const className = cn(
          "min-h-[4.5rem] rounded-xl border bg-card p-3 text-left shadow-sm transition-all duration-200",
          interactive &&
            "cursor-pointer hover:border-foreground/20 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          stat.ring,
          active && "ring-2"
        );
        const body = (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
              <Icon className={cn("h-4 w-4 shrink-0", stat.accent)} aria-hidden />
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {value}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {stat.hint}
            </p>
          </>
        );

        if (interactive) {
          return (
            <button
              key={stat.key}
              type="button"
              data-active={active}
              aria-pressed={active}
              aria-label={`Filter ${stat.label.toLowerCase()}`}
              onClick={() => onStatusChange?.(active ? "all" : stat.key)}
              className={className}
            >
              {body}
            </button>
          );
        }

        return (
          <div key={stat.key} data-active={active} className={className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
