import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DeliveredAmountBreakdown } from "@/services/expense-reports-service";

export type DeliveredAmountProvider = "yalidine" | "noest";

type Props = {
  provider: DeliveredAmountProvider | null;
  setProvider: (provider: DeliveredAmountProvider | null) => void;
  breakdown?: DeliveredAmountBreakdown;
  benefit: number;
  start: string;
  end: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value);

const providerLabels: Record<DeliveredAmountProvider, { name: string; deliveredStatus: string }> = {
  yalidine: { name: "Yalidine", deliveredStatus: "Livré" },
  noest: { name: "Noest", deliveredStatus: "order_delivered" },
};

function BreakdownRow({
  label,
  hint,
  value,
  strong,
}: {
  label: string;
  hint?: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 py-2.5", strong && "bg-muted/50")}>
      <div>
        <div className={cn("text-sm", strong && "font-semibold")}>{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className={cn("shrink-0 tabular-nums", strong ? "text-base font-semibold" : "text-sm")}>{value}</div>
    </div>
  );
}

export default function DeliveredAmountBreakdownDialog({
  provider,
  setProvider,
  breakdown,
  benefit,
  start,
  end,
}: Props) {
  const labels = provider ? providerLabels[provider] : null;
  const rangeLabel = start === end ? start : `${start} → ${end}`;
  const sumFinalPrice = breakdown?.sum_final_price ?? 0;
  const sumSecondDeliveryCost = breakdown?.sum_second_delivery_cost ?? 0;
  const ordersWithoutItems = breakdown?.orders_without_items ?? 0;

  return (
    <Dialog open={provider !== null} onOpenChange={(open) => !open && setProvider(null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{labels?.name} delivered orders amount</DialogTitle>
          <DialogDescription>
            Orders currently marked delivered, shipped with {labels?.name}, with a{" "}
            <span className="font-medium">{labels?.deliveredStatus}</span> history between {rangeLabel}.
            {provider === "noest" && " Only orders with at least one confirmed item are included."}
          </DialogDescription>
        </DialogHeader>

        {!breakdown ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No breakdown available for this range.</div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y rounded-md border">
              <BreakdownRow label="Orders counted" value={String(breakdown.order_count)} />
              <BreakdownRow
                label="Products"
                hint="Σ final_price − Σ second_delivery_cost"
                value={formatMoney(sumFinalPrice - sumSecondDeliveryCost)}
              />
              <BreakdownRow
                label="Customer delivery fees"
                hint="Σ second_delivery_cost (included in final_price)"
                value={formatMoney(sumSecondDeliveryCost)}
              />
              <BreakdownRow label="Total amount" hint="Σ final_price" value={formatMoney(sumFinalPrice)} strong />
            </div>

            <div className="divide-y rounded-md border">
              {provider === "yalidine" && (
                <BreakdownRow
                  label="Yalidine parcel charge (0.75%)"
                  hint="Σ (final_price − final_price × 0.9925)"
                  value={formatMoney(breakdown.sum_carrier_charge)}
                />
              )}
              <BreakdownRow
                label="Carrier delivery fees"
                hint="Σ first_delivery_cost"
                value={formatMoney(breakdown.sum_first_delivery_cost)}
              />
              <BreakdownRow
                label="Cost of goods sold"
                hint="Σ quantity × first_price of confirmed items"
                value={formatMoney(breakdown.sum_cogs)}
              />
              <BreakdownRow
                label="Benefit"
                hint={
                  provider === "yalidine"
                    ? "final_price × 0.9925 − cost of goods − first_delivery_cost"
                    : "final_price − cost of goods − first_delivery_cost"
                }
                value={formatMoney(benefit)}
                strong
              />
            </div>

            {ordersWithoutItems > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100">
                {provider === "yalidine"
                  ? `${ordersWithoutItems} order(s) have no confirmed items: they are included in the amount but not in the benefit.`
                  : `${ordersWithoutItems} delivered Noest order(s) have no confirmed items and are excluded from the amount and the benefit.`}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setProvider(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
