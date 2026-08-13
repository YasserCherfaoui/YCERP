import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { FranchiseSalesTotals } from "@/models/data/franchise.model";
import { Sale } from "@/models/data/sale.model";
import { Banknote, RefreshCw, ShoppingBag, Undo2 } from "lucide-react";

const formatDZD = (amount: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount);

export interface SalesBreakdownMetrics {
  salesCount: number;
  salesAmount: number;
  returnsCount: number;
  returnsAmount: number;
  exchangesCount: number;
  exchangesAmount: number;
  refundsCount: number;
  refundsAmount: number;
}

export function fallbackBreakdownFromSales(
  sales: Sale[],
  fromTime: number,
  toTime: number
): Omit<SalesBreakdownMetrics, "refundsCount" | "refundsAmount"> {
  let salesCount = 0;
  let salesAmount = 0;
  let returnsCount = 0;
  let returnsAmount = 0;
  let exchangesCount = 0;
  let exchangesAmount = 0;

  for (const sale of sales) {
    const soldAt = new Date(sale.CreatedAt).getTime();
    if (soldAt >= fromTime && soldAt <= toTime) {
      salesCount += 1;
      salesAmount += sale.total ?? 0;
    }

    const returned = sale.return;
    if (!returned) continue;

    if (!returned.exchange) {
      const returnedAt = new Date(returned.CreatedAt).getTime();
      if (returnedAt >= fromTime && returnedAt <= toTime) {
        returnsCount += 1;
        returnsAmount += returned.total ?? 0;
      }
      continue;
    }

    const exchangedAt = new Date(returned.exchange.CreatedAt).getTime();
    if (exchangedAt >= fromTime && exchangedAt <= toTime) {
      exchangesCount += 1;
      exchangesAmount += returned.exchange.total ?? 0;
    }
  }

  return {
    salesCount,
    salesAmount,
    returnsCount,
    returnsAmount,
    exchangesCount,
    exchangesAmount,
  };
}

export function buildSalesBreakdownMetrics(
  totals: FranchiseSalesTotals | undefined,
  fallback: Omit<SalesBreakdownMetrics, "refundsCount" | "refundsAmount">
): SalesBreakdownMetrics {
  return {
    salesCount: totals?.sales_count ?? fallback.salesCount,
    salesAmount: totals?.sales_amount ?? fallback.salesAmount,
    returnsCount: totals?.returns_count ?? fallback.returnsCount,
    returnsAmount: totals?.returns_amount ?? fallback.returnsAmount,
    exchangesCount: totals?.exchanges_count ?? fallback.exchangesCount,
    exchangesAmount: totals?.exchanges_amount ?? fallback.exchangesAmount,
    refundsCount: totals?.refunds_count ?? 0,
    refundsAmount: totals?.refunds_amount ?? 0,
  };
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const ROWS: {
  key: keyof Pick<
    SalesBreakdownMetrics,
    "salesCount" | "returnsCount" | "exchangesCount" | "refundsCount"
  >;
  amountKey: keyof Pick<
    SalesBreakdownMetrics,
    "salesAmount" | "returnsAmount" | "exchangesAmount" | "refundsAmount"
  >;
  title: string;
  singular: string;
  plural: string;
  hint?: string;
  icon: typeof ShoppingBag;
}[] = [
  {
    key: "salesCount",
    amountKey: "salesAmount",
    title: "Sales",
    singular: "sale",
    plural: "sales",
    icon: ShoppingBag,
  },
  {
    key: "returnsCount",
    amountKey: "returnsAmount",
    title: "Returns",
    singular: "return",
    plural: "returns",
    icon: Undo2,
  },
  {
    key: "exchangesCount",
    amountKey: "exchangesAmount",
    title: "Exchanges",
    singular: "exchange",
    plural: "exchanges",
    icon: RefreshCw,
  },
  {
    key: "refundsCount",
    amountKey: "refundsAmount",
    title: "Refunds",
    singular: "refund",
    plural: "refunds",
    hint: "Web orders",
    icon: Banknote,
  },
];

interface Props {
  metrics: SalesBreakdownMetrics;
  isLoading?: boolean;
}

export default function FranchiseSalesBreakdownAccordion({
  metrics,
  isLoading,
}: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="breakdown" className="border-b-0">
        <AccordionTrigger className="min-h-11 py-3 text-sm text-muted-foreground hover:no-underline">
          Sales, returns, exchanges, refunds
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div
              className="space-y-3"
              aria-busy="true"
              aria-label="Loading activity totals"
            >
              {ROWS.map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between gap-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-1 text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                    <Skeleton className="ml-auto h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="space-y-3"
              aria-label="Sales, returns, exchanges, and refunds"
            >
              {ROWS.map((row) => {
                const Icon = row.icon;
                const count = metrics[row.key];
                const amount = metrics[row.amountKey];
                return (
                  <div
                    key={row.title}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      {row.title}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatDZD(amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pluralize(count, row.singular, row.plural)}
                        {row.hint ? ` · ${row.hint}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
