
import {
    Card, CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Commission } from "@/models/data/affiliate/commission.model";
import { Payment } from "@/models/data/affiliate/payment.model";
import { getCommissions, getPayments } from "@/services/affiliate-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 text-sm shadow-sm text-popover-foreground">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{`Earnings: ${formatCurrency(payload[0].value as number)}`}</p>
      </div>
    );
  }
  return null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount);
};

const generateChartData = (commissions: Commission[]) => {
  // Group commissions by month
  const monthlyData: Record<string, number> = {};
  
  commissions.forEach((commission) => {
    const date = new Date(commission.CreatedAt);
    const monthKey = date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short" 
    });
    
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + commission.amount;
  });

  // Convert to chart format and sort by date
  return Object.entries(monthlyData)
    .map(([month, earnings]) => ({ name: month, earnings }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    .slice(-6); // Last 6 months
};

export const AffiliateDashboardPage = () => {
  // Fetch commissions data
  const {
    data: commissionsResponse,
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useQuery({
    queryKey: ["affiliate-commissions", 1, 100], // Get more data for better analytics
    queryFn: () => getCommissions({ page: 1, limit: 100 }),
  });

  // Fetch payments data
  const {
    data: paymentsResponse,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ["affiliate-payments", 1, 100],
    queryFn: () => getPayments({ page: 1, limit: 100 }),
  });

  const commissions = commissionsResponse?.data?.commissions || [];
  const payments = paymentsResponse?.data?.payments || [];

  // Calculate metrics
  const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidEarnings = payments
    .filter((p: Payment) => p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayout = commissions
    .filter((c) => c.status === "approved" || c.status === "pending")
    .reduce((sum, c) => sum + (c.amount - c.paid_amount), 0);
  const totalReferrals = commissions.length;

  // Generate chart data
  const chartData = generateChartData(commissions);

  const isLoading = commissionsLoading || paymentsLoading;
  const hasError = commissionsError || paymentsError;

  if (hasError) {
    return (
      <div className="space-y-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Failed to load dashboard data. Please try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalEarnings)}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              From all commissions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Paid Out
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(paidEarnings)}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              {paidEarnings > 0 && totalEarnings > 0
                ? `${((paidEarnings / totalEarnings) * 100).toFixed(1)}% of total`
                : "No payments yet"
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Pending Payout
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(pendingPayout)}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {totalReferrals.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Commission{totalReferrals !== 1 ? "s" : ""} earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Trends Chart */}
      <Card className="shadow-sm border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Commission Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your commission earnings over the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No commission data yet</p>
                <p className="text-sm">Start referring customers to see your earnings trends!</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                  name="Earnings"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Recent Commissions</CardTitle>
            <CardDescription>
              Your latest commission activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : commissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No commissions yet</p>
            ) : (
              <div className="space-y-3">
                {commissions.slice(0, 3).map((commission) => (
                  <div key={commission.ID} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Commission #{commission.ID}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(commission.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(commission.amount)}</p>
                      <p className="text-xs text-gray-500 capitalize">{commission.status}</p>
                    </div>
                  </div>
                ))}
                {commissions.length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{commissions.length - 3} more commissions
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>
              Your latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments
                  .filter((p: Payment) => p.amount > 0)
                  .slice(0, 3)
                  .map((payment) => (
                    <div key={payment.ID} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Payment #{payment.ID}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.payment_date || payment.CreatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          +{formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{payment.payment_method}</p>
                      </div>
                    </div>
                  ))}
                {payments.filter((p: Payment) => p.amount > 0).length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{payments.filter((p: Payment) => p.amount > 0).length - 3} more payments
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 