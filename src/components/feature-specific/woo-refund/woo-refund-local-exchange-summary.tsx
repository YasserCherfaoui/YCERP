import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { cn } from "@/lib/utils";
import {
  formatRefundDZD,
  formatRefundVariantLabel,
  localExchangeCashDelta,
  sumExchangeItemLines,
  sumRefundItemLines,
} from "./woo-refund-display-utils";

type Props = {
  refund: FranchiseWooRefund;
  /** Compact layout for table cells */
  compact?: boolean;
  className?: string;
};

function LineList({
  title,
  lines,
  compact,
}: {
  title: string;
  lines: { key: number; label: string; qty: number; unit: number; discount?: number; total: number }[];
  compact?: boolean;
}) {
  if (lines.length === 0) {
    return null;
  }
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <p
        className={cn(
          "font-medium text-muted-foreground",
          compact ? "text-[10px] uppercase tracking-wide" : "text-xs"
        )}
      >
        {title}
      </p>
      <ul className={cn("space-y-0.5", compact ? "text-xs" : "text-sm")}>
        {lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-2">
            <span className="truncate min-w-0" title={line.label}>
              {line.label}
              <span className="text-muted-foreground"> ×{line.qty}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              {formatRefundDZD(line.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WooRefundLocalExchangeSummary({
  refund,
  compact = false,
  className,
}: Props) {
  if (refund.resolution_type !== "local_exchange") {
    return null;
  }

  const returnedLines =
    refund.items?.map((item) => ({
      key: item.ID,
      label: formatRefundVariantLabel(item.product_variant, item.product_variant_id),
      qty: item.quantity,
      unit: item.unit_price,
      total: item.line_total,
    })) ?? [];

  const exchangeLines =
    refund.exchange_items?.map((item) => ({
      key: item.ID,
      label: formatRefundVariantLabel(item.product_variant, item.product_variant_id),
      qty: item.quantity,
      unit: item.unit_price,
      discount: item.discount,
      total: item.line_total,
    })) ?? [];

  const returnedTotal = sumRefundItemLines(refund.items);
  const exchangeTotal = sumExchangeItemLines(refund.exchange_items);
  const cash = localExchangeCashDelta(refund);

  return (
    <div className={cn(compact ? "space-y-2 max-w-md" : "space-y-4", className)}>
      <LineList title="Returned" lines={returnedLines} compact={compact} />
      <LineList title="Exchange out" lines={exchangeLines} compact={compact} />

      <div
        className={cn(
          "rounded-md border bg-muted/30 space-y-1",
          compact ? "p-2 text-xs" : "p-3 text-sm"
        )}
      >
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Returned value</span>
          <span className="tabular-nums font-medium">
            {formatRefundDZD(returnedTotal)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Exchange value</span>
          <span className="tabular-nums font-medium">
            {formatRefundDZD(exchangeTotal)}
          </span>
        </div>
        {(cash.pays > 0 || cash.receives > 0) && (
          <>
            {cash.pays > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Customer pays franchise</span>
                <span className="tabular-nums">{formatRefundDZD(cash.pays)}</span>
              </div>
            )}
            {cash.receives > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  Customer receives from franchise
                </span>
                <span className="tabular-nums">{formatRefundDZD(cash.receives)}</span>
              </div>
            )}
          </>
        )}
        <div
          className={cn(
            "flex justify-between gap-2 border-t pt-1 font-medium",
            compact && "text-xs"
          )}
        >
          <span>Value delta (exchange − returned)</span>
          <span className="tabular-nums">
            {formatRefundDZD(exchangeTotal - returnedTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
