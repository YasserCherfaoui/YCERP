import { RootState } from "@/app/store";
import { franchiseExchangesColumns } from "@/components/feature-specific/company-franchise/franchise-sales/franchise-exchanges-columns";
import { franchiseSalesColumns } from "@/components/feature-specific/company-franchise/franchise-sales/franchise-sale-columns";
import { franchiseReturnsColumns } from "@/components/feature-specific/company-franchise/franchise-sales/franchise-returns-columns";
import FranchiseSalesBreakdownAccordion, {
  buildSalesBreakdownMetrics,
} from "@/components/feature-specific/franchise-sales/franchise-sales-breakdown-cards";
import {
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
  getCompanyFranchiseSaleExchanges,
  getCompanyFranchiseSaleReturns,
  getCompanyFranchiseSales,
  getCompanyFranchiseSalesTotal,
} from "@/services/franchise-service";
import { getSalesCount } from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const emptyBreakdown = {
  salesCount: 0,
  salesAmount: 0,
  returnsCount: 0,
  returnsAmount: 0,
  exchangesCount: 0,
  exchangesAmount: 0,
};

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");

  if (!franchise) return;
  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const datesEnabled = !!dateRange.from && !!dateRange.to;

  // Query for today's total
  const { data: todayTotal, isLoading: todayTotalLoading } = useQuery({
    queryKey: ["franchise-sales-total-today", franchise.ID],
    queryFn: () =>
      getCompanyFranchiseSalesTotal(
        franchise.ID,
        startOfDay(new Date()),
        endOfDay(new Date())
      ),
  });

  // Query for custom date range total
  const { data: rangeTotal, isLoading: rangeTotalLoading } = useQuery({
    queryKey: [
      "franchise-sales-total-range",
      franchise.ID,
      dateRange.from,
      dateRange.to,
    ],
    queryFn: () =>
      getCompanyFranchiseSalesTotal(franchise.ID, dateRange.from, dateRange.to),
    enabled: datesEnabled,
  });

  // Query for today's sales count
  const { data: salesCount } = useQuery({
    queryKey: ["sales-count", franchise.ID],
    queryFn: () =>
      getSalesCount({
        franchise_id: franchise.ID.toString(),
        start_date: startOfDay(new Date()).toISOString(),
        end_date: endOfDay(new Date()).toISOString(),
        sale_type: "franchise",
      }),
  });

  // Query for custom date range sales count
  const {data: rangeSalesCount} = useQuery({
    queryKey: ["sales-count-range", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getSalesCount({
      franchise_id: franchise.ID.toString(),
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      sale_type: "franchise",
    }),
    enabled: datesEnabled,
  });
  const { data } = useQuery({
    queryKey: ["sales", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getCompanyFranchiseSales(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { data: returnsData } = useQuery({
    queryKey: ["sales", "returns", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getCompanyFranchiseSaleReturns(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { data: exchangesData } = useQuery({
    queryKey: ["sales", "exchanges", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getCompanyFranchiseSaleExchanges(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { toast } = useToast();

  const sales = data?.data ?? [];
  const returnsRows = useMemo(
    () => mapReturnsToRows(returnsData?.data),
    [returnsData?.data]
  );
  const exchangesRows = useMemo(
    () => mapExchangesToRows(exchangesData?.data),
    [exchangesData?.data]
  );

  const todayBreakdown = useMemo(
    () => buildSalesBreakdownMetrics(todayTotal?.data, emptyBreakdown),
    [todayTotal?.data]
  );

  const rangeBreakdown = useMemo(
    () => buildSalesBreakdownMetrics(rangeTotal?.data, emptyBreakdown),
    [rangeTotal?.data]
  );

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, [data?.data, toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(todayTotal?.data?.total_amount || 0)}
            </p>
            <div className="text-lg text-muted-foreground flex items-center gap-2">
              <p>
                <span className="font-bold text-foreground">
                  {salesCount?.data?.sales_count}
                </span>{" "}
                sales
              </p>
              <p>
                <span className="font-bold text-foreground">
                  {salesCount?.data?.sale_items_count}
                </span>{" "}
                items
              </p>
            </div>
            <FranchiseSalesBreakdownAccordion
              metrics={todayBreakdown}
              isLoading={todayTotalLoading}
            />
          </CardContent>
        </Card>
        <Card className={`${isModerator ? "hidden" : ""}`}>
          <CardHeader>
            <CardTitle>Today's Company's Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(todayTotal?.data?.total_franchise_price || 0)}
            </p>
            {todayTotal?.data?.total_benefit && !isModerator && (
              <p className="text-green-500 font-bold">
                Benefit:{" "}
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(todayTotal.data.total_benefit)}
              </p>
            )}
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
            <div className="text-lg text-muted-foreground flex items-center gap-2">
              <p>
                <span className="font-bold text-foreground">
                  {rangeSalesCount?.data?.sales_count}
                </span>{" "}
                sales
              </p>
              <p>
                <span className="font-bold text-foreground">
                  {rangeSalesCount?.data?.sale_items_count}
                </span>{" "}
                items
              </p>
            </div>
            <FranchiseSalesBreakdownAccordion
              metrics={rangeBreakdown}
              isLoading={rangeTotalLoading}
            />
          </CardContent>
        </Card>
        <Card className={`${isModerator ? "hidden" : ""}`}>
          <CardHeader>
            <CardTitle>Custom Range Company's Benifits</CardTitle>
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
              }).format(rangeTotal?.data?.total_franchise_price || 0)}
            </p>
            {rangeTotal?.data?.total_benefit && !isModerator && (
              <p className="text-green-500 font-bold">
                Benefit:{" "}
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(rangeTotal.data.total_benefit)}
              </p>
            )}
         
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />

      <SalesActivityTabs
        sales={sales}
        returnsRows={returnsRows}
        exchangesRows={exchangesRows}
        salesColumns={franchiseSalesColumns}
        returnsColumns={franchiseReturnsColumns}
        exchangesColumns={franchiseExchangesColumns}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
}
