import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { fetchAdvancedAnalyticsAsync } from '@/features/charges/charges-slice';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    DollarSign,
    Download,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Area, AreaChart, Bar, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface AdvancedAnalyticsDashboardProps {
  onExport?: (format: string) => void;
  onDateRangeChange?: (range: string) => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ 
  onExport, 
  onDateRangeChange 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.charges);
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30_days');
  const [selectedMetric, setSelectedMetric] = useState<string>('cost_efficiency');
  const [activeTab, setActiveTab] = useState('trends');

  useEffect(() => {
    // dispatch(fetchAdvancedAnalyticsAsync({ 
    //   period: selectedPeriod, 
    //   metric: selectedMetric 
    // }));
  }, [dispatch, selectedPeriod, selectedMetric]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onDateRangeChange?.(period);
  };

  const handleExport = (format: string) => {
    onExport?.(format);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Poor';
  };

  // Sample data for charts
  const costTrendData = [
    { month: 'Jan', actual: 150000, budget: 140000, variance: 7.1 },
    { month: 'Feb', actual: 165000, budget: 150000, variance: 10.0 },
    { month: 'Mar', actual: 180000, budget: 160000, variance: 12.5 },
    { month: 'Apr', actual: 175000, budget: 170000, variance: 2.9 },
    { month: 'May', actual: 190000, budget: 180000, variance: 5.6 },
    { month: 'Jun', actual: 200000, budget: 190000, variance: 5.3 },
  ];

  const profitabilityData = [
    { month: 'Jan', revenue: 500000, costs: 150000, profit: 350000, margin: 70.0 },
    { month: 'Feb', revenue: 550000, costs: 165000, profit: 385000, margin: 70.0 },
    { month: 'Mar', revenue: 600000, costs: 180000, profit: 420000, margin: 70.0 },
    { month: 'Apr', revenue: 580000, costs: 175000, profit: 405000, margin: 69.8 },
    { month: 'May', revenue: 650000, costs: 190000, profit: 460000, margin: 70.8 },
    { month: 'Jun', revenue: 700000, costs: 200000, profit: 500000, margin: 71.4 },
  ];

  const efficiencyBreakdownData = [
    { category: 'Exchange Rates', efficiency: 95, target: 90, trend: 2.5 },
    { category: 'Salaries', efficiency: 88, target: 85, trend: 1.8 },
    { category: 'Boxing', efficiency: 82, target: 80, trend: 3.2 },
    { category: 'Shipping', efficiency: 91, target: 88, trend: -1.5 },
    { category: 'Returns', efficiency: 76, target: 75, trend: 4.1 },
    { category: 'Advertising', efficiency: 94, target: 90, trend: 6.8 },
    { category: 'Rent & Utilities', efficiency: 89, target: 85, trend: 0.5 },
  ];

  const costAllocationData = [
    { name: 'Direct Costs', value: 120000, color: '#3b82f6' },
    { name: 'Indirect Costs', value: 45000, color: '#10b981' },
    { name: 'Fixed Costs', value: 25000, color: '#f97316' },
    { name: 'Variable Costs', value: 10000, color: '#8b5cf6' },
  ];

  const performanceMetrics = [
    { metric: 'Cost Efficiency', value: 87.5, target: 90, trend: 2.1 },
    { metric: 'Budget Utilization', value: 78.4, target: 85, trend: -1.8 },
    { metric: 'ROI', value: 245.2, target: 200, trend: 8.5 },
    { metric: 'Processing Time', value: 2.3, target: 2.0, trend: -0.5 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into cost trends, profitability, and efficiency metrics
          </p>
        </div>
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
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(2.1)}
              <span className={getTrendColor(2.1)}>+2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70.8%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(1.2)}
              <span className={getTrendColor(1.2)}>+1.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245.2%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(8.5)}
              <span className={getTrendColor(8.5)}>+8.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.3%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(-0.8)}
              <span className={getTrendColor(-0.8)}>-0.8% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trends">Cost Trends</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Monthly budget performance and variance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={costTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" opacity={0.6} />
                  <Bar dataKey="actual" fill="#10b981" />
                  <Line type="monotone" dataKey="variance" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Allocation</CardTitle>
                <CardDescription>Distribution of costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={costAllocationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators and targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}{metric.metric === 'ROI' ? '%' : metric.metric === 'Processing Time' ? ' days' : '%'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getEfficiencyColor(metric.value)}`}>
                          {metric.value}{metric.metric === 'ROI' ? '%' : metric.metric === 'Processing Time' ? ' days' : '%'}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {getTrendIcon(metric.trend)}
                          <span className={getTrendColor(metric.trend)}>
                            {metric.trend > 0 ? '+' : ''}{metric.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          {/* Profitability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
              <CardDescription>Revenue, costs, and profit margin trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={profitabilityData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="costs" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="profit" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Margin Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Trend</CardTitle>
              <CardDescription>Monthly profit margin percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profitabilityData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          {/* Efficiency Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Efficiency by Category</CardTitle>
              <CardDescription>Efficiency scores and targets by charge type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {efficiencyBreakdownData.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-medium">{item.category}</div>
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
                        {getTrendIcon(item.trend)}
                        <span className={getTrendColor(item.trend)}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Heatmap</CardTitle>
              <CardDescription>Visual representation of efficiency scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {efficiencyBreakdownData.map((item, index) => (
                  <div key={item.category} className="text-center">
                    <div className="text-xs font-medium mb-1">{item.category}</div>
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        backgroundColor: item.efficiency >= 90 ? '#10b981' :
                                       item.efficiency >= 80 ? '#22c55e' :
                                       item.efficiency >= 70 ? '#84cc16' :
                                       item.efficiency >= 60 ? '#eab308' :
                                       item.efficiency >= 50 ? '#f59e0b' :
                                       item.efficiency >= 40 ? '#f97316' :
                                       item.efficiency >= 30 ? '#ef4444' : '#dc2626'
                      }}
                    >
                      {item.efficiency}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          {/* Cost Forecasting */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Forecasting</CardTitle>
              <CardDescription>Predicted cost trends for the next 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[
                  ...costTrendData,
                  { month: 'Jul', actual: 210000, budget: 200000, variance: 5.0 },
                  { month: 'Aug', actual: 220000, budget: 210000, variance: 4.8 },
                  { month: 'Sep', actual: 230000, budget: 220000, variance: 4.5 },
                  { month: 'Oct', actual: 240000, budget: 230000, variance: 4.3 },
                  { month: 'Nov', actual: 250000, budget: 240000, variance: 4.2 },
                  { month: 'Dec', actual: 260000, budget: 250000, variance: 4.0 },
                ]}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Potential risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Budget Overrun Risk</div>
                    <div className="text-sm text-yellow-700">
                      Current spending is 5.3% above budget. Consider cost optimization measures.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border border-green-200 rounded-lg bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Efficiency Improvement</div>
                    <div className="text-sm text-green-700">
                      Overall efficiency is improving. Continue current optimization strategies.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Growth Opportunity</div>
                    <div className="text-sm text-blue-700">
                      ROI is strong at 245.2%. Consider scaling successful initiatives.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 