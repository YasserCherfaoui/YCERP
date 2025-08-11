import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchChargeTotalsAsync } from '@/features/charges/charges-slice';
import { fetchUtilityAnalyticsAsync } from '@/features/charges/rent-utility-slice';
import { BarChart3, Calendar, DollarSign, Droplets, Flame, TrendingDown, TrendingUp, Wifi, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Area, AreaChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface UsageAnalyticsProps {
  onPeriodChange?: (period: string) => void;
  propertyId?: number;
  companyId?: number;
}

const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({ onPeriodChange, propertyId, companyId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading, error } = useSelector((state: RootState) => state.rentUtility);
  const { totals, analyticsLoading } = useSelector((state: RootState) => state.charges);
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30_days');
  const [selectedUtility, setSelectedUtility] = useState<string>('all');

  // Calculate date range based on selected period
  const getDateRange = (period: string) => {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    
    let startDate: string;
    switch (period) {
      case '7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '1_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    return { startDate, endDate };
  };

  useEffect(() => {
    const { startDate, endDate } = getDateRange(selectedPeriod);
    
    // Fetch charge totals for the company
    if (companyId) {
      dispatch(fetchChargeTotalsAsync({
        company_id: companyId,
        start_date: startDate,
        end_date: endDate,
      }));
    }
    
    // Fetch utility analytics for the property
    if (propertyId) {
      dispatch(fetchUtilityAnalyticsAsync({
        property_id: propertyId,
        date_from: startDate,
        date_to: endDate,
        utility_type: selectedUtility === 'all' ? undefined : selectedUtility
      }));
    }
  }, [dispatch, propertyId, companyId, selectedPeriod, selectedUtility]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const handleUtilityChange = (utility: string) => {
    setSelectedUtility(utility);
  };

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-4 w-4" />;
      case 'water': return <Droplets className="h-4 w-4" />;
      case 'gas': return <Flame className="h-4 w-4" />;
      case 'internet': return <Wifi className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Calendar className="h-4 w-4 text-gray-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Transform analytics data for charts
  const getUsageTrendData = () => {
    if (!analytics) return [];
    
    // This would come from the API - for now using mock data structure
    return [
      { date: 'Jan', electricity: 1200, water: 800, gas: 600, internet: 400 },
      { date: 'Feb', electricity: 1350, water: 850, gas: 650, internet: 400 },
      { date: 'Mar', electricity: 1100, water: 900, gas: 700, internet: 400 },
      { date: 'Apr', electricity: 1400, water: 950, gas: 750, internet: 400 },
      { date: 'May', electricity: 1300, water: 1000, gas: 800, internet: 400 },
      { date: 'Jun', electricity: 1500, water: 1050, gas: 850, internet: 400 },
    ];
  };

  const getCostTrendData = () => {
    if (!analytics) return [];
    
    // This would come from the API - for now using mock data structure
    return [
      { date: 'Jan', electricity: 24000, water: 8000, gas: 12000, internet: 8000 },
      { date: 'Feb', electricity: 27000, water: 8500, gas: 13000, internet: 8000 },
      { date: 'Mar', electricity: 22000, water: 9000, gas: 14000, internet: 8000 },
      { date: 'Apr', electricity: 28000, water: 9500, gas: 15000, internet: 8000 },
      { date: 'May', electricity: 26000, water: 10000, gas: 16000, internet: 8000 },
      { date: 'Jun', electricity: 30000, water: 10500, gas: 17000, internet: 8000 },
    ];
  };

  const getUtilityBreakdownData = () => {
    if (!analytics?.cost_breakdown) return [];
    
    return Object.entries(analytics.cost_breakdown).map(([utility, cost]) => ({
      name: utility.charAt(0).toUpperCase() + utility.slice(1),
      value: cost,
      color: getUtilityColor(utility)
    }));
  };

  const getUtilityColor = (type: string) => {
    switch (type) {
      case 'electricity': return '#fbbf24';
      case 'water': return '#3b82f6';
      case 'gas': return '#f97316';
      case 'internet': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getEfficiencyData = () => {
    if (!analytics) return [];
    
    return [
      { utility: 'Electricity', efficiency: analytics.usage_efficiency_score || 85, target: 90, trend: 2.5 },
      { utility: 'Water', efficiency: 92, target: 95, trend: -1.2 },
      { utility: 'Gas', efficiency: 78, target: 85, trend: 3.1 },
      { utility: 'Internet', efficiency: 100, target: 100, trend: 0 },
    ];
  };

  // Get charge totals for the company
  const getCompanyChargeTotals = () => {
    if (!totals) return {
      total_amount: 0,
      pending_amount: 0,
      approved_amount: 0,
      paid_amount: 0,
      by_type: {},
      by_category: {},
    };
    
    return totals;
  };

  const companyTotals = getCompanyChargeTotals();

  if (loading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Usage Analytics</h2>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analytics && !companyTotals) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Usage Analytics</h2>
        </div>
        <Alert>
          <AlertDescription>
            No analytics data available. Please select a property to view usage analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Usage Analytics</h2>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_days">7 Days</SelectItem>
              <SelectItem value="30_days">30 Days</SelectItem>
              <SelectItem value="90_days">90 Days</SelectItem>
              <SelectItem value="1_year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedUtility} onValueChange={handleUtilityChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Utility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Utilities</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(analytics?.total_consumption || {}).reduce((sum, val) => sum + val, 0).toLocaleString()} kWh
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics?.cost_trend || 'stable')}
              <span className={getTrendColor(analytics?.cost_trend || 'stable')}>
                {analytics?.cost_trend === 'increasing' ? '+' : analytics?.cost_trend === 'decreasing' ? '-' : ''} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_utility_costs?.toLocaleString() || companyTotals.total_amount?.toLocaleString() || 0} DZD
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics?.cost_trend || 'stable')}
              <span className={getTrendColor(analytics?.cost_trend || 'stable')}>
                {analytics?.cost_trend === 'increasing' ? '+' : analytics?.cost_trend === 'decreasing' ? '-' : ''} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companyTotals.pending_amount?.toLocaleString() || 0} DZD
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon('stable')}
              <span className="text-gray-600">awaiting approval</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.usage_efficiency_score || 0}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics?.cost_trend || 'stable')}
              <span className={getTrendColor(analytics?.cost_trend || 'stable')}>
                {analytics?.cost_trend === 'increasing' ? '+' : analytics?.cost_trend === 'decreasing' ? '-' : ''} from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Charge Totals */}
      {companyTotals && (
        <Card>
          <CardHeader>
            <CardTitle>Company Charge Overview</CardTitle>
            <CardDescription>Total charges and payment status for the company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {companyTotals.total_amount?.toLocaleString() || 0} DZD
                </div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {companyTotals.pending_amount?.toLocaleString() || 0} DZD
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {companyTotals.approved_amount?.toLocaleString() || 0} DZD
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {companyTotals.paid_amount?.toLocaleString() || 0} DZD
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Monthly utility consumption patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={getUsageTrendData()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="electricity" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
              <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="gas" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
              <Area type="monotone" dataKey="internet" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Trends</CardTitle>
            <CardDescription>Monthly utility cost patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getCostTrendData()}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value.toLocaleString()} DZD`} />
                <Legend />
                <Line type="monotone" dataKey="electricity" stroke="#fbbf24" strokeWidth={2} />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="gas" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="internet" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utility Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Distribution of utility costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getUtilityBreakdownData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getUtilityBreakdownData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toLocaleString()} DZD`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Analysis</CardTitle>
          <CardDescription>Utility efficiency scores and targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getEfficiencyData().map((item) => (
              <div key={item.utility} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getUtilityIcon(item.utility.toLowerCase())}
                  <div>
                    <div className="font-medium">{item.utility}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {item.target}% | Current: {item.efficiency}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.efficiency / item.target) * 100}%`,
                        backgroundColor: item.efficiency >= item.target ? '#10b981' : '#f59e0b'
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(item.trend > 0 ? 'increasing' : item.trend < 0 ? 'decreasing' : 'stable')}
                    <span className={getTrendColor(item.trend > 0 ? 'increasing' : item.trend < 0 ? 'decreasing' : 'stable')}>
                      {item.trend > 0 ? '+' : ''}{item.trend}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      {analytics?.optimization_recommendations && analytics.optimization_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>Suggestions to improve utility efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.optimization_recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">Recommendation {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact */}
      {analytics?.carbon_footprint_kg && (
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
            <CardDescription>Carbon footprint and sustainability metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.carbon_footprint_kg.toFixed(1)} kg
                </div>
                <div className="text-sm text-muted-foreground">Carbon Footprint</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.renewable_energy_usage?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Renewable Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.sustainability_score?.toFixed(1) || 0}/100
                </div>
                <div className="text-sm text-muted-foreground">Sustainability Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageAnalytics; 