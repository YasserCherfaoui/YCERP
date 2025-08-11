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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { fetchShippingTrackingAsync, updateShippingStatusAsync } from '@/features/charges/shipping-slice';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Search,
    Truck,
    User,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface ShippingTrackingProps {
  trackingNumber?: string;
  providerId?: number;
  className?: string;
}

export interface TrackingEvent {
  id: number;
  tracking_number: string;
  event_type: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  event_description: string;
  location: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  updated_by?: string;
}

export interface TrackingDetails {
  tracking_number: string;
  provider_name: string;
  provider_id: number;
  shipment_status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  estimated_delivery: string;
  actual_delivery?: string;
  pickup_date?: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
  package_weight: number;
  package_dimensions: string;
  shipping_cost: number;
  insurance_amount: number;
  cod_amount?: number;
  events: TrackingEvent[];
  current_location?: string;
  delivery_attempts: number;
  max_delivery_attempts: number;
  special_instructions?: string;
  signature_required: boolean;
  signature_received?: boolean;
  signature_image_url?: string;
}

const ShippingTracking: React.FC<ShippingTrackingProps> = ({
  trackingNumber,
  providerId,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { trackingData, loading, error } = useSelector((state: RootState) => state.shipping);
  
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(trackingNumber || '');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('tracking');

  useEffect(() => {
    if (searchTrackingNumber) {
      dispatch(fetchShippingTrackingAsync({
        tracking_number: searchTrackingNumber,
        provider_id: selectedProvider === 'all' ? undefined : parseInt(selectedProvider)
      }));
    }
  }, [dispatch, searchTrackingNumber, selectedProvider]);

  const handleTrackingSearch = () => {
    if (searchTrackingNumber.trim()) {
      dispatch(fetchShippingTrackingAsync({
        tracking_number: searchTrackingNumber.trim(),
        provider_id: selectedProvider === 'all' ? undefined : parseInt(selectedProvider)
      }));
    }
  };

  const handleStatusUpdate = (trackingNumber: string, newStatus: string, notes?: string) => {
    dispatch(updateShippingStatusAsync({
      tracking_number: trackingNumber,
      status: newStatus,
      notes
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created': return <Package className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'out_for_delivery': return <MapPin className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'returned': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'delivered': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'returned': return 'text-orange-600';
      case 'in_transit': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const calculateProgress = (events: TrackingEvent[]) => {
    const totalSteps = 5; // created -> picked_up -> in_transit -> out_for_delivery -> delivered
    const completedSteps = events.filter(event => 
      ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(event.event_type)
    ).length;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  };

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
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Track Shipment</CardTitle>
          <CardDescription>
            Enter tracking number to view shipment status and delivery progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                placeholder="Enter tracking number..."
                value={searchTrackingNumber}
                onChange={(e) => setSearchTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackingSearch()}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="provider">Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="1">Yalidine</SelectItem>
                  <SelectItem value="2">Ecureuil</SelectItem>
                  <SelectItem value="3">ZR Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleTrackingSearch} disabled={!searchTrackingNumber.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking">Tracking Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-6">
            {/* Shipment Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {trackingData.tracking_number}
                    </CardTitle>
                    <CardDescription>
                      {trackingData.provider_name} • {trackingData.shipment_status}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(trackingData.shipment_status)}>
                    {trackingData.shipment_status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Delivery Progress */}
                  <div className="space-y-3">
                    <Label>Delivery Progress</Label>
                    <Progress value={calculateProgress(trackingData.events)} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Created</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Estimated: {new Date(trackingData.estimated_delivery).toLocaleDateString()}
                      </span>
                    </div>
                    {trackingData.actual_delivery && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Delivered: {new Date(trackingData.actual_delivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{trackingData.current_location || 'In Transit'}</span>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {trackingData.package_weight}kg • {trackingData.package_dimensions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Cost: {trackingData.shipping_cost.toLocaleString()} DZD
                      </span>
                    </div>
                    {trackingData.cod_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          COD: {trackingData.cod_amount.toLocaleString()} DZD
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Recipient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{trackingData.recipient_name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{trackingData.recipient_phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Delivery Address</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{trackingData.delivery_address}</span>
                    </div>
                  </div>
                  {trackingData.special_instructions && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Special Instructions</Label>
                      <p className="text-sm text-muted-foreground">
                        {trackingData.special_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Attempts */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Attempts</CardTitle>
                <CardDescription>
                  {trackingData.delivery_attempts} of {trackingData.max_delivery_attempts} attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress 
                    value={(trackingData.delivery_attempts / trackingData.max_delivery_attempts) * 100} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm text-muted-foreground">
                    {trackingData.delivery_attempts}/{trackingData.max_delivery_attempts}
                  </span>
                </div>
                {trackingData.delivery_attempts >= trackingData.max_delivery_attempts && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Maximum delivery attempts reached. Package may be returned to sender.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
                <CardDescription>
                  Complete history of shipment events and status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingData.events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          getEventColor(event.event_type)
                        )}>
                          {getEventIcon(event.event_type)}
                        </div>
                        {index < trackingData.events.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium capitalize">
                              {event.event_type.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {event.event_description}
                            </p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {event.notes && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm">{event.notes}</p>
                          </div>
                        )}
                        {event.updated_by && (
                          <p className="text-xs text-muted-foreground">
                            Updated by: {event.updated_by}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  Update shipment status and add notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-status">New Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="picked_up">Picked Up</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Enter location..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Add notes about this status update..."
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Phone className="h-4 w-4 mb-2" />
                    <span className="font-medium">Contact Recipient</span>
                    <span className="text-xs text-muted-foreground">
                      Call recipient about delivery
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <MapPin className="h-4 w-4 mb-2" />
                    <span className="font-medium">Update Location</span>
                    <span className="text-xs text-muted-foreground">
                      Update current location
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <RefreshCw className="h-4 w-4 mb-2" />
                    <span className="font-medium">Reschedule Delivery</span>
                    <span className="text-xs text-muted-foreground">
                      Schedule new delivery time
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <AlertTriangle className="h-4 w-4 mb-2" />
                    <span className="font-medium">Report Issue</span>
                    <span className="text-xs text-muted-foreground">
                      Report delivery problem
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No Results */}
      {!trackingData && searchTrackingNumber && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tracking information found</h3>
            <p className="text-muted-foreground text-center">
              The tracking number "{searchTrackingNumber}" was not found in our system.
              Please verify the tracking number and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShippingTracking; 