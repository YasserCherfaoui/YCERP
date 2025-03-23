import { RootState } from "@/app/store";
import { franchiseSalesColumns } from "@/components/feature-specific/company-franchise/franchise-sales/franchise-sale-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanyFranchiseSales,
  getCompanyFranchiseSalesTotal,
} from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
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
  const { data } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getCompanyFranchiseSales(franchise.ID),
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
        columns={franchiseSalesColumns}
        searchColumn="sale_id"
      />
    </div>
  );
}
