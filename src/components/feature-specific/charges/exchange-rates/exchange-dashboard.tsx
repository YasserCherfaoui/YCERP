// Exchange rate dashboard component
import { AppDispatch, RootState } from "@/app/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  selectActiveAlerts,
  selectBestWorstRates,
  selectCurrencyPairAnalytics,
  selectCurrentRates,
  selectCurrentRateStatus,
  selectExchangeRateAnalytics,
  // selectMonthlyTrends,
  selectRateTrend,
} from "@/features/charges/exchange-rates-selectors";
import {
  fetchCurrentRates,
  fetchExchangeRateAlerts,
  fetchExchangeRateAnalytics,
  fetchExchangeRateCharges,
  fetchExchangeRateHistory,
} from "@/features/charges/exchange-rates-slice";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
  Plus,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ExchangeCalculator from "./exchange-calculator";

interface RateDisplayProps {
  pair: string;
  rate: number;
  trend?: "increasing" | "decreasing" | "stable";
  change?: number;
  changePercentage?: number;
}

function RateDisplay({ pair, rate, trend, changePercentage }: RateDisplayProps) {
  const [from, to] = pair.split('/');
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">{pair}</div>
            <div className="text-xl font-bold">
              {rate && typeof rate === 'number' && !isNaN(rate) ? rate.toFixed(4) : '0.0000'}
            </div>
            <div className="text-xs text-gray-500">
              1 {from} = {rate && typeof rate === 'number' && !isNaN(rate) ? rate.toFixed(4) : '0.0000'} {to}
            </div>
          </div>
          
          {trend && trend !== 'stable' && (
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              trend === 'increasing' ? "text-green-600" : "text-red-600"
            )}>
              {trend === 'increasing' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {changePercentage && typeof changePercentage === 'number' && !isNaN(changePercentage) && (
                <span>{Math.abs(changePercentage).toFixed(2)}%</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeType?: "currency" | "percentage" | "count";
  positive?: boolean;
  className?: string;
}

function MetricCard({ title, value, icon, change, changeType, positive, className }: MetricCardProps) {
  const formatChange = (change: number, type: string) => {
    switch (type) {
      case "currency":
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'DZD',
          minimumFractionDigits: 0,
        }).format(Math.abs(change));
      case "percentage":
        return change && typeof change === 'number' && !isNaN(change) ? `${Math.abs(change).toFixed(1)}%` : '0.0%';
      case "count":
        return Math.abs(change).toString();
      default:
        return Math.abs(change).toString();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={cn(
                "flex items-center text-sm mt-1",
                positive ? "text-green-600" : "text-red-600"
              )}>
                {positive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                <span>{formatChange(change, changeType || "count")} vs last month</span>
              </div>
            )}
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExchangeDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const company = useSelector((state: RootState) => state.company.company);
  
  // Selectors
  const currentRates = useSelector(selectCurrentRates);
  const analytics = useSelector(selectExchangeRateAnalytics);
  const pairAnalytics = useSelector(selectCurrencyPairAnalytics);
  // const sourcePerformance = useSelector(selectSourcePerformance);
  // const monthlyTrends = useSelector(selectMonthlyTrends);
  const bestWorstRates = useSelector(selectBestWorstRates);
  const activeAlerts = useSelector(selectActiveAlerts);
  const rateTrend = useSelector(selectRateTrend);
  const rateStatus = useSelector(selectCurrentRateStatus);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    if (company?.ID) {
      loadDashboardData();
    }
  }, [company?.ID]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
              dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"]));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const loadDashboardData = async () => {
    if (!company?.ID) return;
    
    setLoading(true);
    try {
      await Promise.all([
        dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"])),
        dispatch(fetchExchangeRateCharges({ company_id: company.ID, limit: 50 })),
        dispatch(fetchExchangeRateHistory({
          source: "EUR",
          target: "DZD",
          days: 30
        })),
        dispatch(fetchExchangeRateAnalytics({
          company_id: company.ID,
          date_from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          date_to: format(new Date(), 'yyyy-MM-dd')
        })),
        dispatch(fetchExchangeRateAlerts(company.ID)),
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const formatCurrency = (amount: number, currency: string = 'DZD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  if (!company) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Company information is required to view exchange rate dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exchange Rates</h1>
          <p className="text-gray-600">Monitor currency exchange rates and conversion costs</p>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Exchange
          </Button>
        </div>
      </div>

      {/* Rate Status Alert */}
      {rateStatus.isStale && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Exchange rates are outdated ({rateStatus.minutesSinceUpdate} minutes old). 
            Consider refreshing for the latest rates.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Rates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Exchange Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(currentRates).map(([pair, rate]) => (
            <RateDisplay
              key={pair}
              pair={pair}
              rate={rate}
              trend={rateTrend.trend as "increasing" | "decreasing" | "stable"}
              change={rateTrend.change}
              changePercentage={rateTrend.changePercentage}
            />
          ))}
          
          {Object.keys(currentRates).length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No rates available</h3>
                <p className="mt-1 text-gray-500">
                  Click refresh to fetch the latest exchange rates.
                </p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fetch Rates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Exchange Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Exchanges"
            value={analytics.totalExchanges}
            icon={<Activity className="h-6 w-6" />}
            change={5}
            changeType="count"
            positive={true}
          />
          
          <MetricCard
            title="Total Amount Exchanged (DZD)"
            value={formatCurrency(analytics.totalSourceAmount, 'DZD')}
            icon={<DollarSign className="h-6 w-6" />}
            change={analytics.totalSourceAmount * 0.1}
            changeType="currency"
            positive={true}
          />
          
          <MetricCard
            title="Total Fees Paid (DZD)"
            value={formatCurrency(analytics.totalFees, 'DZD')}
            icon={<Target className="h-6 w-6" />}
            change={analytics.totalFees * -0.05}
            changeType="currency"
            positive={false}
          />
          
          <MetricCard
            title="Total Target Amount (EUR)"
            value={formatCurrency(analytics.totalTargetAmount, 'EUR')}
            icon={<DollarSign className="h-6 w-6" />}
            change={analytics.totalTargetAmount * 0.1}
            changeType="currency"
            positive={true}
          />
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Rate Alerts</h2>
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.ID}>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      {alert.currency_pair} alert: {alert.condition} {alert.target_rate}
                    </span>
                    <Badge variant="secondary">
                      {alert.notification_method}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            {activeAlerts.length > 3 && (
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View All {activeAlerts.length} Alerts
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Currency Pair Performance */}
      {Object.keys(pairAnalytics).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Currency Pair Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(pairAnalytics).slice(0, 4).map(([pair, data]) => (
              <Card key={pair}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{pair}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Exchanges</div>
                      <div className="font-medium">{data.count}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Amount</div>
                      <div className="font-medium">
                        {data.sourceCurrency === "DZD" && data.targetCurrency === "EUR" 
                          ? formatCurrency(data.totalAmount, 'EUR')
                          : formatCurrency(data.totalAmount, 'DZD')
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Avg Rate</div>
                      <div className="font-medium">
                        {data.averageRate && typeof data.averageRate === 'number' && !isNaN(data.averageRate) 
                          ? data.averageRate.toFixed(2) 
                          : '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Fees</div>
                      <div className="font-medium">{formatCurrency(data.totalFees)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rate Calculator */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Calculator</h2>
        <ExchangeCalculator />
      </div>

      {/* Best/Worst Rates */}
      {bestWorstRates.best && bestWorstRates.worst && bestWorstRates.best.rate_date && bestWorstRates.worst.rate_date && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Rate Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Best Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-lg font-bold">
                    {bestWorstRates.best.exchange_rate && typeof bestWorstRates.best.exchange_rate === 'number' && !isNaN(bestWorstRates.best.exchange_rate) 
                      ? bestWorstRates.best.exchange_rate.toFixed(4) 
                      : '0.0000'} 
                    <span className="text-sm text-gray-500 ml-1">
                      {bestWorstRates.best.source_currency}/{bestWorstRates.best.target_currency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {bestWorstRates.best.title} • {formatDate(bestWorstRates.best.rate_date)}
                  </div>
                  <Badge variant="secondary">{bestWorstRates.best.rate_source}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Worst Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-lg font-bold">
                    {bestWorstRates.worst.exchange_rate && typeof bestWorstRates.worst.exchange_rate === 'number' && !isNaN(bestWorstRates.worst.exchange_rate) 
                      ? bestWorstRates.worst.exchange_rate.toFixed(4) 
                      : '0.0000'}
                    <span className="text-sm text-gray-500 ml-1">
                      {bestWorstRates.worst.source_currency}/{bestWorstRates.worst.target_currency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {bestWorstRates.worst.title} • {formatDate(bestWorstRates.worst.rate_date)}
                  </div>
                  <Badge variant="secondary">{bestWorstRates.worst.rate_source}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}