import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyFranchiseSalesTotal } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { DollarSign, Package, TrendingUp } from "lucide-react";

interface FranchiseInsightsProps {
  franchiseId: number;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export default function FranchiseInsights({ franchiseId, dateRange }: FranchiseInsightsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["franchise-insights", franchiseId, dateRange.from, dateRange.to],
    queryFn: () => {
      if (!dateRange.from || !dateRange.to) return Promise.resolve(null);
      return getCompanyFranchiseSalesTotal(
        franchiseId, 
        startOfDay(dateRange.from), 
        endOfDay(dateRange.to)
      );
    },
    enabled: !!franchiseId && !!dateRange.from && !!dateRange.to,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to load insights
      </div>
    );
  }

  const { total_amount, total_benefit, total_franchise_price } = data.data;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="text-muted-foreground">Total Amount:</span>
        </div>
        <span className="font-medium">{total_amount.toLocaleString()} DA</span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-blue-600" />
          <span className="text-muted-foreground">Benefit:</span>
        </div>
        <span className="font-medium">{total_benefit.toLocaleString()} DA</span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-orange-600" />
          <span className="text-muted-foreground">Franchise Price:</span>
        </div>
        <span className="font-medium">{total_franchise_price.toLocaleString()} DA</span>
      </div>
    </div>
  );
}
