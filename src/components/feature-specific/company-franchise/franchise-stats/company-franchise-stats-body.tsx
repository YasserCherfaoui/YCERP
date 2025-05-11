import { RootState } from "@/app/store";
import { franchiseStatsColumns } from "@/components/feature-specific/company-franchise/franchise-stats/franchise-stats-columns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getProductSalesByFranchise } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(0);
  const { data } = useQuery({
    queryKey: [
      "product-sales",
      franchise?.ID || 0,
      date?.from || new Date(),
      date?.to || new Date(),
      currentPage,
    ],
    queryFn: () =>
      getProductSalesByFranchise({
        company_id: franchise?.ID || 0,
        start_date: date?.from || new Date(),
        end_date: date?.to || new Date(),
        page: currentPage + 1,
      }),
    enabled: !!franchise?.ID && !!date?.from && !!date?.to,
  });

  return (
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
          columns={franchiseStatsColumns}
          data={data?.data?.products || []}
          searchColumn="name"
          paginationMeta={data?.data?.pagination}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
        />
      </CardContent>
    </Card>
  );
}
