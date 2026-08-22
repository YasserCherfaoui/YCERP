import { RootState } from "@/app/store";
import CompanySalesActionsDropdown from "@/components/feature-specific/moderator/user-sales/user-sales-actions-dropdown";
import {
  createSaleExchangeColumns,
  createSaleReturnColumns,
  mapExchangesToRows,
  mapReturnsToRows,
} from "@/components/feature-specific/sales/sale-activity-columns";
import {
  applySalesDateRange,
  SalesActivityTabs,
} from "@/components/feature-specific/sales/sales-activity-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanySaleExchanges,
  getCompanySaleReturns,
  getCompanySales,
  getSalesCount,
  getSalesTotal,
} from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { companySalesColumns } from "./user-sales-columns";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
  if (!company) return;

  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const datesEnabled = !!dateRange.from && !!dateRange.to;

  const { data: todayTotal } = useQuery({
    queryKey: ["sales-total-today", company.ID],
    queryFn: () =>
      getSalesTotal(company.ID, startOfDay(new Date()), endOfDay(new Date())),
  });

  const { data: rangeTotal } = useQuery({
    queryKey: ["sales-total-range", company.ID, dateRange.from, dateRange.to],
    queryFn: () => getSalesTotal(company.ID, dateRange.from, dateRange.to),
    enabled: datesEnabled,
  });

  const { data: rangeSalesCount } = useQuery({
    queryKey: ["sales-count-range", company.ID, dateRange.from, dateRange.to],
    queryFn: () =>
      getSalesCount({
        company_id: company.ID.toString(),
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        sale_type: "warehouse",
      }),
    enabled: datesEnabled,
  });

  const { data } = useQuery({
    queryKey: ["sales", company.ID, "warehouse", dateRange.from, dateRange.to],
    queryFn: () => getCompanySales(company.ID, dateRange),
    enabled: datesEnabled,
  });
  const { data: returnsData } = useQuery({
    queryKey: ["sales", "returns", company.ID, "warehouse", dateRange.from, dateRange.to],
    queryFn: () => getCompanySaleReturns(company.ID, dateRange, "warehouse"),
    enabled: datesEnabled,
  });
  const { data: exchangesData } = useQuery({
    queryKey: ["sales", "exchanges", company.ID, "warehouse", dateRange.from, dateRange.to],
    queryFn: () => getCompanySaleExchanges(company.ID, dateRange, "warehouse"),
    enabled: datesEnabled,
  });
  const { toast } = useToast();

  const returnsColumns = useMemo(
    () =>
      createSaleReturnColumns((sale) =>
        sale ? <CompanySalesActionsDropdown sale={sale} /> : null
      ),
    []
  );
  const exchangesColumns = useMemo(
    () =>
      createSaleExchangeColumns((sale) =>
        sale ? <CompanySalesActionsDropdown sale={sale} /> : null
      ),
    []
  );

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, [data?.data, toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(todayTotal?.data?.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Range Sales Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerWithRange
              date={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => applySalesDateRange(range, setDateRange)}
            />
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(rangeTotal?.data?.total_amount || 0)}
            </p>
            <div className="text-lg text-white flex items-center gap-2">
              <p>
                <span className="font-bold">
                  {rangeSalesCount?.data?.sales_count}
                </span>{" "}
                sales
              </p>
              <p>
                <span className="font-bold">
                  {rangeSalesCount?.data?.sale_items_count}
                </span>{" "}
                items
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />

      <SalesActivityTabs
        sales={data?.data ?? []}
        returnsRows={mapReturnsToRows(returnsData?.data)}
        exchangesRows={mapExchangesToRows(exchangesData?.data)}
        salesColumns={companySalesColumns}
        returnsColumns={returnsColumns}
        exchangesColumns={exchangesColumns}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
}
