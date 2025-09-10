import { RootState } from "@/app/store";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useState } from "react";
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
      <div className="grid grid-cols-3 gap-2 p-4 max-w-6xl">
        {data?.data?.map((franchise, index) => (
          <FranchiseCard 
            key={index} 
            franchise={franchise} 
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
