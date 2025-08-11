import { AppDispatch, RootState } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createMeterReadingAsync, fetchMeterReadingsAsync, updateMeterReadingAsync } from '@/features/charges/rent-utility-slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Droplets, Edit, FileText, Flame, Plus, TrendingDown, TrendingUp, Wifi, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as z from 'zod';

const meterReadingFormSchema = z.object({
  meter_type: z.enum(['electricity', 'water', 'gas', 'internet', 'other']),
  meter_number: z.string().min(1, 'Meter number is required'),
  reading_value: z.number().min(0, 'Reading value must be positive'),
  reading_date: z.string(),
  previous_reading: z.number().optional(),
  unit_rate: z.number().min(0, 'Unit rate must be positive'),
  notes: z.string().optional(),
});

type MeterReadingFormData = z.infer<typeof meterReadingFormSchema>;

export interface MeterReadingsProps {
  onReadingSelect?: (reading: any) => void;
}

const MeterReadings: React.FC<MeterReadingsProps> = ({ onReadingSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { meterReadings, loading, error } = useSelector((state: RootState) => state.rentUtility);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [selectedMeterType, setSelectedMeterType] = useState<string>('all');

  const form = useForm<MeterReadingFormData>({
    resolver: zodResolver(meterReadingFormSchema),
    defaultValues: {
      meter_type: 'electricity',
      meter_number: '',
      reading_value: 0,
      reading_date: new Date().toISOString().split('T')[0],
      previous_reading: 0,
      unit_rate: 0,
      notes: '',
    }
  });

  useEffect(() => {
    dispatch(fetchMeterReadingsAsync());
  }, [dispatch]);

  const handleCreateReading = async (data: MeterReadingFormData) => {
    try {
      const consumption = data.previous_reading ? data.reading_value - data.previous_reading : 0;
      const cost = consumption * data.unit_rate;
      
      await dispatch(createMeterReadingAsync({
        ...data,
        consumption,
        cost,
        status: 'pending',
        created_at: new Date().toISOString(),
      }));
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create meter reading:', error);
    }
  };

  const handleUpdateReading = async (data: MeterReadingFormData) => {
    if (!selectedReading) return;
    
    try {
      const consumption = data.previous_reading ? data.reading_value - data.previous_reading : 0;
      const cost = consumption * data.unit_rate;
      
      await dispatch(updateMeterReadingAsync({
        id: selectedReading.id,
        ...data,
        consumption,
        cost,
      }));
      setIsEditDialogOpen(false);
      setSelectedReading(null);
      form.reset();
    } catch (error) {
      console.error('Failed to update meter reading:', error);
    }
  };

  const handleEditReading = (reading: any) => {
    setSelectedReading(reading);
    form.reset({
      meter_type: reading.meter_type,
      meter_number: reading.meter_number,
      reading_value: reading.reading_value,
      reading_date: new Date(reading.reading_date).toISOString().split('T')[0],
      previous_reading: reading.previous_reading,
      unit_rate: reading.unit_rate,
      notes: reading.notes,
    });
    setIsEditDialogOpen(true);
  };

  const getMeterTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-4 w-4" />;
      case 'water': return <Droplets className="h-4 w-4" />;
      case 'gas': return <Flame className="h-4 w-4" />;
      case 'internet': return <Wifi className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getMeterTypeColor = (type: string) => {
    switch (type) {
      case 'electricity': return 'bg-yellow-100 text-yellow-800';
      case 'water': return 'bg-blue-100 text-blue-800';
      case 'gas': return 'bg-orange-100 text-orange-800';
      case 'internet': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReadings = meterReadings.filter(reading => {
    if (selectedMeterType === 'all') return true;
    return reading.meter_type === selectedMeterType;
  });

  // Chart data for consumption trends
  const consumptionTrendData = filteredReadings
    .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime())
    .slice(-12)
    .map(reading => ({
      date: new Date(reading.reading_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      consumption: reading.consumption,
      cost: reading.cost,
      type: reading.meter_type,
    }));

  const consumptionByType = filteredReadings.reduce((acc, reading) => {
    if (!acc[reading.meter_type]) {
      acc[reading.meter_type] = { consumption: 0, cost: 0, count: 0 };
    }
    acc[reading.meter_type].consumption += reading.consumption;
    acc[reading.meter_type].cost += reading.cost;
    acc[reading.meter_type].count += 1;
    return acc;
  }, {} as Record<string, { consumption: number; cost: number; count: number }>);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Meter Readings</h2>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meter Readings</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Meter Reading</DialogTitle>
              <DialogDescription>
                Record a new meter reading with consumption and cost details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateReading)} className="space-y-4">
              <div>
                <Label htmlFor="meter_type">Meter Type</Label>
                <Select onValueChange={(value) => form.setValue('meter_type', value as any)} defaultValue={form.getValues('meter_type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meter_number">Meter Number</Label>
                <Input
                  id="meter_number"
                  {...form.register('meter_number')}
                  placeholder="Enter meter number"
                />
                {form.formState.errors.meter_number && (
                  <p className="text-sm text-red-500">{form.formState.errors.meter_number.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading_value">Current Reading</Label>
                  <Input
                    id="reading_value"
                    type="number"
                    step="0.01"
                    {...form.register('reading_value', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.reading_value && (
                    <p className="text-sm text-red-500">{form.formState.errors.reading_value.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="previous_reading">Previous Reading</Label>
                  <Input
                    id="previous_reading"
                    type="number"
                    step="0.01"
                    {...form.register('previous_reading', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading_date">Reading Date</Label>
                  <Input
                    id="reading_date"
                    type="date"
                    {...form.register('reading_date')}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_rate">Unit Rate (DZD)</Label>
                  <Input
                    id="unit_rate"
                    type="number"
                    step="0.01"
                    {...form.register('unit_rate', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.unit_rate && (
                    <p className="text-sm text-red-500">{form.formState.errors.unit_rate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Additional notes about this reading"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Reading</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedMeterType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedMeterType('all')}
        >
          All Types
        </Button>
        <Button
          variant={selectedMeterType === 'electricity' ? 'default' : 'outline'}
          onClick={() => setSelectedMeterType('electricity')}
        >
          <Zap className="h-4 w-4 mr-2" />
          Electricity
        </Button>
        <Button
          variant={selectedMeterType === 'water' ? 'default' : 'outline'}
          onClick={() => setSelectedMeterType('water')}
        >
          <Droplets className="h-4 w-4 mr-2" />
          Water
        </Button>
        <Button
          variant={selectedMeterType === 'gas' ? 'default' : 'outline'}
          onClick={() => setSelectedMeterType('gas')}
        >
          <Flame className="h-4 w-4 mr-2" />
          Gas
        </Button>
        <Button
          variant={selectedMeterType === 'internet' ? 'default' : 'outline'}
          onClick={() => setSelectedMeterType('internet')}
        >
          <Wifi className="h-4 w-4 mr-2" />
          Internet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReadings.map((reading) => (
          <Card key={reading.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getMeterTypeIcon(reading.meter_type)}
                  <div>
                    <CardTitle className="text-lg">{reading.meter_number}</CardTitle>
                    <CardDescription className="capitalize">{reading.meter_type}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(reading.status)}>
                  {reading.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Reading:</span>
                <span className="font-medium">{reading.reading_value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Consumption:</span>
                <span className="font-medium">{reading.consumption.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost:</span>
                <span className="font-medium">{reading.cost.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span className="font-medium">{new Date(reading.reading_date).toLocaleDateString()}</span>
              </div>

              {reading.consumption > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {reading.consumption > (reading.previous_reading || 0) ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span>
                    {reading.consumption > (reading.previous_reading || 0) ? 'Increased' : 'Decreased'} consumption
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditReading(reading)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReadingSelect?.(reading)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consumption Trends Chart */}
      {consumptionTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consumption Trends</CardTitle>
            <CardDescription>Recent meter reading consumption patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionTrendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Consumption by Type Chart */}
      {Object.keys(consumptionByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consumption by Type</CardTitle>
            <CardDescription>Total consumption and cost by meter type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(consumptionByType).map(([type, data]) => ({
                type: type.charAt(0).toUpperCase() + type.slice(1),
                consumption: data.consumption,
                cost: data.cost,
              }))}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="consumption" fill="#3b82f6" />
                <Bar dataKey="cost" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Edit Reading Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Meter Reading</DialogTitle>
            <DialogDescription>
              Update meter reading details and calculations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleUpdateReading)} className="space-y-4">
            <div>
              <Label htmlFor="edit_meter_type">Meter Type</Label>
              <Select onValueChange={(value) => form.setValue('meter_type', value as any)} value={form.getValues('meter_type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_meter_number">Meter Number</Label>
              <Input
                id="edit_meter_number"
                {...form.register('meter_number')}
                placeholder="Enter meter number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_reading_value">Current Reading</Label>
                <Input
                  id="edit_reading_value"
                  type="number"
                  step="0.01"
                  {...form.register('reading_value', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit_previous_reading">Previous Reading</Label>
                <Input
                  id="edit_previous_reading"
                  type="number"
                  step="0.01"
                  {...form.register('previous_reading', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_reading_date">Reading Date</Label>
                <Input
                  id="edit_reading_date"
                  type="date"
                  {...form.register('reading_date')}
                />
              </div>
              <div>
                <Label htmlFor="edit_unit_rate">Unit Rate (DZD)</Label>
                <Input
                  id="edit_unit_rate"
                  type="number"
                  step="0.01"
                  {...form.register('unit_rate', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                {...form.register('notes')}
                placeholder="Additional notes about this reading"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Reading</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeterReadings; 