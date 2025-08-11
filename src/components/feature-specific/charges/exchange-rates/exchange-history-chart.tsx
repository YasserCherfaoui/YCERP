import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ExchangeRateHistory } from '@/models/data/charges/exchange-rate.model';
import { format, isAfter, parseISO, subDays, subMonths, subWeeks } from 'date-fns';
import {
    Activity,
    BarChart3,
    Calendar,
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
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface ExchangeHistoryChartProps {
  /** Historical exchange rate data */
  data: ExchangeRateHistory[];
  /** Currency pair being displayed */
  currencyPair: string;
  /** Whether the component is loading */
  loading?: boolean;
  /** Chart height */
  height?: number;
  /** Show chart controls */
  showControls?: boolean;
  /** Show statistics */
  showStats?: boolean;
  /** Chart variant */
  variant?: 'line' | 'area' | 'combined';
  /** Additional CSS classes */
  className?: string;
  /** Callback when time range changes */
  onTimeRangeChange?: (range: string) => void;
  /** Callback when chart type changes */
  onChartTypeChange?: (type: string) => void;
}

type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
type ChartType = 'line' | 'area' | 'candlestick';

interface ChartDataPoint {
  timestamp: string;
  date: Date;
  rate: number;
  high?: number;
  low?: number;
  volume?: number;
  source: string;
  formattedDate: string;
}

interface ChartStats {
  current: number;
  highest: number;
  lowest: number;
  average: number;
  change: number;
  changePercent: number;
  volatility: number;
}

const timeRangeOptions = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

const chartTypeOptions = [
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: BarChart3 },
  { value: 'candlestick', label: 'Candlestick', icon: Activity },
];

