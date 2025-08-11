import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SalaryCharge, SalaryHistory } from '@/models/data/charges/salary.model';
import { format, isAfter, isBefore, subDays } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Download,
    LineChart as LineChartIcon,
    Maximize2,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface SalaryHistoryChartProps {
  /** Salary charges data */
  salaryCharges?: SalaryCharge[];
  /** Salary history data */
  salaryHistory?: SalaryHistory[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Employee ID to filter by */
  employeeId?: number;
  /** Department to filter by */
  department?: string;
  /** Chart height */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';
type ChartType = 'line' | 'area' | 'bar';
type MetricType = 'gross_amount' | 'net_amount' | 'base_salary' | 'overtime_amount' | 'deductions' | 'allowances';

interface ChartDataPoint {
  date: string;
  period: string;
  gross_amount: number;
  net_amount: number;
  base_salary: number;
  overtime_amount: number;
  total_deductions: number;
  total_allowances: number;
  employee_count: number;
  average_salary: number;
}

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 3 months', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'all', label: 'All time', days: null },
];

const chartTypeOptions = [
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: Activity },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
];

const metricOptions = [
  { value: 'gross_amount', label: 'Gross Amount', color: '#10b981' },
  { value: 'net_amount', label: 'Net Amount', color: '#3b82f6' },
  { value: 'base_salary', label: 'Base Salary', color: '#8b5cf6' },
  { value: 'overtime_amount', label: 'Overtime', color: '#f59e0b' },
  { value: 'deductions', label: 'Deductions', color: '#ef4444' },
  { value: 'allowances', label: 'Allowances', color: '#06b6d4' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="text-sm font-medium">
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SalaryHistoryChart: React.FC<SalaryHistoryChartProps> = ({
  salaryCharges = [],
  // salaryHistory = [],
  loading = false,
  error = null,
  employeeId,
  department,
  height = 400,
  className,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['gross_amount', 'net_amount']);
  const [showComparison, setShowComparison] = useState(false);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!salaryCharges.length) return [];

    // Filter data by time range
    const now = new Date();
    let startDate: Date;
    
    const selectedRange = timeRangeOptions.find(option => option.value === timeRange);
    if (selectedRange?.days) {
      startDate = subDays(now, selectedRange.days);
    } else {
      startDate = new Date(0); // All time
    }

    let filteredCharges = salaryCharges.filter(charge => {
      const chargeDate = new Date(charge.pay_period_start);
      return isAfter(chargeDate, startDate) && isBefore(chargeDate, now);
    });

    // Filter by employee or department if specified
    if (employeeId) {
      filteredCharges = filteredCharges.filter(charge => charge.employee_id === employeeId);
    }
    if (department) {
      filteredCharges = filteredCharges.filter(charge => charge.employee_department === department);
    }

    // Group by month for better visualization
    const groupedData = new Map<string, ChartDataPoint>();

    filteredCharges.forEach(charge => {
      const date = new Date(charge.pay_period_start);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');

      const existing = groupedData.get(monthKey) || {
        date: monthKey,
        period: monthLabel,
        gross_amount: 0,
        net_amount: 0,
        base_salary: 0,
        overtime_amount: 0,
        total_deductions: 0,
        total_allowances: 0,
        employee_count: 0,
        average_salary: 0,
      };

      existing.gross_amount += charge.gross_amount;
      existing.net_amount += charge.net_amount;
      existing.base_salary += charge.base_salary;
      existing.overtime_amount += charge.overtime_amount || 0;
      existing.total_deductions += charge.total_deductions;
      existing.total_allowances += charge.total_allowances;
      existing.employee_count += 1;
      existing.average_salary = existing.gross_amount / existing.employee_count;

      groupedData.set(monthKey, existing);
    });

    return Array.from(groupedData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [salaryCharges, timeRange, employeeId, department]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!chartData.length) return null;

    const latest = chartData[chartData.length - 1];
    const previous = chartData.length > 1 ? chartData[chartData.length - 2] : null;

    const calculateChange = (current: number, prev: number) => {
      if (prev === 0) return 0;
      return ((current - prev) / prev) * 100;
    };

    return {
      current: {
        gross_amount: latest.gross_amount,
        net_amount: latest.net_amount,
        employee_count: latest.employee_count,
        average_salary: latest.average_salary,
      },
      changes: previous ? {
        gross_amount: calculateChange(latest.gross_amount, previous.gross_amount),
        net_amount: calculateChange(latest.net_amount, previous.net_amount),
        employee_count: calculateChange(latest.employee_count, previous.employee_count),
        average_salary: calculateChange(latest.average_salary, previous.average_salary),
      } : null,
    };
  }, [chartData]);

  const handleMetricToggle = (metric: MetricType) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No salary data available for the selected period</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const renderLines = () => selectedMetrics.map(metric => {
      const metricConfig = metricOptions.find(opt => opt.value === metric);
      if (!metricConfig) return null;

      const dataKey = metric === 'deductions' ? 'total_deductions' : 
                     metric === 'allowances' ? 'total_allowances' : metric;

      if (chartType === 'line') {
        return (
          <Line
            key={metric}
            type="monotone"
            dataKey={dataKey}
            stroke={metricConfig.color}
            strokeWidth={2}
            name={metricConfig.label}
            dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: metricConfig.color, strokeWidth: 2 }}
          />
        );
      } else if (chartType === 'area') {
        return (
          <Area
            key={metric}
            type="monotone"
            dataKey={dataKey}
            stackId={showComparison ? undefined : "1"}
            stroke={metricConfig.color}
            fill={metricConfig.color}
            fillOpacity={0.1}
            name={metricConfig.label}
          />
        );
      } else {
        return (
          <Bar
            key={metric}
            dataKey={dataKey}
            fill={metricConfig.color}
            name={metricConfig.label}
          />
        );
      }
    });

    return (
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {renderLines()}
            <Brush 
              dataKey="period" 
              height={30} 
              stroke="hsl(var(--primary))"
            />
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {renderLines()}
            <Brush 
              dataKey="period" 
              height={30} 
              stroke="hsl(var(--primary))"
            />
          </AreaChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {renderLines()}
            <Brush 
              dataKey="period" 
              height={30} 
              stroke="hsl(var(--primary))"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading salary trends...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load salary history: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Salary Trends</span>
              {employeeId && (
                <Badge variant="outline">Employee #{employeeId}</Badge>
              )}
              {department && (
                <Badge variant="outline">{department}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Historical salary data analysis and trends
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Stack:</label>
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Separate" : "Compare"}
            </Button>
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Metrics</label>
          <div className="flex flex-wrap gap-2">
            {metricOptions.map(metric => (
              <Button
                key={metric.value}
                variant={selectedMetrics.includes(metric.value as any) ? "default" : "outline"}
                size="sm"
                onClick={() => handleMetricToggle(metric.value as any)}
                className="h-8"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: metric.color }} 
                />
                {metric.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Total Gross</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(statistics.current.gross_amount)}
                </p>
                {statistics.changes && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {statistics.changes.gross_amount > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : statistics.changes.gross_amount < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={cn(
                      'text-xs font-medium',
                      statistics.changes.gross_amount > 0 ? 'text-green-600' : 
                      statistics.changes.gross_amount < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {Math.abs(statistics.changes.gross_amount).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Total Net</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(statistics.current.net_amount)}
                </p>
                {statistics.changes && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {statistics.changes.net_amount > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : statistics.changes.net_amount < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={cn(
                      'text-xs font-medium',
                      statistics.changes.net_amount > 0 ? 'text-green-600' : 
                      statistics.changes.net_amount < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {Math.abs(statistics.changes.net_amount).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 mb-1">Employees</p>
                <p className="text-lg font-bold text-purple-700">
                  {statistics.current.employee_count}
                </p>
                {statistics.changes && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {statistics.changes.employee_count > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : statistics.changes.employee_count < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={cn(
                      'text-xs font-medium',
                      statistics.changes.employee_count > 0 ? 'text-green-600' : 
                      statistics.changes.employee_count < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {Math.abs(statistics.changes.employee_count).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-600 mb-1">Avg. Salary</p>
                <p className="text-lg font-bold text-yellow-700">
                  {formatCurrency(statistics.current.average_salary)}
                </p>
                {statistics.changes && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {statistics.changes.average_salary > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : statistics.changes.average_salary < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                    <span className={cn(
                      'text-xs font-medium',
                      statistics.changes.average_salary > 0 ? 'text-green-600' : 
                      statistics.changes.average_salary < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {Math.abs(statistics.changes.average_salary).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Chart */}
        <div className="w-full">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryHistoryChart;