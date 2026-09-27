import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Info } from "lucide-react";
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
          className="inline-flex items-center gap-1 text-left font-medium text-muted-foreground"
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
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What this dashboard measures</CardTitle>
            <CardDescription>
              Each row is one ad campaign. Spend is shown in the ad account currency. Collected
              cash, product cost, shipping, and model margin are in DZD. Profit subtracts spend
              from those DZD amounts, so compare them only when the account currency is also DZD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metricHelp.map((item) => (
                <div key={item.label} className="rounded-md border border-border bg-muted/30 px-3 py-2">
                  <dt className="text-sm font-medium">{item.label}</dt>
                  <dd className="text-xs text-muted-foreground">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All platforms"],
              ["meta", "Meta"],
              ["tiktok", "TikTok"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={platform === value ? "default" : "outline"}
              onClick={() => {
                setPlatform(value);
                setSelectedId(null);
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No attributed campaigns yet. Add credentials in Settings, run a platform sync, and
              make sure store orders include the campaign id in UTM content.
            </CardContent>
          </Card>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign economics</CardTitle>
                <CardDescription>
                  Select a row to see which product models were confirmed and delivered under that
                  campaign.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">
                        <ColumnHint label="Spend" hint={metricHelp[0].detail} />
                      </TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Confirmed</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Returned</TableHead>
                      <TableHead className="text-right">Confirm %</TableHead>
                      <TableHead className="text-right">Deliver %</TableHead>
                      <TableHead className="text-right">Return %</TableHead>
                      <TableHead className="text-right">Collected</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Shipping</TableHead>
                      <TableHead className="text-right">Net profit</TableHead>
                      <TableHead className="text-right">Cost / delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => {
                      const active = selected?.campaign_id === row.campaign_id;
                      return (
                        <TableRow
                          key={`${row.platform}-${row.campaign_id}`}
                          data-state={active ? "selected" : undefined}
                          className="cursor-pointer"
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
              </CardContent>
            </Card>

            {selected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Models in {campaignLabel(selected)}</CardTitle>
                  <CardDescription>
                    Confirmed quantity is what the team accepted. Delivered revenue, cost, and margin
                    are in DZD and only count units that reached the customer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFunnel.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No product lines are linked to this campaign yet. Confirmed order items need a
                      product and the same UTM attribution as the campaign.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead className="text-right">Confirmed qty</TableHead>
                          <TableHead className="text-right">Delivered qty</TableHead>
                          <TableHead className="text-right">Confirm → deliver</TableHead>
                          <TableHead className="text-right">Delivered revenue</TableHead>
                          <TableHead className="text-right">Delivered COGS</TableHead>
                          <TableHead className="text-right">Gross margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFunnel.map((row) => (
                          <TableRow key={`${row.campaign_id}-${row.product_id}`}>
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
                  )}
                </CardContent>
              </Card>
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
    <Card>
      <CardHeader className="space-y-1 p-4 pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn(
            "text-2xl tabular-nums",
            tone === "positive" && "text-emerald-700 dark:text-emerald-400",
            tone === "negative" && "text-destructive",
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
