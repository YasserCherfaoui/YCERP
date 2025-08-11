import { AppDispatch } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
// import { LoadingState } from '@/components/common/loading-states';
import ShippingCalculator from '@/components/feature-specific/charges/shipping/shipping-calculator';
import ShippingDashboard from '@/components/feature-specific/charges/shipping/shipping-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchShippingCharges } from '@/features/charges/shipping-slice';
import {
    BarChart3,
    Calculator,
    Package,
    Settings,
    Truck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ShippingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize shipping data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await dispatch(fetchShippingCharges({
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipping data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  if (loading) {
    return <LoadingState message="Loading shipping data..." />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Management</h1>
          <p className="text-muted-foreground">
            Manage shipping charges, track deliveries, and analyze logistics performance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Shipments</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ShippingDashboard />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Shipping Cost Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate shipping costs and compare rates from different providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Management</CardTitle>
              <CardDescription>
                View and manage all shipping charges and track delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Shipment Management</h3>
                <p className="text-muted-foreground mb-4">
                  View, create, and manage shipping charges with full tracking integration.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>
                Configure shipping providers, zones, rates, and integration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Shipping Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Manage shipping providers, delivery zones, rate configurations, and API integrations.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingPage; 