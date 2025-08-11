import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchShippingDashboard } from '@/features/charges/shipping-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle, Clock,
    DollarSign,
    MapPin,
    Package,
    TrendingDown,
    TrendingUp,
    Truck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface ShippingDashboardProps {
  dateRange?: { from: Date; to: Date };
  providerId?: number;
  zoneCategory?: string;
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

export const ShippingDashboard: React.FC<ShippingDashboardProps> = ({
  dateRange,
  providerId,
  zoneCategory,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Mock selectors - replace with actual selectors
  const dashboardData = {
    total_shipments: 1250,
    total_shipping_cost: 45000000,
    average_cost_per_shipment: 36000,
    total_weight_shipped: 8500,
    average_delivery_time: 2.5,
    on_time_delivery_rate: 87.5,
    delivery_performance: {
      delivered: 1087,
      in_transit: 145,
      pending: 18,
      delayed: 25,
      lost_or_damaged: 5,
    },
    cost_breakdown: {
      base_costs: 25000000,
      fuel_surcharges: 8000000,
      insurance_costs: 3500000,
      cod_fees: 5000000,
      other_fees: 3500000,
    },
    provider_comparison: [
      { provider_name: 'Yalidine', shipment_count: 650, total_cost: 23000000, on_time_rate: 89, damage_rate: 0.8, average_rating: 4.3 },
      { provider_name: 'Ecureuil', shipment_count: 400, total_cost: 15000000, on_time_rate: 85, damage_rate: 1.2, average_rating: 4.1 },
      { provider_name: 'ZR Express', shipment_count: 200, total_cost: 7000000, on_time_rate: 82, damage_rate: 1.5, average_rating: 3.9 },
    ],
    zone_analytics: [
      { zone_name: 'Algiers', shipment_count: 450, total_cost: 15000000, average_delivery_time: 1.8, success_rate: 92 },
      { zone_name: 'Oran', shipment_count: 320, total_cost: 12000000, average_delivery_time: 2.2, success_rate: 89 },
      { zone_name: 'Constantine', shipment_count: 280, total_cost: 10000000, average_delivery_time: 2.8, success_rate: 85 },
      { zone_name: 'Annaba', shipment_count: 200, total_cost: 8000000, average_delivery_time: 3.2, success_rate: 83 },
    ],
    shipping_trends: [
      { date: '2024-01-01', shipment_count: 45, total_cost: 1620000, average_delivery_time: 2.3, on_time_rate: 88 },
      { date: '2024-01-02', shipment_count: 52, total_cost: 1872000, average_delivery_time: 2.4, on_time_rate: 85 },
      { date: '2024-01-03', shipment_count: 48, total_cost: 1728000, average_delivery_time: 2.2, on_time_rate: 91 },
      { date: '2024-01-04', shipment_count: 61, total_cost: 2196000, average_delivery_time: 2.6, on_time_rate: 87 },
      { date: '2024-01-05', shipment_count: 38, total_cost: 1368000, average_delivery_time: 2.1, on_time_rate: 93 },
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
  const [selectedProvider, setSelectedProvider] = useState<string>(providerId?.toString() || 'all');
  const [selectedZoneCategory, setSelectedZoneCategory] = useState<string>(zoneCategory || 'all');

  // Initialize dashboard data
  useEffect(() => {
    const params = {
      date_from: selectedDateRange?.from?.toISOString().split('T')[0],
      date_to: selectedDateRange?.to?.toISOString().split('T')[0],
      provider_id: selectedProvider === 'all' ? undefined : parseInt(selectedProvider),
      zone_category: selectedZoneCategory === 'all' ? undefined : selectedZoneCategory,
    };

    dispatch(fetchShippingDashboard(params));
  }, [dispatch, selectedDateRange, selectedProvider, selectedZoneCategory]);

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
        case 'percentage': return `${val.toFixed(1)}%`;
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
        title="Total Shipments"
        value={dashboardData.total_shipments}
        icon={Package}
        change={12.5}
        trend="positive"
      />
      
      <MetricCard
        title="Shipping Costs"
        value={dashboardData.total_shipping_cost}
        format="currency"
        icon={DollarSign}
        change={-3.2}
        trend="negative"
      />
      
      <MetricCard
        title="Avg Delivery Time"
        value={dashboardData.average_delivery_time}
        format="number"
        icon={Clock}
        change={-8.1}
        trend="positive"
      />
      
      <MetricCard
        title="On-Time Rate"
        value={dashboardData.on_time_delivery_rate}
        format="percentage"
        icon={Truck}
        change={5.3}
        trend="positive"
      />
    </div>
  );

  const DeliveryStatusChart = () => {
    const statusData = [
      { name: 'Delivered', value: dashboardData.delivery_performance.delivered, color: '#22c55e' },
      { name: 'In Transit', value: dashboardData.delivery_performance.in_transit, color: '#3b82f6' },
      { name: 'Pending', value: dashboardData.delivery_performance.pending, color: '#f59e0b' },
      { name: 'Delayed', value: dashboardData.delivery_performance.delayed, color: '#ef4444' },
      { name: 'Lost/Damaged', value: dashboardData.delivery_performance.lost_or_damaged, color: '#6b7280' },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Status Distribution</CardTitle>
          <CardDescription>Current shipment status breakdown</CardDescription>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip formatter={(value) => [formatNumber(value as number), 'Shipments']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatNumber(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / dashboardData.total_shipments) * 100).toFixed(1)}%
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

  const ProviderPerformanceChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Provider Performance Comparison</CardTitle>
        <CardDescription>Delivery performance by shipping provider</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.provider_comparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="provider_name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'on_time_rate') return [`${value}%`, 'On-Time Rate'];
                if (name === 'total_cost') return [formatCurrency(value as number), 'Total Cost'];
                return [formatNumber(value as number), 'Shipments'];
              }}
            />
            <Bar dataKey="shipment_count" fill="#8884d8" name="Shipments" />
            <Bar dataKey="on_time_rate" fill="#82ca9d" name="On-Time Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TrendsChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Trends</CardTitle>
        <CardDescription>Daily shipping volume and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.shipping_trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'total_cost') return [formatCurrency(value as number), 'Total Cost'];
                if (name === 'on_time_rate') return [`${value}%`, 'On-Time Rate'];
                return [formatNumber(value as number), name];
              }}
            />
            <Line type="monotone" dataKey="shipment_count" stroke="#8884d8" name="Shipments" />
            <Line type="monotone" dataKey="on_time_rate" stroke="#82ca9d" name="On-Time Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const ZonePerformanceTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Zone Performance</CardTitle>
        <CardDescription>Delivery performance by geographic zone</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboardData.zone_analytics.map((zone, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{zone.zone_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(zone.shipment_count)} shipments
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={zone.success_rate} className="w-16 h-2" />
                    <span className="text-sm font-medium">{zone.success_rate}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg Delivery</p>
                  <p className="font-medium">{zone.average_delivery_time}d</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-medium">{formatCurrency(zone.total_cost)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
          <h2 className="text-2xl font-bold">Shipping Dashboard</h2>
          <p className="text-muted-foreground">
            Shipping performance metrics and analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            date={selectedDateRange}
            onSelect={(date) => setSelectedDateRange(date ? { from: date.from!, to: date.to! } : undefined)}
            className="w-64"
          />
          
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="1">Yalidine</SelectItem>
              <SelectItem value="2">Ecureuil</SelectItem>
              <SelectItem value="3">ZR Express</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedZoneCategory} onValueChange={setSelectedZoneCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Metrics */}
      <OverviewMetrics />

      {/* Charts and Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <DeliveryStatusChart />
        </TabsContent>
        
        <TabsContent value="providers" className="space-y-6">
          <ProviderPerformanceChart />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <TrendsChart />
        </TabsContent>
        
        <TabsContent value="zones" className="space-y-6">
          <ZonePerformanceTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingDashboard;