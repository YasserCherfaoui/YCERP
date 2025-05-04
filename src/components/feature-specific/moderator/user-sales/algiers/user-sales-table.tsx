import { RootState } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getAlgiersSalesTotal,
  getCompanyAlgiersSales,
} from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { companySalesColumns } from "./user-sales-columns";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
  if (!company) return;


  // Query for today's total
  const { data: todayTotal } = useQuery({
    queryKey: ["sales-total-today", company.ID],
    queryFn: () =>
      getAlgiersSalesTotal(
        company.ID,
        startOfDay(new Date()),
        endOfDay(new Date())
      ),
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
