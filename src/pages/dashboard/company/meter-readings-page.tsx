import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchMeterReadingsAsync } from '@/features/charges/rent-utility-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    BarChart3, CheckCircle,
    Clock,
    Droplets,
    Flame,
    Gauge,
    Plus,
    Settings,
    TrendingUp, Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend, ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface MeterReadingsPageProps {
  className?: string;
}

export interface MeterReading {
  id: number;
  meter_id: string;
  meter_type: 'electricity' | 'water' | 'gas' | 'steam' | 'other';
  property_id: number;
  property_name: string;
  reading_date: string;
  reading_value: number;
  previous_reading: number;
  consumption: number;
  unit: string;
  reading_method: 'manual' | 'automatic' | 'estimated' | 'remote';
  is_validated: boolean;
  validation_notes?: string;
  estimated_reading: boolean;
  adjustment_amount?: number;
  reader_id?: number;
  reader_name?: string;
  photo_url?: string;
  gps_coordinates?: string;
  created_at: string;
}

export interface Meter {
  id: string;
  property_id: number;
  property_name: string;
  meter_type: string;
  meter_model?: string;
  serial_number?: string;
  installation_date?: string;
  last_calibration_date?: string;
  location_description: string;
  building_section?: string;
  floor?: string;
  room?: string;
  capacity?: number;
  unit: string;
  accuracy_class?: string;
  digital_enabled: boolean;
  remote_reading_capable: boolean;
  utility_provider: string;
  provider_meter_id?: string;
  tariff_code?: string;
  meter_status: 'active' | 'inactive' | 'faulty' | 'replaced';
  last_reading_date?: string;
  next_reading_date?: string;
  maintenance_schedule?: string;
  warranty_expiry?: string;
  replacement_due_date?: string;
}

const MeterReadingsPage: React.FC<MeterReadingsPageProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { meterReadings, meters, loading, error } = useSelector((state: RootState) => state.rentUtility);
  
  const [activeTab, setActiveTab] = useState('readings');
  const [selectedMeterType, setSelectedMeterType] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    dispatch(fetchMeterReadingsAsync());
  }, [dispatch]);

  const handleAddReading = () => {
    // Open meter reading form
    console.log('Add new meter reading');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-DZ').format(num);
  };

  const getMeterTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-4 w-4" />;
      case 'water': return <Droplets className="h-4 w-4" />;
      case 'gas': return <Flame className="h-4 w-4" />;
      case 'steam': return <Gauge className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getMeterTypeColor = (type: string) => {
    switch (type) {
      case 'electricity': return 'text-yellow-600';
      case 'water': return 'text-blue-600';
      case 'gas': return 'text-orange-600';
      case 'steam': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'faulty': return 'bg-red-100 text-red-800';
      case 'replaced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReadings = meterReadings?.filter(reading => {
    const typeMatch = selectedMeterType === 'all' || reading.meter_type === selectedMeterType;
    const propertyMatch = selectedProperty === 'all' || reading.property_id.toString() === selectedProperty;
    return typeMatch && propertyMatch;
  }) || [];

  const totalReadings = meterReadings?.length || 0;
  const totalConsumption = meterReadings?.reduce((sum, reading) => sum + reading.consumption, 0) || 0;
  const validatedReadings = meterReadings?.filter(reading => reading.is_validated).length || 0;
  const estimatedReadings = meterReadings?.filter(reading => reading.estimated_reading).length || 0;

  // Mock data for charts
  const consumptionData = [
    { date: 'Jan', electricity: 1200, water: 800, gas: 600, steam: 400 },
    { date: 'Feb', electricity: 1350, water: 850, gas: 650, steam: 450 },
    { date: 'Mar', electricity: 1100, water: 900, gas: 700, steam: 500 },
    { date: 'Apr', electricity: 1400, water: 950, gas: 750, steam: 550 },
    { date: 'May', electricity: 1300, water: 1000, gas: 800, steam: 600 },
    { date: 'Jun', electricity: 1500, water: 1050, gas: 850, steam: 650 },
  ];

  const meterStatusData = [
    { status: 'Active', count: meters?.filter(m => m.meter_status === 'active').length || 0 },
    { status: 'Inactive', count: meters?.filter(m => m.meter_status === 'inactive').length || 0 },
    { status: 'Faulty', count: meters?.filter(m => m.meter_status === 'faulty').length || 0 },
    { status: 'Replaced', count: meters?.filter(m => m.meter_status === 'replaced').length || 0 },
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
          <h1 className="text-3xl font-bold">Meter Readings</h1>
          <p className="text-muted-foreground">
            Manage utility meter readings and consumption tracking
          </p>
        </div>
        <Button onClick={handleAddReading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reading
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalReadings)}</div>
            <p className="text-xs text-muted-foreground">
              {validatedReadings} validated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalConsumption)}</div>
            <p className="text-xs text-muted-foreground">
              All utility types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated Readings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(validatedReadings)}</div>
            <p className="text-xs text-muted-foreground">
              {totalReadings ? ((validatedReadings / totalReadings) * 100).toFixed(1) : 0}% accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Readings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(estimatedReadings)}</div>
            <p className="text-xs text-muted-foreground">
              Require validation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="readings">Readings</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="readings" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="meter-type-filter">Meter Type</Label>
                  <Select value={selectedMeterType} onValueChange={setSelectedMeterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="steam">Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="property-filter">Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="1">Main Office</SelectItem>
                      <SelectItem value="2">Warehouse A</SelectItem>
                      <SelectItem value="3">Retail Store</SelectItem>
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

          {/* Readings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Meter Readings</CardTitle>
              <CardDescription>
                {filteredReadings.length} readings found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Reading Date</TableHead>
                    <TableHead>Reading Value</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={getMeterTypeColor(reading.meter_type)}>
                            {getMeterTypeIcon(reading.meter_type)}
                          </div>
                          <div>
                            <div className="font-medium">{reading.meter_id}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {reading.meter_type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reading.property_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {reading.property_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(reading.reading_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatNumber(reading.reading_value)} {reading.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Previous: {formatNumber(reading.previous_reading)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatNumber(reading.consumption)} {reading.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reading.reading_method}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={reading.is_validated ? 'default' : 'secondary'}>
                            {reading.is_validated ? 'Validated' : 'Pending'}
                          </Badge>
                          {reading.estimated_reading && (
                            <Badge variant="outline">Estimated</Badge>
                          )}
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

        <TabsContent value="meters" className="space-y-6">
          {/* Meters Management */}
          <Card>
            <CardHeader>
              <CardTitle>Meters</CardTitle>
              <CardDescription>
                Manage utility meters and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meters?.map((meter) => (
                    <TableRow key={meter.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meter.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {meter.serial_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={getMeterTypeColor(meter.meter_type)}>
                            {getMeterTypeIcon(meter.meter_type)}
                          </div>
                          <span className="capitalize">{meter.meter_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meter.property_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {meter.property_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meter.location_description}</div>
                          <div className="text-sm text-muted-foreground">
                            {meter.building_section} {meter.floor} {meter.room}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(meter.meter_status)}>
                          {meter.meter_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {meter.last_reading_date ? (
                          <div>
                            <div className="font-medium">
                              {new Date(meter.last_reading_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Next: {meter.next_reading_date ? new Date(meter.next_reading_date).toLocaleDateString() : 'Not set'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No readings</span>
                        )}
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
          {/* Consumption Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Trends</CardTitle>
              <CardDescription>
                Monthly consumption patterns by utility type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatNumber(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="electricity" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="gas" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="steam" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Meter Status */}
          <Card>
            <CardHeader>
              <CardTitle>Meter Status Distribution</CardTitle>
              <CardDescription>
                Current status of all meters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={meterStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Reading Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Settings</CardTitle>
              <CardDescription>
                Configure meter reading preferences and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-validation">Auto Validation</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-validation" defaultChecked />
                  <Label htmlFor="auto-validation">Automatically validate readings within normal range</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remote-reading">Remote Reading</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="remote-reading" defaultChecked />
                  <Label htmlFor="remote-reading">Enable remote meter reading capabilities</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading-alerts">Reading Alerts</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="reading-alerts" defaultChecked />
                  <Label htmlFor="reading-alerts">Send alerts for unusual consumption patterns</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-unit">Default Unit</Label>
                <Select defaultValue="kwh">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kwh">kWh (Electricity)</SelectItem>
                    <SelectItem value="cubic_meter">Cubic Meter (Water)</SelectItem>
                    <SelectItem value="therm">Therm (Gas)</SelectItem>
                    <SelectItem value="pound">Pound (Steam)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure external meter reading systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Smart Meter System', connected: true, icon: '📊' },
                  { name: 'Utility Provider API', connected: true, icon: '🔌' },
                  { name: 'IoT Sensors', connected: false, icon: '📡' },
                  { name: 'Mobile Reading App', connected: true, icon: '📱' },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                      {integration.connected ? 'Disconnect' : 'Connect'}
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

export default MeterReadingsPage; 