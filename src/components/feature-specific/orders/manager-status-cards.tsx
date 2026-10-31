import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getManagerOrderStatusCount, getTakenByOrderStatusCount } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Crown,
  MapPin,
  Package,
  Rocket,
  RotateCcw,
  Send,
  Truck,
  Undo2,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface ManagerStatusCardsProps {
  dateFrom?: string;
  dateTo?: string;
  wilaya?: string;
  shippingProvider?: string;
  companyId?: number;
  managerId?: number;
  groupBy?: "confirmed_by" | "taken_by";
}

// Same order, colors and icons as the stage tiles on the Orders desk.
const STATUSES: Record<string, { label: string; icon: LucideIcon; bar: string; tile: string; icon_bg: string }> = {
  unconfirmed: {
    label: "Unconfirmed",
    icon: Package,
    bar: "bg-indigo-400",
    tile: "border-indigo-200/80 bg-indigo-100/80 text-indigo-950 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50",
    icon_bg: "bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100",
  },
  packing: {
    label: "Packing",
    icon: Package,
    bar: "bg-blue-400",
    tile: "border-blue-200/80 bg-blue-100/80 text-blue-950 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-50",
    icon_bg: "bg-blue-200/80 text-blue-800 dark:bg-blue-400/20 dark:text-blue-100",
  },
  dispaching: {
    label: "Dispatching",
    icon: Truck,
    bar: "bg-violet-400",
    tile: "border-violet-200/80 bg-violet-100/80 text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50",
    icon_bg: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
  },
  deliviring: {
    label: "Delivering",
    icon: Send,
    bar: "bg-amber-400",
    tile: "border-amber-200/80 bg-amber-100/85 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50",
    icon_bg: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  },
  orphaned: {
    label: "Orphaned",
    icon: AlertTriangle,
    bar: "bg-yellow-400",
    tile: "border-yellow-200/80 bg-yellow-100/90 text-yellow-950 dark:border-yellow-400/30 dark:bg-yellow-500/20 dark:text-yellow-50",
    icon_bg: "bg-yellow-200/90 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-100",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    tile: "border-emerald-200/80 bg-emerald-100/80 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50",
    icon_bg: "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100",
  },
  returning: {
    label: "Returning",
    icon: RotateCcw,
    bar: "bg-orange-400",
    tile: "border-orange-200/80 bg-orange-100/85 text-orange-950 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-50",
    icon_bg: "bg-orange-200/80 text-orange-900 dark:bg-orange-400/20 dark:text-orange-100",
  },
  returned: {
    label: "Returned",
    icon: Undo2,
    bar: "bg-rose-500",
    tile: "border-rose-200/80 bg-rose-100/80 text-rose-950 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-50",
    icon_bg: "bg-rose-200/80 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bar: "bg-fuchsia-400",
    tile: "border-fuchsia-200/80 bg-fuchsia-100/80 text-fuchsia-950 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-50",
    icon_bg: "bg-fuchsia-200/80 text-fuchsia-900 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
  },
  relaunched: {
    label: "Relaunched",
    icon: Rocket,
    bar: "bg-sky-400",
    tile: "border-sky-200/80 bg-sky-100/80 text-sky-950 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-50",
    icon_bg: "bg-sky-200/80 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100",
  },
};

const STATUS_ORDER = Object.keys(STATUSES);

const FALLBACK_STATUS = {
  label: "",
  icon: Package,
  bar: "bg-slate-400",
  tile: "border-slate-200/80 bg-slate-100/80 text-slate-950 dark:border-slate-400/30 dark:bg-slate-500/20 dark:text-slate-50",
  icon_bg: "bg-slate-200/80 text-slate-800 dark:bg-slate-400/20 dark:text-slate-100",
};

const AVATAR_TONES = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-violet-500",
];

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950",
  "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
  "bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950",
];

const glassCard =
  "rounded-xl border border-white/50 bg-white/55 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return letters ? letters.toUpperCase() : "?";
}

function rateTone(rate: number) {
  if (rate >= 70) return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
  if (rate >= 45) return "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200";
  return "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200";
}

export default function ManagerStatusCards({
  dateFrom,
  dateTo,
  wilaya,
  shippingProvider,
  companyId,
  managerId,
  groupBy = "confirmed_by",
}: ManagerStatusCardsProps) {
  const isTakenBy = groupBy === "taken_by";
  const fetchCounts = isTakenBy ? getTakenByOrderStatusCount : getManagerOrderStatusCount;

  const { data, isLoading, isError } = useQuery({
    queryKey: [isTakenBy ? "taken-by-status-count" : "manager-status-count", dateFrom, dateTo, wilaya, shippingProvider, companyId, managerId],
    queryFn: () =>
      fetchCounts({
        date_from: dateFrom,
        date_to: dateTo,
        wilaya: wilaya,
        shipping_provider: shippingProvider,
        company_id: companyId,
        manager_id: managerId,
      }),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100">
        Failed to load {isTakenBy ? "taken-by" : "manager"} statistics.
      </div>
    );
  }

  const managers = [...data.data.managers].sort((a, b) => b.total_orders - a.total_orders);
  const filters = [
    data.data.date_from || data.data.date_to
      ? { icon: CalendarDays, text: [data.data.date_from, data.data.date_to].filter(Boolean).join(" → ") }
      : null,
    data.data.wilaya ? { icon: MapPin, text: data.data.wilaya } : null,
    data.data.shipping_provider ? { icon: Truck, text: data.data.shipping_provider } : null,
  ].filter((f): f is { icon: LucideIcon; text: string } => f !== null);

  if (managers.length === 0) {
    return (
      <div className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", glassCard)}>
        <span className="flex size-11 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700 dark:bg-slate-400/20 dark:text-slate-100">
          <Users className="size-5" />
        </span>
        <p className="text-sm font-medium">
          {isTakenBy
            ? "No users found with taken orders in the selected period."
            : "No managers found with confirmed orders in the selected period."}
        </p>
      </div>
    );
  }

  const grandTotal = managers.reduce((sum, m) => sum + m.total_orders, 0);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-100">
            <Users className="size-3.5" />
            {managers.length} {isTakenBy ? "users" : "managers"} · {grandTotal.toLocaleString()} {isTakenBy ? "taken" : "confirmed"}
          </span>
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <span key={filter.text} className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-muted-foreground shadow-sm dark:bg-white/10">
                <Icon className="size-3.5" />
                {filter.text}
              </span>
            );
          })}
        </div>

        {managers.map((manager, index) => {
          const total = manager.total_orders;
          const counts = [...manager.status_counts].sort(
            (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
          );
          const delivered = counts.find((c) => c.status === "delivered")?.count ?? 0;
          const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
          const share = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

          return (
            <article key={manager.manager_id} className={cn("space-y-3 p-4", glassCard)}>
              <header className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
                      AVATAR_TONES[index % AVATAR_TONES.length]
                    )}
                  >
                    {initials(manager.manager_name)}
                  </span>
                  {index < 3 && (
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white dark:ring-slate-900",
                        RANK_STYLES[index]
                      )}
                      aria-label={`Rank ${index + 1}`}
                    >
                      {index === 0 ? <Crown className="size-3" /> : index + 1}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{manager.manager_name}</div>
                  <div className="truncate text-xs text-muted-foreground">{manager.manager_email}</div>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums", rateTone(deliveryRate))}>
                  {deliveryRate.toFixed(1)}% delivered
                </span>
                <div className="text-right">
                  <div className="text-2xl font-semibold leading-none tabular-nums tracking-tight">{total.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {isTakenBy ? "taken" : "confirmed"} · {share.toFixed(0)}% of team
                  </div>
                </div>
              </header>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10" role="img" aria-label="Status breakdown">
                {counts
                  .filter((c) => c.count > 0)
                  .map((c) => {
                    const style = STATUSES[c.status] ?? FALLBACK_STATUS;
                    const pct = total > 0 ? (c.count / total) * 100 : 0;
                    return (
                      <Tooltip key={c.status}>
                        <TooltipTrigger asChild>
                          <span className={cn("h-full first:rounded-l-full last:rounded-r-full", style.bar)} style={{ width: `${pct}%` }} />
                        </TooltipTrigger>
                        <TooltipContent>
                          {style.label || c.status}: {c.count.toLocaleString()} ({pct.toFixed(1)}%)
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {counts.map((c) => {
                  const style = STATUSES[c.status] ?? FALLBACK_STATUS;
                  const Icon = style.icon;
                  const pct = total > 0 ? (c.count / total) * 100 : 0;
                  return (
                    <div
                      key={c.status}
                      className={cn("flex items-center gap-2.5 rounded-xl border px-2.5 py-2", style.tile, c.count === 0 && "opacity-50")}
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", style.icon_bg)}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold leading-none tabular-nums">{c.count.toLocaleString()}</span>
                        <span className="mt-1 block truncate text-[11px] font-medium opacity-75">
                          {style.label || c.status} · {pct.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
