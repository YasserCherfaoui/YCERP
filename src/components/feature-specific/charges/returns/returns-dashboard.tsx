import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchReturnsDashboard } from '@/features/charges/returns-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    BarChart3,
    Clock,
    DollarSign,
    RotateCcw,
    Shield,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface ReturnsDashboardProps {
  dateRange?: { from: Date; to: Date };
  returnReason?: string;
  resolutionType?: string;
  className?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-DZ').format(num);
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(1)}%`;
};

export const ReturnsDashboard: React.FC<ReturnsDashboardProps> = ({
  dateRange,
  returnReason,
  resolutionType,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Mock dashboard data
  const dashboardData = {
    total_returns: 425,
    total_return_value: 18500000,
    total_processing_costs: 2800000,
    net_return_cost: 15200000,
    return_rate: 8.5,
    
    status_distribution: {
      initiated: 45,
      in_transit: 38,
      received: 82,
      inspecting: 54,
      processed: 156,
      refunded: 142,
      closed: 108,
      disputed: 12,
    },
    
    resolution_distribution: {
      full_refund: 245,
      partial_refund: 98,
      store_credit: 45,
      exchange: 28,
      repair: 15,
      no_refund: 18,
    },
    
    performance_metrics: {
      average_processing_time: 3.2,
      customer_satisfaction_score: 4.1,
      resolution_success_rate: 92.5,
      vendor_claim_success_rate: 78.3,
    },
    
    cost_breakdown: {
      refunds_issued: 14200000,
      processing_costs: 2800000,
      shipping_costs: 1200000,
      restocking_fees_collected: 890000,
      vendor_claims_recovered: 1650000,
    },
    
    top_return_reasons: [
      { reason: 'defective', count: 125, percentage: 29.4, total_value: 5200000, trend: 'increasing' },
      { reason: 'not_as_described', count: 89, percentage: 20.9, total_value: 3800000, trend: 'stable' },
      { reason: 'customer_changed_mind', count: 78, percentage: 18.4, total_value: 2900000, trend: 'decreasing' },
      { reason: 'damaged_in_shipping', count: 67, percentage: 15.8, total_value: 3200000, trend: 'stable' },
      { reason: 'wrong_item', count: 45, percentage: 10.6, total_value: 2100000, trend: 'decreasing' },
      { reason: 'late_delivery', count: 21, percentage: 4.9, total_value: 1300000, trend: 'stable' },
    ],
    
    top_returned_products: [
      { product_name: 'Wireless Headphones Pro', return_count: 28, return_rate: 12.5, total_return_value: 1680000, primary_return_reason: 'defective' },
      { product_name: 'Smart Watch Series 5', return_count: 24, return_rate: 9.8, total_return_value: 2160000, primary_return_reason: 'not_as_described' },
      { product_name: 'Gaming Laptop X1', return_count: 18, return_rate: 15.2, total_return_value: 2700000, primary_return_reason: 'defective' },
      { product_name: 'Bluetooth Speaker Mini', return_count: 16, return_rate: 8.5, total_return_value: 800000, primary_return_reason: 'customer_changed_mind' },
    ],
    
    return_trends: [
      { date: '2024-01-01', return_count: 12, return_value: 520000, processing_cost: 85000, resolution_rate: 94 },
      { date: '2024-01-02', return_count: 15, return_value: 680000, processing_cost: 102000, resolution_rate: 91 },
      { date: '2024-01-03', return_count: 18, return_value: 750000, processing_cost: 124000, resolution_rate: 89 },
      { date: '2024-01-04', return_count: 14, return_value: 580000, processing_cost: 96000, resolution_rate: 93 },
      { date: '2024-01-05', return_count: 21, return_value: 920000, processing_cost: 145000, resolution_rate: 88 },
    ],
    
    fraud_alerts: [
      { ID: 1, customer_name: 'Ahmed B.', return_count: 3, total_value: 280000, risk_score: 85 },
      { ID: 2, customer_name: 'Fatima K.', return_count: 2, total_value: 450000, risk_score: 72 },
    ],
    
    delayed_processing: [
      { ID: 101, order_id: 'ORD-2024-0156', days_pending: 8, return_value: 125000 },
      { ID: 102, order_id: 'ORD-2024-0189', days_pending: 6, return_value: 89000 },
      { ID: 103, order_id: 'ORD-2024-0203', days_pending: 5, return_value: 156000 },
    ],
  };
  
  const dashboardLoading = false;
  const dashboardError = null;

  // Local state
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date } | undefined>(
    dateRange || {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    }
  );
  const [selectedReturnReason, setSelectedReturnReason] = useState<string>(returnReason || 'all');
  const [selectedResolutionType, setSelectedResolutionType] = useState<string>(resolutionType || 'all');

  // Initialize dashboard data
  useEffect(() => {
    const params = {
      date_from: selectedDateRange?.from?.toISOString().split('T')[0],
      date_to: selectedDateRange?.to?.toISOString().split('T')[0],
      return_reason: selectedReturnReason === 'all' ? undefined : selectedReturnReason,
      resolution_type: selectedResolutionType === 'all' ? undefined : selectedResolutionType,
    };

    dispatch(fetchReturnsDashboard(params));
  }, [dispatch, selectedDateRange, selectedReturnReason, selectedResolutionType]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    format = 'number',
    icon: Icon,
    trend = 'neutral',
  }: {
    title: string;
    value: number;
    change?: number;
    format?: 'number' | 'currency' | 'percentage';
    icon: React.ElementType;
    trend?: 'positive' | 'negative' | 'neutral';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency': return formatCurrency(val);
        case 'percentage': return formatPercentage(val);
        default: return formatNumber(val);
      }
    };

    const getTrendIcon = () => {
      if (trend === 'positive') return <TrendingUp className="h-4 w-4 text-green-600" />;
      if (trend === 'negative') return <TrendingDown className="h-4 w-4 text-red-600" />;
      return null;
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {change !== undefined && (
                <div className="flex items-center space-x-1 text-sm mt-1">
                  {getTrendIcon()}
                  <span className={cn(
                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last period
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const OverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Returns"
        value={dashboardData.total_returns}
        icon={RotateCcw}
        change={-5.2}
        trend="positive"
      />
      
      <MetricCard
        title="Return Value"
        value={dashboardData.total_return_value}
        format="currency"
        icon={DollarSign}
        change={-8.1}
        trend="positive"
      />
      
      <MetricCard
        title="Return Rate"
        value={dashboardData.return_rate}
        format="percentage"
        icon={BarChart3}
        change={-2.3}
        trend="positive"
      />
      
      <MetricCard
        title="Processing Time"
        value={dashboardData.performance_metrics.average_processing_time}
        format="number"
        icon={Clock}
        change={-15.4}
        trend="positive"
      />
    </div>
  );

  const StatusDistributionChart = () => {
    const statusData = Object.entries(dashboardData.status_distribution).map(([status, count]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      percentage: ((count / dashboardData.total_returns) * 100),
    }));

    const statusColors = {
      'Initiated': '#f59e0b',
      'In Transit': '#3b82f6',
      'Received': '#8b5cf6',
      'Inspecting': '#f97316',
      'Processed': '#06b6d4',
      'Refunded': '#22c55e',
      'Closed': '#6b7280',
      'Disputed': '#ef4444',
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Return Status Distribution</CardTitle>
          <CardDescription>Current status of all returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name as keyof typeof statusColors] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(value as number), 'Returns']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColors[item.name as keyof typeof statusColors] || '#6b7280' }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatNumber(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReturnReasonsChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Return Reasons</CardTitle>
        <CardDescription>Most common reasons for returns</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.top_return_reasons}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="reason" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'count') return [formatNumber(value as number), 'Returns'];
                if (name === 'total_value') return [formatCurrency(value as number), 'Total Value'];
                return [value, name];
              }}
            />
            <Bar dataKey="count" fill="#8884d8" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TrendsChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Return Trends</CardTitle>
        <CardDescription>Daily return volume and costs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.return_trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'return_value' || name === 'processing_cost') {
                  return [formatCurrency(value as number), name.replace('_', ' ')];
                }
                if (name === 'resolution_rate') return [`${value}%`, 'Resolution Rate'];
                return [formatNumber(value as number), (name as string).replace('_', ' ')];
              }}
            />
            <Line type="monotone" dataKey="return_count" stroke="#8884d8" name="Return Count" />
            <Line type="monotone" dataKey="resolution_rate" stroke="#22c55e" name="Resolution Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TopReturnedProductsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Returned Products</CardTitle>
        <CardDescription>Products with highest return rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboardData.top_returned_products.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{product.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Primary reason: {product.primary_return_reason.replace('_', ' ')}
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Return Rate</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={product.return_rate} className="w-16 h-2" />
                    <span className="text-sm font-medium">{product.return_rate}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Count</p>
                  <p className="font-medium">{formatNumber(product.return_count)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-medium">{formatCurrency(product.total_return_value)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AlertsSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Fraud Alerts</span>
          </CardTitle>
          <CardDescription>High-risk customers requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.fraud_alerts.map((alert) => (
              <div key={alert.ID} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{alert.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.return_count} returns • {formatCurrency(alert.total_value)}
                  </p>
                </div>
                <Badge variant="destructive">
                  Risk: {alert.risk_score}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delayed Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span>Delayed Processing</span>
          </CardTitle>
          <CardDescription>Returns pending for more than 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.delayed_processing.map((item) => (
              <div key={item.ID} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.order_id}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.return_value)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {item.days_pending} days
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (dashboardLoading && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{dashboardError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Returns Dashboard</h2>
          <p className="text-muted-foreground">
            Returns processing metrics and analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            selected={selectedDateRange}
            onSelect={(date) => setSelectedDateRange(date ? { from: date.from!, to: date.to! } : undefined)}
            className="w-64"
          />
          
          <Select value={selectedReturnReason} onValueChange={setSelectedReturnReason}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="defective">Defective</SelectItem>
              <SelectItem value="not_as_described">Not as Described</SelectItem>
              <SelectItem value="customer_changed_mind">Changed Mind</SelectItem>
              <SelectItem value="damaged_in_shipping">Damaged</SelectItem>
              <SelectItem value="wrong_item">Wrong Item</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedResolutionType} onValueChange={setSelectedResolutionType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resolutions</SelectItem>
              <SelectItem value="full_refund">Full Refund</SelectItem>
              <SelectItem value="partial_refund">Partial Refund</SelectItem>
              <SelectItem value="store_credit">Store Credit</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Metrics */}
      <OverviewMetrics />

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatusDistributionChart />
          <TopReturnedProductsTable />
        </TabsContent>
        
        <TabsContent value="reasons" className="space-y-6">
          <ReturnReasonsChart />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <TrendsChart />
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <AlertsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReturnsDashboard;