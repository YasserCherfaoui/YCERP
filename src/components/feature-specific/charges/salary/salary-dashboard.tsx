import { RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePendingSalaryCharges, useSalaryDashboard } from '@/hooks/use-salary';
import { cn } from '@/lib/utils';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import {
    AlertTriangle,
    Award,
    BarChart3,
    Calculator,
    Clock,
    DollarSign,
    PieChart,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useSelector } from 'react-redux';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface SalaryDashboardProps {
  /** Additional CSS classes */
  className?: string;
}

interface DashboardFilters {
  dateRange: DateRange | undefined;
  department?: string;
  employmentType?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
];

export const SalaryDashboard: React.FC<SalaryDashboardProps> = ({
  className,
}) => {
  // Get company ID from Redux state
  const companyId = useSelector((state: RootState) => state.company?.company?.ID || state.user?.company?.ID);
  
  // Local state
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date()),
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  // Memoize the filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    dateRange: filters.dateRange,
    department: filters.department,
    employmentType: filters.employmentType,
  }), [
    filters.dateRange?.from?.getTime(),
    filters.dateRange?.to?.getTime(),
    filters.department,
    filters.employmentType
  ]);

  // React Query hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useSalaryDashboard({
    date_from: memoizedFilters.dateRange?.from ? format(memoizedFilters.dateRange.from, 'yyyy-MM-dd') : undefined,
    date_to: memoizedFilters.dateRange?.to ? format(memoizedFilters.dateRange.to, 'yyyy-MM-dd') : undefined,
    department: memoizedFilters.department,
    employment_type: memoizedFilters.employmentType as "full_time" | "part_time" | "contract" | "temporary" | undefined,
    company_id: companyId
  });

  const {
    refetch: refetchPendingCharges
  } = usePendingSalaryCharges({ 
    limit: 10,
    company_id: companyId 
  });

  // Initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    if (!memoizedFilters.dateRange?.from || !memoizedFilters.dateRange?.to) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        refetchPendingCharges()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDashboard, refetchPendingCharges, memoizedFilters]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  const handleRefresh = async () => {
    if (!filters.dateRange?.from || !filters.dateRange?.to) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        refetchPendingCharges()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (date: DateRange | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: date,
    }));
  };

  const handleDepartmentChange = (department: string) => {
    setFilters(prev => ({
      ...prev,
      department: department === 'all' ? undefined : department,
    }));
  };

  const handleEmploymentTypeChange = (employmentType: string) => {
    setFilters(prev => ({
      ...prev,
      employmentType: employmentType === 'all' ? undefined : employmentType,
    }));
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    color = 'blue'
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600',
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{value}</p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
                {trend && trendValue && (
                  <div className="flex items-center space-x-1">
                    {trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : trend === 'down' ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    <span className={cn('text-xs font-medium', trendColors[trend])}>
                      {trendValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (dashboardLoading && !dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dashboardError) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {dashboardError instanceof Error ? dashboardError.message : 'Failed to load dashboard data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const dashboard = dashboardData?.data;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salary Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of salary costs, trends, and analytics.
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onSelect={handleDateRangeChange}
                className="w-72"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={filters.department || 'all'} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {dashboard?.department_breakdown?.map(dept => (
                    <SelectItem key={dept.department} value={dept.department}>
                      {dept.department} ({dept.employee_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <Select value={filters.employmentType || 'all'} onValueChange={handleEmploymentTypeChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {dashboard?.employment_type_breakdown?.map(type => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.type} ({type.employee_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={dashboard?.total_employees?.toString() || '0'}
          subtitle="Active employees"
          icon={Users}
          color="blue"
        />
        
        <StatCard
          title="Total Salary Cost"
          value={formatCurrency(dashboard?.total_salary_cost || 0)}
          subtitle="Gross payroll amount"
          icon={DollarSign}
          color="green"
        />
        
        <StatCard
          title="Average Salary"
          value={formatCurrency(dashboard?.average_salary || 0)}
          subtitle="Per employee"
          icon={Calculator}
          color="purple"
        />
        
        <StatCard
          title="Pending Approvals"
          value={dashboard?.salary_status_summary?.pending_approvals?.toString() || '0'}
          subtitle="Awaiting approval"
          icon={AlertTriangle}
          color={(dashboard?.salary_status_summary?.pending_approvals || 0) > 0 ? "yellow" : "green"}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Overtime Cost"
          value={formatCurrency(dashboard?.overtime_cost || 0)}
          subtitle="Overtime expenses"
          icon={Clock}
          color="blue"
        />
        
        <StatCard
          title="Total Deductions"
          value={formatCurrency(dashboard?.total_deductions || 0)}
          subtitle="Taxes, insurance, etc."
          icon={TrendingDown}
          color="red"
        />
        
        <StatCard
          title="Total Allowances"
          value={formatCurrency(dashboard?.total_allowances || 0)}
          subtitle="Benefits and allowances"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Net Payroll Cost"
          value={formatCurrency(dashboard?.net_payroll_cost || 0)}
          subtitle="After deductions"
          icon={DollarSign}
          color="blue"
        />
        
        <StatCard
          title="Median Salary"
          value={formatCurrency(dashboard?.median_salary || 0)}
          subtitle="Middle value"
          icon={Calculator}
          color="purple"
        />
        
        <StatCard
          title="Highest Salary"
          value={formatCurrency(dashboard?.highest_salary || 0)}
          subtitle="Top earner"
          icon={Award}
          color="green"
        />
        
        <StatCard
          title="Lowest Salary"
          value={formatCurrency(dashboard?.lowest_salary || 0)}
          subtitle="Entry level"
          icon={Users}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Trends</span>
            </CardTitle>
            <CardDescription>
              Salary cost trends over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard?.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total Cost']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="total_cost"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Department Breakdown</span>
            </CardTitle>
            <CardDescription>
              Salary distribution by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={dashboard?.department_breakdown || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_cost"
                  label={({ department, employee_count, percentage_of_total }) => 
                    `${department} (${employee_count} - ${(percentage_of_total * 100).toFixed(1)}%)`
                  }
                >
                  {(dashboard?.department_breakdown || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total Cost']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employment Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Employment Type</span>
            </CardTitle>
            <CardDescription>
              Salary distribution by employment type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard?.employment_type_breakdown || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  type="category"
                  dataKey="type"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total Cost']} />
                <Bar dataKey="total_cost" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              Employee performance and bonus statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Performance Rating</span>
                <span className="font-bold">{dashboard?.performance_metrics?.average_performance_rating?.toFixed(1) || '0'}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Employees with Bonus</span>
                <span className="font-bold">{dashboard?.performance_metrics?.employees_with_bonus || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Bonus Amount</span>
                <span className="font-bold">{formatCurrency(dashboard?.performance_metrics?.total_bonus_amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">KPI Achievement Rate</span>
                <span className="font-bold">{((dashboard?.performance_metrics?.kpi_achievement_rate || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Earners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Top Earners</span>
            </CardTitle>
            <CardDescription>
              Employees with highest net salary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dashboard?.top_earners || []).slice(0, 10).map((earner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{earner.employee_name}</p>
                      <p className="text-sm text-muted-foreground">{earner.position} - {earner.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(earner.net_amount)}</p>
                    <p className="text-xs text-muted-foreground">Gross: {formatCurrency(earner.gross_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Compliance Summary</span>
            </CardTitle>
            <CardDescription>
              Tax and regulatory compliance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Tax Deductions</span>
                <span className="font-bold">{formatCurrency(dashboard?.compliance_summary?.total_tax_deductions || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Social Security</span>
                <span className="font-bold">{formatCurrency(dashboard?.compliance_summary?.total_social_security || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Insurance</span>
                <span className="font-bold">{formatCurrency(dashboard?.compliance_summary?.total_insurance || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tax Compliance</span>
                <span className="font-bold">{((dashboard?.compliance_summary?.tax_declaration_compliance || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalaryDashboard;