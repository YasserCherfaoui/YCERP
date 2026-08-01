import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { wooLineItemsSummaryColumns } from "@/components/feature-specific/company-woo-line-items/woo-line-items-summary-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  getWooLineItemsSummary,
  WooLineItemGroup,
} from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function CompanyWooLineItemsSummaryPage() {
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const company = useSelector((state: RootState) =>
    isModerator ? state.user.company : state.company.company
  );

  const today = useMemo(() => {
    const now = new Date();
    return { from: now, to: now } satisfies DateRange;
  }, []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(today);

  const toYmd = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : undefined);
  const start_date = toYmd(dateRange?.from);
  const end_date = toYmd(dateRange?.to ?? dateRange?.from);

  const companyId = company?.ID ?? 0;
  const canFetch = Boolean(companyId && start_date && end_date);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["woo-line-items-summary", companyId, start_date, end_date],
    queryFn: () =>
      getWooLineItemsSummary({
        company_id: companyId,
        start_date: start_date!,
        end_date: end_date!,
      }),
    enabled: canFetch,
  });

  const summary = data?.data;
  const lineItems: WooLineItemGroup[] = summary?.line_items ?? [];
  const ordersCount = summary?.orders_count ?? 0;
  const totalQuantity = summary?.total_quantity ?? 0;

  if (!company) {
    return <div className="p-4">No company selected</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppBarBackButton
            destination={isModerator ? "Menu" : "Control panel"}
          />
          <h1 className="text-xl font-semibold">Web order line items</h1>
        </div>
        <div className="w-full max-w-sm">
          <DatePickerWithRange date={dateRange} onSelect={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders created</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canFetch && !isLoading ? ordersCount.toLocaleString() : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              WooCommerce orders in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Line item quantity
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canFetch && !isLoading ? totalQuantity.toLocaleString() : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total units requested across all line items
            </p>
          </CardContent>
        </Card>
      </div>

      {!canFetch && (
        <p className="text-sm text-muted-foreground">
          Select a date or date range to load summary.
        </p>
      )}
      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load summary"}
        </p>
      )}
      {isLoading && canFetch && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      <DataTable
        columns={wooLineItemsSummaryColumns}
        data={lineItems}
        searchColumn="name"
        searchPlaceholder="Filter by name…"
      />
    </div>
  );
}
