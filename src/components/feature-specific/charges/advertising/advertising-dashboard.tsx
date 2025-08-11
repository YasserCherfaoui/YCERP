import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAdvertisingDashboardAsync } from '@/features/charges/advertising-slice';
import { cn } from '@/lib/utils';
import {
    DollarSign,
    Eye,
    MousePointer,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Bar,
    BarChart, Line,
    LineChart, ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface AdvertisingDashboardProps {
  // No specific props defined, as it manages its own state via Redux
}

const AdvertisingDashboard: React.FC<AdvertisingDashboardProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.advertising);
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedObjective, setSelectedObjective] = useState<string>('all');

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      await dispatch(fetchAdvertisingDashboardAsync({
        date_from: dateRange.from?.toISOString(),
        date_to: dateRange.to?.toISOString(),
        platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
        campaign_objective: selectedObjective === 'all' ? undefined : selectedObjective,
      }));
    };

    loadDashboard();
  }, [dispatch, dateRange, selectedPlatform, selectedObjective]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
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

  if (!dashboard) {
    return (
      <Alert>
        <AlertDescription>No advertising data available</AlertDescription>
      </Alert>
    );
  }

  // Prepare chart data
  const platformData = Object.entries(dashboard.platform_breakdown).map(([platform, data]) => ({
    platform,
    spend: data.spend,
    impressions: data.impressions,
    clicks: data.clicks,
    conversions: data.conversions,
    revenue: data.revenue,
    roas: data.roas,
  }));

  const spendTrendData = [
    { date: 'Jan', spend: 12000 },
    { date: 'Feb', spend: 15000 },
    { date: 'Mar', spend: 18000 },
    { date: 'Apr', spend: 14000 },
    { date: 'May', spend: 22000 },
    { date: 'Jun', spend: 25000 },
  ];

  const performanceData = [
    { metric: 'CTR', value: dashboard.overall_ctr * 100, target: 2.5 },
    { metric: 'CPC', value: dashboard.overall_cpc, target: 1.2 },
    { metric: 'Conv. Rate', value: dashboard.overall_conversion_rate * 100, target: 3.0 },
    { metric: 'ROAS', value: dashboard.overall_roas, target: 4.0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advertising Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor campaign performance and ROI across all platforms
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedObjective} onValueChange={setSelectedObjective}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Objectives</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard.total_spend.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.spend_trend === 'increasing' ? '+' : dashboard.spend_trend === 'decreasing' ? '-' : ''} 
              vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.total_impressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.overall_cpm.toFixed(2)} CPM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.total_clicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(dashboard.overall_ctr * 100).toFixed(2)}% CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard.total_revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.overall_roas.toFixed(2)} ROAS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Badge variant="default">{dashboard.active_campaigns}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Paused</span>
              <Badge variant="secondary">{dashboard.paused_campaigns}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <Badge variant="outline">{dashboard.completed_campaigns}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Spend</span>
              <Badge 
                variant={dashboard.spend_trend === 'increasing' ? 'default' : 
                         dashboard.spend_trend === 'decreasing' ? 'destructive' : 'secondary'}
              >
                {dashboard.spend_trend}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Performance</span>
              <Badge 
                variant={dashboard.performance_trend === 'improving' ? 'default' : 
                         dashboard.performance_trend === 'declining' ? 'destructive' : 'secondary'}
              >
                {dashboard.performance_trend}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Efficiency</span>
              <Badge 
                variant={dashboard.efficiency_trend === 'improving' ? 'default' : 
                         dashboard.efficiency_trend === 'declining' ? 'destructive' : 'secondary'}
              >
                {dashboard.efficiency_trend}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    alert.severity === 'high' ? "bg-red-500" :
                    alert.severity === 'medium' ? "bg-yellow-500" : "bg-blue-500"
                  )} />
                  <span className="text-xs text-muted-foreground truncate">
                    {alert.message}
                  </span>
                </div>
              ))}
              {dashboard.alerts.length === 0 && (
                <span className="text-xs text-muted-foreground">No alerts</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Spend and performance by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spend" fill="#0088FE" name="Spend" />
                <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Spend Trend</CardTitle>
            <CardDescription>Monthly advertising spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendTrendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="spend" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics vs Targets</CardTitle>
          <CardDescription>Key performance indicators compared to targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className={cn(
                    "text-sm font-bold",
                    item.value >= item.target ? "text-green-600" : "text-red-600"
                  )}>
                    {item.metric === 'CTR' || item.metric === 'Conv. Rate' 
                      ? `${item.value.toFixed(2)}%` 
                      : item.metric === 'CPC' 
                        ? `$${item.value.toFixed(2)}`
                        : item.value.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full",
                      item.value >= item.target ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Target: {item.metric === 'CTR' || item.metric === 'Conv. Rate' 
                    ? `${item.target}%` 
                    : item.metric === 'CPC' 
                      ? `$${item.target}`
                      : item.target}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      {dashboard.top_campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
            <CardDescription>Campaigns with highest ROAS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.top_campaigns.slice(0, 5).map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{campaign.campaign_name}</div>
                    <div className="text-sm text-muted-foreground">{campaign.platform}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${campaign.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.roas.toFixed(2)} ROAS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvertisingDashboard; 