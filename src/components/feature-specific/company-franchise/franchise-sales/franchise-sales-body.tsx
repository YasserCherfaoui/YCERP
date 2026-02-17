import { RootState } from "@/app/store";
import {
  franchiseExchangesColumns,
  SaleExchangeRow,
} from "@/components/feature-specific/company-franchise/franchise-sales/franchise-exchanges-columns";
import { franchiseSalesColumns } from "@/components/feature-specific/company-franchise/franchise-sales/franchise-sale-columns";
import {
  franchiseReturnsColumns,
  SaleReturnRow,
} from "@/components/feature-specific/company-franchise/franchise-sales/franchise-returns-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanyFranchiseSales,
  getCompanyFranchiseSalesTotal,
} from "@/services/franchise-service";
import { getSalesCount } from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { RefreshCw, ShoppingBag, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

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

  // Query for today's total
  const { data: todayTotal } = useQuery({
    queryKey: ["franchise-sales-total-today", franchise.ID],
    queryFn: () =>
      getCompanyFranchiseSalesTotal(
        franchise.ID,
        startOfDay(new Date()),
        endOfDay(new Date())
      ),
  });

  // Query for custom date range total
  const { data: rangeTotal } = useQuery({
    queryKey: [
      "franchise-sales-total-range",
      franchise.ID,
      dateRange.from,
      dateRange.to,
    ],
    queryFn: () =>
      getCompanyFranchiseSalesTotal(franchise.ID, dateRange.from, dateRange.to),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Query for today's sales count
  const { data: salesCount } = useQuery({
    queryKey: ["sales-count", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () =>
      getSalesCount({
        franchise_id: franchise.ID.toString(),
        start_date: startOfDay(new Date()).toISOString(),
        end_date: endOfDay(new Date()).toISOString(),
        sale_type: "franchise",
      }),
    enabled: !!dateRange.from && !!dateRange.to,
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
    enabled: !!dateRange.from && !!dateRange.to,
  });
  const { data } = useQuery({
    queryKey: ["sales", franchise.ID],
    queryFn: () => getCompanyFranchiseSales(franchise.ID),
  });
  const { toast } = useToast();

  const sales = data?.data ?? [];
  const fromTime = dateRange.from.getTime();
  const toTime = dateRange.to.getTime();

  const filteredSales = useMemo(
    () =>
      sales.filter((s) => {
        const t = new Date(s.CreatedAt).getTime();
        return t >= fromTime && t <= toTime;
      }),
    [sales, fromTime, toTime]
  );

  const returnsRows = useMemo((): SaleReturnRow[] => {
    const rows: SaleReturnRow[] = [];
    sales.forEach((sale) => {
      const r = sale.return;
      if (!r || r.exchange) return;
      const t = new Date(r.CreatedAt).getTime();
      if (t >= fromTime && t <= toTime) rows.push({ sale, return: r });
    });
    return rows.sort(
      (a, b) =>
        new Date(b.return.CreatedAt).getTime() -
        new Date(a.return.CreatedAt).getTime()
    );
  }, [sales, fromTime, toTime]);

  const exchangesRows = useMemo((): SaleExchangeRow[] => {
    const rows: SaleExchangeRow[] = [];
    sales.forEach((sale) => {
      const r = sale.return;
      const ex = r?.exchange;
      if (!ex) return;
      const t = new Date(ex.CreatedAt).getTime();
      if (t >= fromTime && t <= toTime && r)
        rows.push({ sale, return: r, exchange: ex });
    });
    return rows.sort(
      (a, b) =>
        new Date(b.exchange.CreatedAt).getTime() -
        new Date(a.exchange.CreatedAt).getTime()
    );
  }, [sales, fromTime, toTime]);

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, data?.data);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-lg text-white flex items-center gap-2">
              <p>
                <span className="font-bold">
                  {salesCount?.data?.sales_count}
                </span>{" "}
                sales
              </p>
              <p>
                <span className="font-bold">
                  {salesCount?.data?.sale_items_count}
                </span>{" "}
                items
              </p>
            </div>
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

        <Card className={`${isModerator ? "hidden" : ""}`}>
          <CardHeader>
            <CardTitle>Custom Range Sales Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerWithRange
              date={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({
                    from: startOfDay(range.from),
                    to: endOfDay(range.to),
                  });
                }
              }}
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
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({
                    from: startOfDay(range.from),
                    to: endOfDay(range.to),
                  });
                }
              }}
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Date range for tables:
          </span>
          <DatePickerWithRange
            date={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({
                  from: startOfDay(range.from),
                  to: endOfDay(range.to),
                });
              }
            }}
          />
        </div>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <Undo2 className="h-4 w-4" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="exchanges" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Exchanges
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sales" className="mt-4">
            <DataTable
              data={filteredSales.sort(
                (a, b) =>
                  new Date(b.CreatedAt).getTime() -
                  new Date(a.CreatedAt).getTime()
              )}
              columns={franchiseSalesColumns}
              searchColumn="sale_id"
            />
          </TabsContent>
          <TabsContent value="returns" className="mt-4">
            <DataTable
              data={returnsRows}
              columns={franchiseReturnsColumns}
              searchColumn="sale_id"
            />
          </TabsContent>
          <TabsContent value="exchanges" className="mt-4">
            <DataTable
              data={exchangesRows}
              columns={franchiseExchangesColumns}
              searchColumn="sale_id"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
