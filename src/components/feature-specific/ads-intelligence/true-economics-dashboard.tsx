import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdsModelFunnelRow, AdsTrueEconomicsRow } from "@/models/data/ads-intelligence/chat.model";
import { cn } from "@/lib/utils";
import { BarChart3, ChevronDown, Info } from "lucide-react";
import { useMemo, useState } from "react";

type PlatformFilter = "all" | "meta" | "tiktok";

const STORE_CURRENCY = "DZD";

const metricHelp: { label: string; detail: string }[] = [
  {
    label: "Spend",
    detail: "Ad spend in the ad account currency (USD, EUR, DZD, and so on).",
  },
  {
    label: "Orders",
    detail: "WooCommerce orders attributed to the campaign through UTM content.",
  },
  {
    label: "Confirmed",
    detail: "Attributed orders that left the unconfirmed or cancelled state.",
  },
  {
    label: "Delivered",
    detail: "Attributed orders marked delivered. This is the real outcome, not the click.",
  },
  {
    label: "Returned",
    detail: "Attributed orders in returning or returned status.",
  },
  {
    label: "Collected",
    detail: "Cash collected on delivered orders, in DZD.",
  },
  {
    label: "COGS",
    detail: "Product cost of the units that were actually delivered, in DZD.",
  },
  {
    label: "Shipping",
    detail: "Outbound shipping cost on those orders, in DZD.",
  },
  {
    label: "Net profit",
    detail: "Collected cash minus delivered COGS, shipping, and ad spend. Meaningful when spend is also in DZD.",
  },
  {
    label: "Cost / delivered",
    detail: "Ad spend divided by delivered orders, in the ad account currency.",
  },
];

function spendCurrency(currency?: string) {
  const code = currency?.trim().toUpperCase();
  return code || STORE_CURRENCY;
}

function formatMoney(value: number, currency = STORE_CURRENCY) {
  const code = spendCurrency(currency);
  try {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value)} ${code}`;
  }
}

function formatSpendTotals(rows: AdsTrueEconomicsRow[]) {
  const byCurrency = new Map<string, number>();
  for (const row of rows) {
    const code = spendCurrency(row.currency);
    byCurrency.set(code, (byCurrency.get(code) ?? 0) + row.spend);
  }
  return [...byCurrency.entries()].map(([code, amount]) => formatMoney(amount, code)).join(" · ");
}

function formatRate(value: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function ratio(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function campaignLabel(row: AdsTrueEconomicsRow) {
  const name = row.campaign_name?.trim();
  if (name) return name;
  return `Campaign #${row.campaign_id}`;
}

function ColumnHint({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 text-left font-medium text-muted-foreground"
        >
          {label}
          <Info className="h-3 w-3 shrink-0" aria-hidden />
          <span className="sr-only">{hint}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{hint}</TooltipContent>
    </Tooltip>
  );
}

export default function TrueEconomicsDashboard({
  rows,
  funnel,
  loading,
  error,
}: {
  rows: AdsTrueEconomicsRow[];
  funnel: AdsModelFunnelRow[];
  loading: boolean;
  error: string | null;
}) {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(
    () => (platform === "all" ? rows : rows.filter((row) => row.platform === platform)),
    [platform, rows],
  );

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        acc.spend += row.spend;
        acc.orders += row.orders_received;
        acc.confirmed += row.confirmed;
        acc.delivered += row.delivered;
        acc.returned += row.returned;
        acc.collected += row.collected_cash;
        acc.cogs += row.delivered_cogs;
        acc.shipping += row.shipping_cost;
        acc.profit += row.net_profit;
        return acc;
      },
      {
        spend: 0,
        orders: 0,
        confirmed: 0,
        delivered: 0,
        returned: 0,
        collected: 0,
        cogs: 0,
        shipping: 0,
        profit: 0,
      },
    );
  }, [filtered]);

  const selected =
    filtered.find((row) => row.campaign_id === selectedId) ?? filtered[0] ?? null;
  const selectedFunnel = selected
    ? funnel.filter((row) => row.campaign_id === selected.campaign_id)
    : [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight">Campaign economics</h2>
              <p className="text-xs text-muted-foreground">
                Spend stays in the ad account currency. Cash, cost, and margin are in DZD.
              </p>
            </div>
          </div>
          <div className="inline-flex rounded-lg bg-muted p-1" role="group" aria-label="Platform">
            {(
              [
                ["all", "All"],
                ["meta", "Meta"],
                ["tiktok", "TikTok"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={platform === value}
                className={cn(
                  "shadow-none",
                  platform === value && "bg-background text-foreground shadow-sm hover:bg-background",
                )}
                onClick={() => {
                  setPlatform(value);
                  setSelectedId(null);
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <details className="group rounded-lg border bg-background">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="font-medium">How to read these numbers</span>
            <ChevronDown
              className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </summary>
          <dl className="grid gap-3 border-t px-3 py-3 sm:grid-cols-2">
            {metricHelp.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-medium">{item.label}</dt>
                <dd className="text-sm leading-6 text-muted-foreground">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </details>

        {loading && (
          <div className="space-y-3" aria-label="Loading campaign economics">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-start gap-4 py-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" aria-hidden />
            </span>
            <div className="max-w-lg space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">No attributed campaigns yet</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Add credentials in Settings, run a platform sync, and make sure store orders include the campaign id in UTM content.
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Ad spend"
                value={formatSpendTotals(filtered)}
                hint="Sum of campaign spend, kept in each account currency"
              />
              <SummaryCard
                label="Collected cash"
                value={formatMoney(totals.collected)}
                hint="Cash taken on delivered orders, in DZD"
              />
              <SummaryCard
                label="Net profit"
                value={formatMoney(totals.profit)}
                hint="Collected − COGS − shipping − spend. Spend is only in DZD when the account is."
                tone={totals.profit >= 0 ? "positive" : "negative"}
              />
              <SummaryCard
                label="Cost per delivered order"
                value={
                  new Set(filtered.map((row) => spendCurrency(row.currency))).size === 1
                    ? formatMoney(
                        ratio(totals.spend, totals.delivered),
                        spendCurrency(filtered[0]?.currency),
                      )
                    : "Mixed currencies"
                }
                hint="Spend divided by delivered orders, in the ad account currency"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Orders received" value={String(totals.orders)} hint="Attributed Woo orders" />
              <SummaryCard
                label="Confirmation rate"
                value={formatRate(ratio(totals.confirmed, totals.orders))}
                hint={`${totals.confirmed} confirmed of ${totals.orders} orders`}
              />
              <SummaryCard
                label="Delivery rate"
                value={formatRate(ratio(totals.delivered, totals.confirmed))}
                hint={`${totals.delivered} delivered of ${totals.confirmed} confirmed`}
              />
              <SummaryCard
                label="Return rate"
                value={formatRate(ratio(totals.returned, totals.confirmed))}
                hint={`${totals.returned} returned of ${totals.confirmed} confirmed`}
              />
            </div>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Campaigns</h3>
                <p className="text-xs text-muted-foreground">
                  Select a row to see which product models were confirmed and delivered.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                  <TableHeader className="bg-muted/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wide">Campaign</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Platform</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Currency</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">
                        <ColumnHint label="Spend" hint={metricHelp[0].detail} />
                      </TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Orders</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Confirmed</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Delivered</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Returned</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Confirm %</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Deliver %</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Return %</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Collected</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">COGS</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Shipping</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Net profit</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Cost / delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => {
                      const active = selected?.campaign_id === row.campaign_id;
                      return (
                        <TableRow
                          key={`${row.platform}-${row.campaign_id}`}
                          data-state={active ? "selected" : undefined}
                          className="cursor-pointer even:bg-muted/30 data-[state=selected]:bg-primary/10"
                          onClick={() => setSelectedId(row.campaign_id)}
                        >
                          <TableCell className="max-w-[220px]">
                            <p className="truncate font-medium">{campaignLabel(row)}</p>
                            <p className="text-xs text-muted-foreground">#{row.campaign_id}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={row.platform === "meta" ? "default" : "secondary"}>
                              {row.platform}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{spendCurrency(row.currency)}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(row.spend, row.currency)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{row.orders_received}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.confirmed}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.delivered}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.returned}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatRate(row.confirmation_rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatRate(row.delivery_rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatRate(row.return_rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(row.collected_cash)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(row.delivered_cogs)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(row.shipping_cost)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium tabular-nums",
                              row.net_profit >= 0
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-destructive",
                            )}
                          >
                            {formatMoney(row.net_profit)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(row.real_cost_per_delivered, row.currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>

            {selected && (
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Models in {campaignLabel(selected)}</h3>
                  <p className="text-xs text-muted-foreground">
                    Confirmed quantity is what the team accepted. Revenue, cost, and margin are in DZD and count delivered units only.
                  </p>
                </div>
                {selectedFunnel.length === 0 ? (
                  <p className="text-sm leading-7 text-muted-foreground">
                    No product lines are linked to this campaign yet. Confirmed order items need a product and the same UTM attribution as the campaign.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg border bg-background">
                    <Table>
                      <TableHeader className="bg-muted/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs uppercase tracking-wide">Model</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Confirmed qty</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Delivered qty</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Confirm → deliver</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Delivered revenue</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Delivered COGS</TableHead>
                          <TableHead className="text-right text-xs uppercase tracking-wide">Gross margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFunnel.map((row) => (
                          <TableRow key={`${row.campaign_id}-${row.product_id}`} className="even:bg-muted/30">
                            <TableCell>
                              <p className="font-medium">{row.model_name || `Product #${row.product_id}`}</p>
                              <p className="text-xs text-muted-foreground">#{row.product_id}</p>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{row.qty_confirmed}</TableCell>
                            <TableCell className="text-right tabular-nums">{row.qty_delivered}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatRate(row.confirm_to_deliver_rate)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(row.delivered_revenue)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(row.delivered_cogs)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-medium tabular-nums",
                                row.gross_margin >= 0
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-destructive",
                              )}
                            >
                              {formatMoney(row.gross_margin)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight tabular-nums",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}