export const ExchangeHistoryChart: React.FC<ExchangeHistoryChartProps> = ({
  data = [],
  currencyPair,
  loading = false,
  height = 400,
  showControls = true,
  showStats = true,
  variant = 'line',
  className,
  onTimeRangeChange,
  onChartTypeChange,
}) => {
  console.log('ExchangeHistoryChart - Received data:', data);
  console.log('ExchangeHistoryChart - Data length:', data.length);
  console.log('ExchangeHistoryChart - Currency pair:', currencyPair);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Process and filter data based on selected time range
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    // Filter by time range
    let filteredData = sortedData;
    const now = new Date();
    
    if (selectedTimeRange !== 'all') {
      let startDate: Date;
      
      switch (selectedTimeRange) {
        case '24h':
          startDate = subDays(now, 1);
          break;
        case '7d':
          startDate = subWeeks(now, 1);
          break;
        case '30d':
          startDate = subMonths(now, 1);
          break;
        case '90d':
          startDate = subMonths(now, 3);
          break;
        case '1y':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = new Date(0);
      }
      
      filteredData = sortedData.filter(item => 
        isAfter(parseISO(item.recorded_at), startDate)
      );
    }

    // Transform data for charts
    return filteredData.map(item => ({
      timestamp: item.recorded_at,
      date: parseISO(item.recorded_at),
      rate: item.rate,
      high: item.high_rate,
      low: item.low_rate,
      volume: item.volume,
      source: item.source,
      formattedDate: format(parseISO(item.recorded_at), 'MMM dd, HH:mm'),
    }));
  }, [data, selectedTimeRange]);

  // Calculate statistics
  const stats: ChartStats = useMemo(() => {
    if (!processedData.length) {
      return {
        current: 0,
        highest: 0,
        lowest: 0,
        average: 0,
        change: 0,
        changePercent: 0,
        volatility: 0,
      };
    }

    const rates = processedData.map(d => d.rate);
    const current = rates[rates.length - 1];
    const previous = rates[0];
    const highest = Math.max(...rates);
    const lowest = Math.min(...rates);
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const change = current - previous;
    const changePercent = ((change / previous) * 100);
    
    // Calculate volatility (standard deviation)
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - average, 2), 0) / rates.length;
    const volatility = Math.sqrt(variance);

    return {
      current,
      highest,
      lowest,
      average,
      change,
      changePercent,
      volatility,
    };
  }, [processedData]);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range as TimeRange);
    onTimeRangeChange?.(range);
  };

  const handleChartTypeChange = (type: string) => {
    setSelectedChartType(type as ChartType);
    onChartTypeChange?.(type);
  };

  const exportChart = () => {
    // In a real implementation, this would export the chart data
    console.log('Exporting chart data:', processedData);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="font-medium text-foreground">
            {format(data.date, 'MMM dd, yyyy HH:mm')}
          </p>
          <p className="text-sm text-primary">
            Rate: <span className="font-mono">{data.rate.toFixed(4)}</span>
          </p>
          {data.high && data.low && (
            <>
              <p className="text-xs text-green-600">
                High: <span className="font-mono">{data.high.toFixed(4)}</span>
              </p>
              <p className="text-xs text-red-600">
                Low: <span className="font-mono">{data.low.toFixed(4)}</span>
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            Source: {data.source}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (selectedChartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <ReferenceLine 
              y={stats.average} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              label={{ value: "Average", position: "insideTopRight" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="formattedDate" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={['dataMin - 0.01', 'dataMax + 0.01']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            name="Exchange Rate"
          />
          {selectedChartType === 'candlestick' && processedData.some(d => d.high && d.low) && (
            <>
              <Line
                type="monotone"
                dataKey="high"
                stroke="hsl(var(--green-600))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="High"
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="hsl(var(--red-600))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Low"
              />
            </>
          )}
          <ReferenceLine 
            y={stats.average} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="5 5"
            label={{ value: "Average", position: "insideTopRight" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const StatsCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string;
    change?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
      <div className={cn(
        'p-2 rounded-md',
        trend === 'up' && 'bg-green-100 text-green-600',
        trend === 'down' && 'bg-red-100 text-red-600',
        trend === 'neutral' && 'bg-blue-100 text-blue-600'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {change && (
          <p className={cn(
            'text-xs',
            trend === 'up' && 'text-green-600',
            trend === 'down' && 'text-red-600',
            trend === 'neutral' && 'text-muted-foreground'
          )}>
            {change}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChartIcon className="h-5 w-5" />
            <span>Exchange Rate History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <Activity className="h-8 w-8 animate-pulse text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <LineChartIcon className="h-5 w-5" />
            <span>Exchange Rate History - {currencyPair}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
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

            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedChartType} onValueChange={handleChartTypeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypeOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="ml-auto">
              {processedData.length} data points
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {showStats && processedData.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Current Rate"
                value={stats.current.toFixed(4)}
                change={`${stats.changePercent > 0 ? '+' : ''}${stats.changePercent.toFixed(2)}%`}
                icon={Activity}
                trend={stats.changePercent > 0 ? 'up' : stats.changePercent < 0 ? 'down' : 'neutral'}
              />
              <StatsCard
                title="Highest"
                value={stats.highest.toFixed(4)}
                icon={TrendingUp}
                trend="up"
              />
              <StatsCard
                title="Lowest" 
                value={stats.lowest.toFixed(4)}
                icon={TrendingDown}
                trend="down"
              />
              <StatsCard
                title="Average"
                value={stats.average.toFixed(4)}
                change={`Volatility: ${stats.volatility.toFixed(4)}`}
                icon={BarChart3}
                trend="neutral"
              />
            </div>
            <Separator />
          </>
        )}

        {processedData.length > 0 ? (
          <div className="space-y-4">
            {renderChart()}
            
            {processedData.length > 50 && (
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData}>
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={1}
                      dot={false}
                    />
                    <Brush 
                      dataKey="formattedDate" 
                      height={20}
                      stroke="hsl(var(--primary))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                No exchange rate history found for the selected time range.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeHistoryChart;