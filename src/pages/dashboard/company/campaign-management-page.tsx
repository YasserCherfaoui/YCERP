import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAdvertisingCampaignsAsync } from '@/features/charges/advertising-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    BarChart3, DollarSign,
    Eye, Plus,
    Settings,
    Target,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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

export interface CampaignManagementPageProps {
  className?: string;
}

export interface AdvertisingCampaign {
  id: number;
  name: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'youtube' | 'other';
  campaign_type: 'awareness' | 'consideration' | 'conversion' | 'retargeting';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget: number;
  spent_amount: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  target_audience: string;
  ad_creative_url?: string;
  tracking_pixel?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const CampaignManagementPage: React.FC<CampaignManagementPageProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, loading, error } = useSelector((state: RootState) => state.advertising);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  useEffect(() => {
    dispatch(fetchAdvertisingCampaignsAsync());
  }, [dispatch]);

  const handleCreateCampaign = () => {
    // Open campaign creation dialog
    console.log('Create new campaign');
  };

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'google': return '🔍';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      default: return '📢';
    }
  };

  const filteredCampaigns = campaigns?.filter(campaign => {
    const platformMatch = selectedPlatform === 'all' || campaign.platform === selectedPlatform;
    const statusMatch = selectedStatus === 'all' || campaign.status === selectedStatus;
    return platformMatch && statusMatch;
  }) || [];

  const totalBudget = campaigns?.reduce((sum, campaign) => sum + campaign.budget, 0) || 0;
  const totalSpent = campaigns?.reduce((sum, campaign) => sum + campaign.spent_amount, 0) || 0;
  const totalImpressions = campaigns?.reduce((sum, campaign) => sum + campaign.impressions, 0) || 0;
  const totalClicks = campaigns?.reduce((sum, campaign) => sum + campaign.clicks, 0) || 0;
  const totalConversions = campaigns?.reduce((sum, campaign) => sum + campaign.conversions, 0) || 0;

  const averageROAS = campaigns?.length ? campaigns.reduce((sum, campaign) => sum + campaign.roas, 0) / campaigns.length : 0;
  const averageCTR = campaigns?.length ? campaigns.reduce((sum, campaign) => sum + campaign.ctr, 0) / campaigns.length : 0;

  // Mock data for charts
  const performanceData = [
    { date: 'Jan', impressions: 45000, clicks: 1200, conversions: 45, spend: 1500000 },
    { date: 'Feb', impressions: 52000, clicks: 1400, conversions: 52, spend: 1800000 },
    { date: 'Mar', impressions: 48000, clicks: 1300, conversions: 48, spend: 1600000 },
    { date: 'Apr', impressions: 61000, clicks: 1800, conversions: 61, spend: 2200000 },
    { date: 'May', impressions: 55000, clicks: 1600, conversions: 55, spend: 1900000 },
    { date: 'Jun', impressions: 67000, clicks: 2000, conversions: 67, spend: 2500000 },
  ];

  const platformBreakdown = [
    { platform: 'Facebook', spend: 2500000, impressions: 150000, clicks: 4000 },
    { platform: 'Instagram', spend: 1800000, impressions: 120000, clicks: 3000 },
    { platform: 'Google', spend: 2200000, impressions: 80000, clicks: 2500 },
    { platform: 'TikTok', spend: 1500000, impressions: 200000, clicks: 5000 },
    { platform: 'YouTube', spend: 1000000, impressions: 60000, clicks: 1500 },
  ];

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground">
            Manage and track your advertising campaigns across all platforms
          </p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalImpressions)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(totalClicks)} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalConversions)}</div>
            <p className="text-xs text-muted-foreground">
              {averageCTR.toFixed(2)}% CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageROAS.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">
              Return on ad spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Monthly performance metrics across all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatNumber(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="impressions" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="clicks" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="conversions" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Spend and performance by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="spend" fill="#8884d8" />
                    <Bar dataKey="impressions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
                <CardDescription>
                  Distribution of campaigns by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: campaigns?.filter(c => c.status === 'active').length || 0, color: '#10b981' },
                        { name: 'Paused', value: campaigns?.filter(c => c.status === 'paused').length || 0, color: '#f59e0b' },
                        { name: 'Completed', value: campaigns?.filter(c => c.status === 'completed').length || 0, color: '#3b82f6' },
                        { name: 'Draft', value: campaigns?.filter(c => c.status === 'draft').length || 0, color: '#6b7280' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[
                        { name: 'Active', value: campaigns?.filter(c => c.status === 'active').length || 0, color: '#10b981' },
                        { name: 'Paused', value: campaigns?.filter(c => c.status === 'paused').length || 0, color: '#f59e0b' },
                        { name: 'Completed', value: campaigns?.filter(c => c.status === 'completed').length || 0, color: '#3b82f6' },
                        { name: 'Draft', value: campaigns?.filter(c => c.status === 'draft').length || 0, color: '#6b7280' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="platform-filter">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Platforms" />
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
                </div>
                <div className="flex-1">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    onSelect={setDateRange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                {filteredCampaigns.length} campaigns found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.campaign_type} • {campaign.target_audience}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPlatformIcon(campaign.platform)}</span>
                          <span className="capitalize">{campaign.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(campaign.budget)}</div>
                          <div className="text-sm text-muted-foreground">
                            {((campaign.spent_amount / campaign.budget) * 100).toFixed(1)}% used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(campaign.spent_amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(campaign.impressions)} impressions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            CTR: {campaign.ctr.toFixed(2)}%
                          </div>
                          <div className="text-sm">
                            CPC: {formatCurrency(campaign.cpc)}
                          </div>
                          <div className="text-sm">
                            ROAS: {campaign.roas.toFixed(2)}x
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROAS Trend</CardTitle>
                <CardDescription>
                  Return on ad spend over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="conversions" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>
                  Cost per click and cost per thousand impressions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="spend" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>
                Configure default campaign settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-budget">Default Budget</Label>
                <Input id="default-budget" placeholder="Enter default campaign budget" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-audience">Default Target Audience</Label>
                <Input id="default-audience" placeholder="Enter default target audience" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking-pixel">Default Tracking Pixel</Label>
                <Input id="tracking-pixel" placeholder="Enter default tracking pixel" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-optimization" defaultChecked />
                <Label htmlFor="auto-optimization">Enable automatic campaign optimization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="budget-alerts" defaultChecked />
                <Label htmlFor="budget-alerts">Enable budget alerts</Label>
              </div>
              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Integration</CardTitle>
              <CardDescription>
                Connect your advertising platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Facebook Ads', connected: true, icon: '📘' },
                  { name: 'Google Ads', connected: true, icon: '🔍' },
                  { name: 'TikTok Ads', connected: false, icon: '🎵' },
                  { name: 'Instagram Ads', connected: true, icon: '📷' },
                  { name: 'YouTube Ads', connected: false, icon: '📺' },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Button variant={platform.connected ? 'outline' : 'default'} size="sm">
                      {platform.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignManagementPage; 