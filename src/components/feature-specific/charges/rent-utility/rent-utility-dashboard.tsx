import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchRentUtilityDashboardAsync } from '@/features/charges/rent-utility-slice';
import {
    AlertTriangle,
    Building,
    DollarSign,
    Gauge, TrendingDown,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Area,
    AreaChart,
    Bar,
    BarChart, ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface RentUtilityDashboardProps {
  // No specific props defined, as it manages its own state via Redux
}

const RentUtilityDashboard: React.FC<RentUtilityDashboardProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.rentUtility);
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  
  const [selectedUtilityType, setSelectedUtilityType] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      await dispatch(fetchRentUtilityDashboardAsync({
        date_from: dateRange.from?.toISOString(),
        date_to: dateRange.to?.toISOString(),
        utility_type: selectedUtilityType === 'all' ? undefined : selectedUtilityType,
        property_id: selectedProperty === 'all' ? undefined : parseInt(selectedProperty),
      }));
    };

    loadDashboard();
  }, [dispatch, dateRange, selectedUtilityType, selectedProperty]);

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
        <AlertDescription>No rent/utility data available</AlertDescription>
      </Alert>
    );
  }

  // Prepare chart data
  const utilityBreakdownData = Object.entries(dashboard.utility_type_breakdown).map(([type, data]) => ({
    type,
    count: data.count,
    total_cost: data.total_cost,
    total_consumption: data.total_consumption,
    average_cost: data.average_cost,
  }));

  const usageTrendsData = dashboard.usage_trends.slice(-12).map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    electricity: trend.electricity_consumption,
    water: trend.water_consumption,
    gas: trend.gas_consumption,
    total_cost: trend.total_cost,
  }));

  const paymentStatusData = [
    { status: 'Paid', count: dashboard.payment_status_breakdown.paid, color: '#10B981' },
    { status: 'Pending', count: dashboard.payment_status_breakdown.pending, color: '#F59E0B' },
    { status: 'Overdue', count: dashboard.payment_status_breakdown.overdue, color: '#EF4444' },
    { status: 'Disputed', count: dashboard.payment_status_breakdown.disputed, color: '#8B5CF6' },
    { status: 'Partial', count: dashboard.payment_status_breakdown.partial, color: '#6B7280' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rent & Utilities Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor property costs, usage efficiency, and payment status
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePickerWithRange
            date={dateRange}
            onSelect={(date) => setDateRange(date ? { from: date.from!, to: date.to! } : undefined)}
          />
          
          <Select value={selectedUtilityType} onValueChange={setSelectedUtilityType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select utility type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Utilities</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="1">Main Office</SelectItem>
              <SelectItem value="2">Warehouse A</SelectItem>
              <SelectItem value="3">Retail Store</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.total_charges}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard.total_cost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${dashboard.average_cost_per_sqm.toFixed(2)} per sqm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.overall_efficiency_score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs industry benchmark
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.sustainability_score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Environmental score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.status}</span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overdue Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.overdue_charges.slice(0, 3).map((charge, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{charge.property_name}</div>
                    <div className="text-xs text-muted-foreground">
                      ${charge.amount.toFixed(2)} - {charge.type}
                    </div>
                  </div>
                </div>
              ))}
              {dashboard.overdue_charges.length === 0 && (
                <span className="text-xs text-muted-foreground">No overdue charges</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">High Usage Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.high_usage_alerts.slice(0, 3).map((charge, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{charge.property_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {charge.utility_type} - {charge.usage_efficiency_score?.toFixed(1)}% efficiency
                    </div>
                  </div>
                </div>
              ))}
              {dashboard.high_usage_alerts.length === 0 && (
                <span className="text-xs text-muted-foreground">No usage alerts</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utility Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Utility Cost Breakdown</CardTitle>
            <CardDescription>Total cost by utility type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilityBreakdownData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_cost" fill="#0088FE" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Daily consumption patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageTrendsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="electricity" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="water" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="gas" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
          <CardDescription>Cost efficiency by property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.property_performance.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{property.property_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {property.utility_count} utilities
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${property.total_cost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    ${property.cost_per_sqm.toFixed(2)}/sqm
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={property.efficiency_score >= 80 ? 'default' : 
                             property.efficiency_score >= 60 ? 'secondary' : 'destructive'}
                  >
                    {property.efficiency_score.toFixed(1)}% efficiency
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Opportunities */}
      {dashboard.cost_optimization_opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>Potential cost savings and improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.cost_optimization_opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opportunity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consumption Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(dashboard.total_consumption).map(([utility, consumption], index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium capitalize">{utility} Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consumption.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total units consumed
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RentUtilityDashboard; 