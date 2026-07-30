import { RootState } from "@/app/store";
import { ExitBill } from "@/models/data/bill.model";
import { getCompanyExitBills } from "@/services/bill-service";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DateRangePickerCard from "./date-range-picker-card";
import FranchiseCard from "./franchise-card";
import SummaryInsights from "./summary-insights";

export default function () {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const isAdmin = !isModerator;
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const { data } = useQuery({
    enabled: !!company,
    queryKey: ["franchises"],
    queryFn: () => getMyCompanyFranchises(company?.ID ?? 0),
  });

  const { data: preparingBillsData } = useQuery({
    enabled: !!company,
    queryKey: ["preparing-exit-bills", company?.ID],
    queryFn: () => getCompanyExitBills(company?.ID ?? 0, { status: "preparing" }),
  });

  const preparingByFranchise = useMemo(() => {
    const map = new Map<number, ExitBill[]>();
    for (const bill of preparingBillsData?.data ?? []) {
      const list = map.get(bill.franchise_id) ?? [];
      list.push(bill);
      map.set(bill.franchise_id, list);
    }
    return map;
  }, [preparingBillsData?.data]);

  return (
    <div className="space-y-6">
      {/* Admin-only date range picker and summary insights */}
      {isAdmin && (
        <>
          <DateRangePickerCard 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
          {dateRange?.from && dateRange?.to && data?.data && (
            <SummaryInsights 
              franchises={data.data} 
              dateRange={{
                from: dateRange.from,
                to: dateRange.to
              }} 
            />
          )}
        </>
      )}
      
      {/* Franchise cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4 max-w-6xl">
        {data?.data?.map((franchise, index) => (
          <FranchiseCard 
            key={index} 
            franchise={franchise} 
            preparingExitBills={preparingByFranchise.get(franchise.ID) ?? []}
            dateRange={dateRange ? {
              from: dateRange.from,
              to: dateRange.to
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
