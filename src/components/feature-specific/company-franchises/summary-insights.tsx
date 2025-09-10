import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Franchise } from "@/models/data/franchise.model";
import { getCompanyFranchiseSalesTotal } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { Building2, DollarSign, Package, TrendingUp } from "lucide-react";

interface SummaryInsightsProps {
  franchises: Franchise[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export default function SummaryInsights({ franchises, dateRange }: SummaryInsightsProps) {
  // Fetch insights for all franchises
  const franchiseInsightsQueries = franchises.map(franchise => 
    useQuery({
      queryKey: ["franchise-insights", franchise.ID, dateRange.from, dateRange.to],
      queryFn: () => {
        if (!dateRange.from || !dateRange.to) return Promise.resolve(null);
        return getCompanyFranchiseSalesTotal(
          franchise.ID, 
          startOfDay(dateRange.from), 
          endOfDay(dateRange.to)
        );
      },
      enabled: !!franchise.ID && !!dateRange.from && !!dateRange.to,
    })
  );

  const isLoading = franchiseInsightsQueries.some(query => query.isLoading);
  const hasError = franchiseInsightsQueries.some(query => query.error);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              Unable to load summary insights
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totals = franchiseInsightsQueries.reduce(
    (acc, query) => {
      if (query.data?.data) {
        acc.totalAmount += query.data.data.total_amount;
        acc.totalBenefit += query.data.data.total_benefit;
        acc.totalFranchisePrice += query.data.data.total_franchise_price;
      }
      return acc;
    },
    { totalAmount: 0, totalBenefit: 0, totalFranchisePrice: 0 }
  );

  const totalFranchises = franchises.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.totalAmount.toLocaleString()} DA</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Benefit</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.totalBenefit.toLocaleString()} DA</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Franchise Price</CardTitle>
          <Package className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.totalFranchisePrice.toLocaleString()} DA</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Franchises</CardTitle>
          <Building2 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFranchises}</div>
        </CardContent>
      </Card>
    </div>
  );
}
