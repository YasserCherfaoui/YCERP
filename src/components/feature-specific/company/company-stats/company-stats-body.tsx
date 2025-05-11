import { RootState } from "@/app/store";
import { companyPurchasesColumns } from "@/components/feature-specific/company/company-stats/company-purchases-columns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getProductPurchases, getProductSales } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { CalendarIcon, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { companyStatsColumns } from "./company-stats-columns";

export default function CompanyStatsBody() {
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) {
    return <div>No company selected</div>;
  }
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(0);
  const { data } = useQuery({
    queryKey: [
      "product-sales",
      company?.ID || 0,
      date?.from || new Date(),
      date?.to || new Date(),
      currentPage,
    ],
    queryFn: () =>
      getProductSales({
        company_id: company?.ID || 0,
        start_date: date?.from || new Date(),
        end_date: date?.to || new Date(),
        page: currentPage + 1,
      }),
    enabled: !!company?.ID && !!date?.from && !!date?.to,
  });

  const { data: purchasesData } = useQuery({
    queryKey: [
      "product-purchases",
      company?.ID || 0,
      date?.from || new Date(),
      date?.to || new Date(),
      currentPage,
    ],
    queryFn: () =>
      getProductPurchases({
        company_id: company?.ID || 0,
        start_date: date?.from || new Date(),
        end_date: date?.to || new Date(),
        page: currentPage + 1,
      }),
    enabled: !!company?.ID && !!date?.from && !!date?.to,
  });
  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList className="mb-4 w-full flex">
        <TabsTrigger value="sales" className="flex-1 flex items-center gap-2 justify-center">
          <ShoppingCart className="w-4 h-4" />
          Sales Totals
        </TabsTrigger>
        <TabsTrigger value="purchases" className="flex-1 flex items-center gap-2 justify-center">
          <Package className="w-4 h-4" />
          Purchases Totals
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Stats</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={companyStatsColumns}
              data={data?.data?.products || []}
              searchColumn="name"
              paginationMeta={data?.data?.pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="purchases">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Purchases Totals
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={companyPurchasesColumns}
              data={purchasesData?.data?.products || []}
              searchColumn="name"
              paginationMeta={purchasesData?.data?.pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
