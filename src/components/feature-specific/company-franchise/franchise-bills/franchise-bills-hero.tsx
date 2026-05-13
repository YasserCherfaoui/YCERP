import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  FranchiseBillsDateParams,
  getCompanyFranchisePaymentTotals,
  getSuperFranchiseEntryBills,
  getSuperFranchiseExitBills,
} from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import FranchiseBillsSummaryCards from "./franchise-bills-summary-cards";
import FranchiseBillsTabs from "./franchise-bills-tabs/franchise-bills-tabs";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  const [billDateRange, setBillDateRange] = useState<DateRange | undefined>(
    undefined
  );

  const billDateParams = useMemo((): FranchiseBillsDateParams | undefined => {
    const dateFrom = billDateRange?.from
      ? format(billDateRange.from, "yyyy-MM-dd")
      : undefined;
    const dateTo = billDateRange?.to
      ? format(billDateRange.to, "yyyy-MM-dd")
      : undefined;
    if (!dateFrom && !dateTo) return undefined;
    return { dateFrom, dateTo };
  }, [billDateRange]);

  if (!franchise) return null;

  const { data: exitBills } = useQuery({
    queryKey: ["franchise-exit-bills", franchise.ID, billDateParams],
    queryFn: () => getSuperFranchiseExitBills(franchise.ID, billDateParams),
    enabled: !!franchise,
  });
  const { data: entryBills } = useQuery({
    queryKey: ["franchise-entry-bills", franchise.ID, billDateParams],
    queryFn: () => getSuperFranchiseEntryBills(franchise.ID, billDateParams),
    enabled: !!franchise,
  });
  const { data: paymentTotals } = useQuery({
    queryKey: ["franchise-totals", franchise.ID, billDateParams],
    queryFn: () => getCompanyFranchisePaymentTotals(franchise.ID, billDateParams),
    enabled: !!franchise,
  });

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Optional: same range filters bill lists, due/paid totals, and recent
          payment activity.
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal min-w-[220px]",
                  !billDateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {billDateRange?.from ? (
                  billDateRange.to ? (
                    <>
                      {format(billDateRange.from, "LLL dd, y")} —{" "}
                      {format(billDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(billDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date range (optional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={billDateRange?.from}
                selected={billDateRange}
                onSelect={setBillDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {billDateParams ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBillDateRange(undefined)}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <FranchiseBillsSummaryCards
        exitBills={exitBills}
        entryBills={entryBills}
        paymentTotals={paymentTotals}
      />
      <FranchiseBillsTabs exitBills={exitBills} entryBills={entryBills} />
    </main>
  );
}
