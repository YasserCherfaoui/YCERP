import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchYalidineReturnsAsync, syncYalidineDataAsync } from '@/features/charges/returns-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    RefreshCw,
    Settings,
    Sync,
    Truck, XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface YalidineIntegrationProps {
  className?: string;
}

export interface YalidineReturn {
  id: string;
  tracking_number: string;
  return_reason: string;
  return_status: 'pending' | 'approved' | 'rejected' | 'processed' | 'completed';
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  return_date: string;
  pickup_date?: string;
  delivery_date?: string;
  return_amount: number;
  return_fee: number;
  notes?: string;
  yalidine_center: string;
  yalidine_commune: string;
  package_weight: number;
  package_dimensions: string;
  return_label_url?: string;
  return_receipt_url?: string;
}

export interface YalidineSyncStatus {
  last_sync: string;
  sync_status: 'idle' | 'syncing' | 'completed' | 'failed';
  total_returns: number;
  new_returns: number;
  updated_returns: number;
  failed_syncs: number;
  sync_progress: number;
  error_message?: string;
}

const YalidineIntegration: React.FC<YalidineIntegrationProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { yalidineReturns, syncStatus, loading, error } = useSelector((state: RootState) => state.returns);
  
  const [activeTab, setActiveTab] = useState('returns');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    // Load Yalidine returns data
    dispatch(fetchYalidineReturnsAsync());
  }, [dispatch]);

  const handleSyncData = () => {
    dispatch(syncYalidineDataAsync());
  };

  const handleReturnAction = (returnId: string, action: string) => {
    // Handle return actions (approve, reject, process, etc.)
    console.log(`Action ${action} for return ${returnId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processed': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredReturns = yalidineReturns?.filter(returnItem => {
    const statusMatch = selectedStatus === 'all' || returnItem.return_status === selectedStatus;
    const centerMatch = selectedCenter === 'all' || returnItem.yalidine_center === selectedCenter;
    return statusMatch && centerMatch;
  }) || [];

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
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Yalidine Integration
              </CardTitle>
              <CardDescription>
                Manage Yalidine returns and synchronization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
                id="auto-sync"
              />
              <Label htmlFor="auto-sync">Auto Sync</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Last Sync</Label>
              <p className="text-lg font-medium">
                {syncStatus?.last_sync ? new Date(syncStatus.last_sync).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Sync Status</Label>
              <div className="flex items-center gap-2">
                {syncStatus?.sync_status === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Badge variant={syncStatus?.sync_status === 'completed' ? 'default' : 'secondary'}>
                  {syncStatus?.sync_status || 'idle'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Total Returns</Label>
              <p className="text-lg font-medium">{syncStatus?.total_returns || 0}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">New Returns</Label>
              <p className="text-lg font-medium text-green-600">{syncStatus?.new_returns || 0}</p>
            </div>
          </div>
          
          {syncStatus?.sync_status === 'syncing' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing data...</span>
                <span>{syncStatus.sync_progress}%</span>
              </div>
              <Progress value={syncStatus.sync_progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSyncData} disabled={syncStatus?.sync_status === 'syncing'}>
              <Sync className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Returns Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="center-filter">Center</Label>
                  <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Centers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Centers</SelectItem>
                      <SelectItem value="Algiers Center">Algiers Center</SelectItem>
                      <SelectItem value="Oran Center">Oran Center</SelectItem>
                      <SelectItem value="Constantine Center">Constantine Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Yalidine Returns</CardTitle>
              <CardDescription>
                {filteredReturns.length} returns found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Amount</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-mono">
                        {returnItem.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{returnItem.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {returnItem.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(returnItem.return_status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(returnItem.return_status)}
                            {returnItem.return_status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(returnItem.return_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fee: {formatCurrency(returnItem.return_fee)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{returnItem.yalidine_center}</div>
                          <div className="text-sm text-muted-foreground">
                            {returnItem.yalidine_commune}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(returnItem.return_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {returnItem.return_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReturnAction(returnItem.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturnAction(returnItem.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {returnItem.return_status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => handleReturnAction(returnItem.id, 'process')}
                            >
                              Process
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
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
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{yalidineReturns?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {yalidineReturns?.filter(r => r.return_status === 'pending').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(yalidineReturns?.reduce((sum, r) => sum + r.return_amount, 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Return value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Return Reasons Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Return Reasons</CardTitle>
              <CardDescription>
                Most common reasons for returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Damaged Package', 'Wrong Item', 'Size Issue', 'Quality Problem', 'Other'].map((reason, index) => (
                  <div key={reason} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{reason}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${30 - index * 5}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {30 - index * 5}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure Yalidine API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter Yalidine API key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input id="api-secret" type="password" placeholder="Enter Yalidine API secret" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="Enter webhook URL for real-time updates" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-sync-settings" checked={autoSync} onCheckedChange={setAutoSync} />
                <Label htmlFor="auto-sync-settings">Enable automatic synchronization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Enable notifications for new returns</Label>
              </div>
              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Test Connection</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent synchronization activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2024-01-15 14:30:00', status: 'completed', new_returns: 5, updated: 2 },
                  { date: '2024-01-15 10:15:00', status: 'completed', new_returns: 3, updated: 1 },
                  { date: '2024-01-14 16:45:00', status: 'failed', new_returns: 0, updated: 0 },
                  { date: '2024-01-14 09:20:00', status: 'completed', new_returns: 8, updated: 3 },
                ].map((sync, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        sync.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <div>
                        <p className="font-medium">{new Date(sync.date).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {sync.new_returns} new returns, {sync.updated} updated
                        </p>
                      </div>
                    </div>
                    <Badge variant={sync.status === 'completed' ? 'default' : 'destructive'}>
                      {sync.status}
                    </Badge>
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

export default YalidineIntegration; 