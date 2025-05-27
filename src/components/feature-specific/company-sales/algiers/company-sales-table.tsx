import { RootState } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getAlgiersSalesTotal, getCompanyAlgiersSales, getSalesCount } from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { companySalesColumns } from "./company-sales-columns";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) return;

  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // Query for today's total
  const { data: todayTotal } = useQuery({
    queryKey: ["sales-total-today", company.ID],
    queryFn: () =>
      getAlgiersSalesTotal(company.ID, startOfDay(new Date()), endOfDay(new Date())),
  });

  // Query for custom date range total
  const { data: rangeTotal } = useQuery({
    queryKey: ["sales-total-range", company.ID, dateRange.from, dateRange.to],
    queryFn: () => getAlgiersSalesTotal(company.ID, dateRange.from, dateRange.to),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Query for today's sales count
  const { data: salesCount } = useQuery({
    queryKey: ["sales-count", company.ID, dateRange.from, dateRange.to],
    queryFn: () => getSalesCount({
      company_id: company.ID.toString(),
      start_date: startOfDay(new Date()).toISOString(),
      end_date: endOfDay(new Date()).toISOString(),
      sale_type: "algiers",
    }),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Query for custom date range sales count
  const { data: rangeSalesCount } = useQuery({
    queryKey: ["sales-count-range", company.ID, dateRange.from, dateRange.to],
    queryFn: () => getSalesCount({
      company_id: company.ID.toString(),
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      sale_type: "algiers",
    }),
    enabled: !!dateRange.from && !!dateRange.to,
  });
  
  const { data } = useQuery({
    queryKey: ["sales", "algiers"],
    queryFn: () => getCompanyAlgiersSales(company.ID),
  });
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, data?.data);

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
            {todayTotal?.data?.total_benefit && (
              <p className="text-green-500 font-bold">
                Benefit:{" "}
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(todayTotal.data.total_benefit)}
              </p>
            )}
            <div className="text-lg text-white flex items-center gap-2">
              <p>
                <span className="font-bold">{salesCount?.data?.sales_count}</span> sales
              </p>
              <p>
                <span className="font-bold">{salesCount?.data?.sale_items_count}</span> items
              </p>
            </div>
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
            {rangeTotal?.data?.total_benefit && (
              <p className="text-green-500 font-bold">
                Benefit:{" "}
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(rangeTotal.data.total_benefit)}
              </p>
            )}
            <div className="text-lg text-white flex items-center gap-2">
              <p>
                <span className="font-bold">{rangeSalesCount?.data?.sales_count}</span> sales
              </p>
              <p>
                <span className="font-bold">{rangeSalesCount?.data?.sale_items_count}</span> items
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />

      <DataTable
        data={
          data?.data?.sort(
            (a, b) =>
              new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
          ) ?? []
        }
        columns={companySalesColumns}
        searchColumn="sale_id"
      />
    </div>
  );
}
