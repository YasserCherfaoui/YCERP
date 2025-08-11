import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    selectDashboardData,
    selectDashboardError,
    selectDashboardLoading,
    selectEfficiencyTrends,
    selectLowStockMaterials,
    selectMaterialCostAnalysis,
    selectPackagingTypeBreakdown
} from '@/features/charges/boxing-selectors';
import {
    fetchBoxingDashboard,
    fetchPackagingMaterials,
} from '@/features/charges/boxing-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    BarChart3,
    Calculator,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDispatch, useSelector } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface BoxingDashboardProps {
  /** Date range for dashboard data */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Company ID filter - required */
  companyId: number;
  /** Packaging type filter */
  packagingType?: string;
  /** Dashboard variant */
  variant?: 'full' | 'overview' | 'analytics';
  /** Additional CSS classes */
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-100';
    case 'good': return 'text-blue-600 bg-blue-100';
    case 'average': return 'text-yellow-600 bg-yellow-100';
    case 'poor': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getPerformanceStatus = (value: number, thresholds: { excellent: number; good: number; average: number }) => {
  if (value >= thresholds.excellent) return 'excellent';
  if (value >= thresholds.good) return 'good';
  if (value >= thresholds.average) return 'average';
  return 'poor';
};

export const BoxingDashboard: React.FC<BoxingDashboardProps> = ({
  dateRange,
  companyId,
  packagingType,
  variant = 'full',
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const dashboardData = useSelector(selectDashboardData);
  const dashboardLoading = useSelector(selectDashboardLoading);
  const dashboardError = useSelector(selectDashboardError);
  const packagingTypeBreakdown = useSelector(selectPackagingTypeBreakdown);
  const materialCostAnalysis = useSelector(selectMaterialCostAnalysis);
  const efficiencyTrends = useSelector(selectEfficiencyTrends);
  const lowStockMaterials = useSelector(selectLowStockMaterials);

  // Local state
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(
    dateRange ? { from: dateRange.from, to: dateRange.to } : undefined
  );
  const [selectedPackagingType, setSelectedPackagingType] = useState<string>(packagingType || 'all');

  // Initialize dashboard data
  useEffect(() => {
    if (!companyId) {
      console.error('companyId is required for BoxingDashboard');
      return;
    }

    const params = {
      date_from: selectedDateRange?.from?.toISOString().split('T')[0],
      date_to: selectedDateRange?.to?.toISOString().split('T')[0],
      packaging_type: selectedPackagingType === 'all' ? undefined : selectedPackagingType,
      company_id: companyId,
    };

    dispatch(fetchBoxingDashboard(params));
    dispatch(fetchPackagingMaterials({ limit: 50 }));
  }, [dispatch, selectedDateRange, selectedPackagingType, companyId]);

  const MetricCard = ({ 
    title, 
    value, 
    format = 'number', 
    change, 
    changeType = 'percentage',
    icon: Icon, 
    description,
    status,
  }: {
    title: string;
    value: number;
    format?: 'number' | 'currency' | 'percentage';
    change?: number;
    changeType?: 'percentage' | 'absolute';
    icon: React.ElementType;
    description?: string;
    status?: 'excellent' | 'good' | 'average' | 'poor';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency': return formatCurrency(val);
        case 'percentage': return `${val.toFixed(1)}%`;
        default: return formatNumber(val);
      }
    };

    const formatChange = (val: number) => {
      const prefix = val > 0 ? '+' : '';
      switch (changeType) {
        case 'percentage': return `${prefix}${val.toFixed(1)}%`;
        default: return `${prefix}${formatNumber(val)}`;
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-3 rounded-lg',
                status ? getStatusColor(status) : 'bg-primary/10 text-primary'
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{formatValue(value)}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            
            {change !== undefined && (
              <div className={cn(
                'flex items-center space-x-1 text-sm',
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
              )}>
                {change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : change < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span>{formatChange(change)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OverviewMetrics = () => {
    if (!dashboardData) return null;

    const efficiencyStatus = getPerformanceStatus(dashboardData.efficiency_metrics.packaging_efficiency, {
      excellent: 90,
      good: 80,
      average: 70,
    });

    const qualityStatus = getPerformanceStatus(dashboardData.quality_metrics.pass_rate, {
      excellent: 95,
      good: 90,
      average: 85,
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Batches"
          value={dashboardData.total_batches}
          icon={Package}
          description="Packaging batches processed"
        />
        
        <MetricCard
          title="Items Packaged"
          value={dashboardData.total_items_packaged}
          icon={Package}
          description="Total items processed"
        />
        
        <MetricCard
          title="Total Cost"
          value={dashboardData.total_packaging_cost}
          format="currency"
          icon={Calculator}
          description="Complete packaging expenses"
        />
        
        <MetricCard
          title="Cost per Item"
          value={dashboardData.average_cost_per_item}
          format="currency"
          icon={BarChart3}
          description="Average cost efficiency"
        />

        <MetricCard
          title="Material Costs"
          value={dashboardData.material_cost_total}
          format="currency"
          icon={Package}
          description="Total material expenses"
        />
        
        <MetricCard
          title="Labor Costs"
          value={dashboardData.labor_cost_total}
          format="currency"
          icon={Users}
          description="Total labor expenses"
        />
        
        <MetricCard
          title="Packaging Efficiency"
          value={dashboardData.efficiency_metrics.packaging_efficiency}
          format="percentage"
          icon={TrendingUp}
          status={efficiencyStatus}
          description="Overall process efficiency"
        />
        
        <MetricCard
          title="Quality Pass Rate"
          value={dashboardData.quality_metrics.pass_rate}
          format="percentage"
          icon={Package}
          status={qualityStatus}
          description="Quality control success"
        />
      </div>
    );
  };

  const PackagingTypeChart = () => {
    const data = packagingTypeBreakdown.map(item => ({
      name: item.type.replace('_', ' ').toUpperCase(),
      value: item.count,
      cost: item.totalCost,
      avgCost: item.averageCostPerItem,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Packaging Type Distribution</CardTitle>
          <CardDescription>Breakdown by packaging type and costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip formatter={(value) => [formatNumber(value as number), 'Batches']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(item.value)} batches
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.cost)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.avgCost)}/item
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

  const EfficiencyTrendsChart = () => {
    const data = efficiencyTrends.slice(-30); // Last 30 days

    return (
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Trends</CardTitle>
          <CardDescription>Daily packaging performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value, name) => {
                  if (name === 'efficiency' || name === 'quality_rate') {
                    return [`${(value as number).toFixed(1)}%`, name === 'efficiency' ? 'Efficiency' : 'Quality Rate'];
                  }
                  if (name === 'cost_per_item') {
                    return [formatCurrency(value as number), 'Cost per Item'];
                  }
                  return [formatNumber(value as number), 'Items Packaged'];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#8884d8" name="Efficiency %" />
              <Line yAxisId="left" type="monotone" dataKey="quality_rate" stroke="#82ca9d" name="Quality Rate %" />
              <Line yAxisId="right" type="monotone" dataKey="cost_per_item" stroke="#ffc658" name="Cost per Item" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const MaterialCostChart = () => {
    const data = materialCostAnalysis.slice(0, 10); // Top 10 materials

    return (
      <Card>
        <CardHeader>
          <CardTitle>Material Cost Analysis</CardTitle>
          <CardDescription>Top materials by total cost and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="material_name" type="category" width={100} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Total Cost']} />
              <Bar dataKey="total_cost" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const LowStockAlert = () => {
    if (lowStockMaterials.length === 0) return null;

    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-yellow-800">
              {lowStockMaterials.length} material(s) are running low on stock
            </p>
            <div className="space-y-1">
              {lowStockMaterials.slice(0, 5).map(material => {
                const stockPercentage = (material.current_stock / material.reorder_point) * 100;
                return (
                  <div key={material.ID} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">{material.name}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={stockPercentage} className="w-20 h-2" />
                      <span className="text-yellow-600 min-w-0">
                        {material.current_stock}/{material.reorder_point}
                      </span>
                    </div>
                  </div>
                );
              })}
              {lowStockMaterials.length > 5 && (
                <p className="text-sm text-yellow-700">
                  And {lowStockMaterials.length - 5} more materials...
                </p>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const RecentBatches = () => {
    if (!dashboardData?.recent_batches) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
          <CardDescription>Latest packaging batch activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recent_batches.map(batch => (
              <div key={batch.ID} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{batch.batch_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(batch.total_items)} items • {batch.completion_percentage.toFixed(0)}% complete
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    batch.status === 'completed' ? 'default' :
                    batch.status === 'in_progress' ? 'secondary' :
                    batch.status === 'planned' ? 'outline' : 'destructive'
                  }>
                    {batch.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(batch.total_cost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (dashboardLoading && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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

  if (variant === 'overview') {
    return (
      <div className={cn('space-y-6', className)}>
        <OverviewMetrics />
        <LowStockAlert />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Boxing Dashboard</h2>
          <p className="text-muted-foreground">
            Packaging performance metrics and analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            date={selectedDateRange}
            onSelect={setSelectedDateRange}
            className="w-64"
          />
          
          <Select value={selectedPackagingType} onValueChange={setSelectedPackagingType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="gift">Gift</SelectItem>
              <SelectItem value="bulk">Bulk</SelectItem>
              <SelectItem value="fragile">Fragile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Main Metrics */}
      <OverviewMetrics />

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-6">
          <EfficiencyTrendsChart />
        </TabsContent>
        
        <TabsContent value="types" className="space-y-6">
          <PackagingTypeChart />
        </TabsContent>
        
        <TabsContent value="materials" className="space-y-6">
          <MaterialCostChart />
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-6">
          <RecentBatches />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BoxingDashboard;