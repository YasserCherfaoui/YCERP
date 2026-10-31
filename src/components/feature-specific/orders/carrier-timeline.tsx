import { cn } from "@/lib/utils";
import { YalidineOrderHistory } from "@/models/data/woo-order.model";
import { carrierStatusLabel } from "@/utils/shipping-provider";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { CheckCircle2, Clock, MapPin, Package, Truck, Undo2, type LucideIcon } from "lucide-react";

type Stage = { icon: LucideIcon; dot: string; ring: string; text: string; callout: string };

const STAGES: { match: RegExp; stage: Stage }[] = [
  {
    match: /retour|return|echec|echoue|annul|cancel|refus|bloque|perdu|lost|alerte/,
    stage: {
      icon: Undo2,
      dot: "bg-rose-500 text-white",
      ring: "ring-rose-200 dark:ring-rose-500/30",
      text: "text-rose-700 dark:text-rose-300",
      callout: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
    },
  },
  {
    match: /livre\b|livree|delivered|livred|encaiss|paye|paid/,
    stage: {
      icon: CheckCircle2,
      dot: "bg-emerald-500 text-white",
      ring: "ring-emerald-200 dark:ring-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-300",
      callout: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
    },
  },
  {
    match: /attente|tentative|report|absent|injoignable|pending|hold|suspend/,
    stage: {
      icon: Clock,
      dot: "bg-amber-500 text-white",
      ring: "ring-amber-200 dark:ring-amber-500/30",
      text: "text-amber-700 dark:text-amber-300",
      callout: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
    },
  },
  {
    match: /sorti|out for delivery|en livraison|en cours|transit|expedi|vers|transfert|recu|centre|ramasse|picked|shipped|dispatch/,
    stage: {
      icon: Truck,
      dot: "bg-sky-500 text-white",
      ring: "ring-sky-200 dark:ring-sky-500/30",
      text: "text-sky-700 dark:text-sky-300",
      callout: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100",
    },
  },
];

const DEFAULT_STAGE: Stage = {
  icon: Package,
  dot: "bg-indigo-500 text-white",
  ring: "ring-indigo-200 dark:ring-indigo-500/30",
  text: "text-indigo-700 dark:text-indigo-300",
  callout: "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-100",
};

function stageFor(status: string): Stage {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return STAGES.find((entry) => entry.match.test(normalized))?.stage ?? DEFAULT_STAGE;
}

function toDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE d MMM yyyy");
}

export default function CarrierTimeline({
  histories,
  provider,
  className,
}: {
  histories: YalidineOrderHistory[];
  provider?: string | null;
  className?: string;
}) {
  const events = histories
    .map((history) => ({ history, date: toDate(history.date) }))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  if (events.length === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>No carrier updates yet.</p>;
  }

  return (
    <ol className={cn("relative", className)} aria-label="Carrier updates timeline">
      {events.map(({ history, date }, index) => {
        const label = carrierStatusLabel(provider, history.status) || "Status update";
        const stage = stageFor(label);
        const Icon = stage.icon;
        const isLatest = index === 0;
        const isLast = index === events.length - 1;
        const previousDay = index > 0 ? events[index - 1].date : null;
        const showDay = date && (!previousDay || previousDay.toDateString() !== date.toDateString());
        const location = [history.center_name, history.commune_name, history.wilaya_name]
          .filter((part) => part?.trim())
          .join(" · ");

        return (
          <li key={history.ID ?? index}>
            {showDay && (
              <div className={cn("mb-2 pl-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", index > 0 && "mt-1")}>
                {dayLabel(date)}
              </div>
            )}
            <div className="relative flex gap-3 pb-4">
              {!isLast && (
                <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-slate-300 to-slate-200 dark:from-white/20 dark:to-white/5" />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4",
                  isLatest ? stage.dot : "bg-white text-muted-foreground dark:bg-slate-900",
                  isLatest ? stage.ring : "ring-white/70 dark:ring-white/5"
                )}
              >
                {isLatest && (
                  <span aria-hidden className={cn("absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping", stage.dot)} />
                )}
                <Icon className={cn("relative size-4", !isLatest && stage.text)} />
              </span>
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-xl px-3 py-2",
                  isLatest ? "border border-white/70 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.07]" : "bg-white/40 dark:bg-white/[0.03]"
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className={cn("text-sm font-semibold", isLatest && stage.text)}>
                    {label}
                    {isLatest && (
                      <span className="ml-2 rounded-full bg-foreground/5 px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Latest
                      </span>
                    )}
                  </span>
                  {date && (
                    <time
                      dateTime={date.toISOString()}
                      title={format(date, "PPpp")}
                      className="text-xs tabular-nums text-muted-foreground"
                    >
                      {format(date, "HH:mm")} · {formatDistanceToNow(date, { addSuffix: true })}
                    </time>
                  )}
                </div>
                {history.reason?.trim() && (
                  <p className={cn("mt-1.5 rounded-md border px-2 py-1 text-xs", stage.callout)}>{history.reason}</p>
                )}
                {location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {location}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
