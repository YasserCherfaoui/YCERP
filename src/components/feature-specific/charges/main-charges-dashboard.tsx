import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchChargesDashboardAsync } from '@/features/charges/charges-slice';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Eye,
    PieChart,
    Plus,
    TrendingDown,
    TrendingUp,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Line, LineChart, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface MainChargesDashboardProps {
  onChargeTypeSelect?: (chargeType: string) => void;
  onQuickAction?: (action: string) => void;
}

const MainChargesDashboard: React.FC<MainChargesDashboardProps> = ({ 
  onChargeTypeSelect, 
  onQuickAction 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.charges);
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30_days');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchChargesDashboardAsync({ period: selectedPeriod }));
  }, [dispatch, selectedPeriod]);

  const handleChargeTypeClick = (chargeType: string) => {
    onChargeTypeSelect?.(chargeType);
    navigate(`/dashboard/company/${chargeType.replace('_', '-')}`);
  };

  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
    switch (action) {
      case 'add_charge':
        navigate('/dashboard/company/charges');
        break;
      case 'view_reports':
        navigate('/dashboard/company/charges?tab=reports');
        break;
      case 'export_data':
        // Handle export
        break;
      default:
        break;
    }
  };

  const getChargeTypeIcon = (type: string) => {
    switch (type) {
      case 'exchange_rates': return <DollarSign className="h-4 w-4" />;
      case 'salaries': return <Calendar className="h-4 w-4" />;
      case 'boxing': return <BarChart3 className="h-4 w-4" />;
      case 'shipping': return <TrendingUp className="h-4 w-4" />;
      case 'returns': return <TrendingDown className="h-4 w-4" />;
      case 'advertising': return <PieChart className="h-4 w-4" />;
      case 'rent_utilities': return <Eye className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getChargeTypeColor = (type: string) => {
    switch (type) {
      case 'exchange_rates': return 'bg-blue-100 text-blue-800';
      case 'salaries': return 'bg-green-100 text-green-800';
      case 'boxing': return 'bg-orange-100 text-orange-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'returns': return 'bg-red-100 text-red-800';
      case 'advertising': return 'bg-yellow-100 text-yellow-800';
      case 'rent_utilities': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Calendar className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  // Sample data for charts
  const totalChargesData = [
    { month: 'Jan', total: 150000, approved: 120000, pending: 25000, rejected: 5000 },
    { month: 'Feb', total: 165000, approved: 140000, pending: 20000, rejected: 5000 },
    { month: 'Mar', total: 180000, approved: 155000, pending: 20000, rejected: 5000 },
    { month: 'Apr', total: 175000, approved: 150000, pending: 20000, rejected: 5000 },
    { month: 'May', total: 190000, approved: 165000, pending: 20000, rejected: 5000 },
    { month: 'Jun', total: 200000, approved: 175000, pending: 20000, rejected: 5000 },
  ];

  const chargeTypeBreakdownData = [
    { name: 'Exchange Rates', value: 45000, color: '#3b82f6' },
    { name: 'Salaries', value: 80000, color: '#10b981' },
    { name: 'Boxing', value: 25000, color: '#f97316' },
    { name: 'Shipping', value: 20000, color: '#8b5cf6' },
    { name: 'Returns', value: 15000, color: '#ef4444' },
    { name: 'Advertising', value: 10000, color: '#fbbf24' },
    { name: 'Rent & Utilities', value: 5000, color: '#6366f1' },
  ];

  const recentActivityData = [
    {
      id: 1,
      type: 'exchange_rates',
      title: 'Euro Purchase',
      amount: 25000,
      status: 'approved',
      date: '2024-01-15',
      user: 'Admin User'
    },
    {
      id: 2,
      type: 'salaries',
      title: 'Employee Salary Payment',
      amount: 15000,
      status: 'pending',
      date: '2024-01-14',
      user: 'HR Manager'
    },
    {
      id: 3,
      type: 'shipping',
      title: 'Yalidine Shipping Fee',
      amount: 5000,
      status: 'approved',
      date: '2024-01-13',
      user: 'Logistics Team'
    },
    {
      id: 4,
      type: 'returns',
      title: 'Customer Return Processing',
      amount: 3000,
      status: 'approved',
      date: '2024-01-12',
      user: 'Customer Service'
    },
    {
      id: 5,
      type: 'advertising',
      title: 'Facebook Ad Campaign',
      amount: 8000,
      status: 'pending',
      date: '2024-01-11',
      user: 'Marketing Team'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Charges Dashboard</h1>
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
          <h1 className="text-3xl font-bold">Charges Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of all business charges and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleQuickAction('export_data')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleQuickAction('add_charge')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Charge
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">200,000 DZD</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(5.2)}
              <span className={getTrendColor(5.2)}>+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Charges</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">175,000 DZD</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(3.8)}
              <span className={getTrendColor(3.8)}>+3.8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20,000 DZD</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(-2.1)}
              <span className={getTrendColor(-2.1)}>-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Charge</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,500 DZD</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(1.5)}
              <span className={getTrendColor(1.5)}>+1.5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charge Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { type: 'exchange_rates', name: 'Exchange Rates', amount: 45000, trend: 8.5 },
              { type: 'salaries', name: 'Salaries', amount: 80000, trend: 2.1 },
              { type: 'boxing', name: 'Boxing', amount: 25000, trend: -1.2 },
              { type: 'shipping', name: 'Shipping', amount: 20000, trend: 5.8 },
              { type: 'returns', name: 'Returns', amount: 15000, trend: -3.4 },
              { type: 'advertising', name: 'Advertising', amount: 10000, trend: 12.5 },
              { type: 'rent_utilities', name: 'Rent & Utilities', amount: 5000, trend: 0.0 },
            ].map((chargeType) => (
              <Card 
                key={chargeType.type} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChargeTypeClick(chargeType.type)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{chargeType.name}</CardTitle>
                  {getChargeTypeIcon(chargeType.type)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{chargeType.amount.toLocaleString()} DZD</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getTrendIcon(chargeType.trend)}
                    <span className={getTrendColor(chargeType.trend)}>
                      {chargeType.trend > 0 ? '+' : ''}{chargeType.trend}% from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Charges Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Total Charges Trend</CardTitle>
              <CardDescription>Monthly charge totals and status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={totalChargesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  <Legend />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Charge Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Charge Type Breakdown</CardTitle>
                <CardDescription>Distribution of charges by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chargeTypeBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chargeTypeBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
                <CardDescription>Charges by approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: 'Approved', count: 45, amount: 175000 },
                    { status: 'Pending', count: 8, amount: 20000 },
                    { status: 'Rejected', count: 2, amount: 5000 },
                  ]}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'amount' ? `${value.toLocaleString()} DZD` : value,
                      name === 'amount' ? 'Amount' : 'Count'
                    ]} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest charge entries and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityData.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getChargeTypeIcon(activity.type)}
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.user} • {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">{activity.amount.toLocaleString()} DZD</div>
                        <div className="text-sm text-muted-foreground">
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Charge volume and value trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={totalChargesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <Badge variant="secondary">87.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Processing Time</span>
                    <Badge variant="secondary">2.3 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost Efficiency</span>
                    <Badge variant="secondary">92.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Budget Utilization</span>
                    <Badge variant="secondary">78.4%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainChargesDashboard; 