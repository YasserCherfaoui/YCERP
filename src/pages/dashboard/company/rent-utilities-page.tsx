import { AppDispatch } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
// import { LoadingState } from '@/components/common/loading-states';
import RentUtilityDashboard from '@/components/feature-specific/charges/rent-utility/rent-utility-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Building,
    Calculator,
    Settings,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const RentUtilitiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize rent/utility data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await dispatch(fetchRentUtilityCharges({
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rent/utility data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  if (loading) {
    return <LoadingState message="Loading rent/utility data..." />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rent & Utilities Management</h1>
          <p className="text-muted-foreground">
            Manage property costs, track usage efficiency, and optimize utility consumption
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
          <TabsTrigger value="readings" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Meter Readings</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Usage Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RentUtilityDashboard />
        </TabsContent>

        <TabsContent value="readings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Meter Readings</span>
              </CardTitle>
              <CardDescription>
                Track utility consumption and manage meter readings across all properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Meter Reading Management</h3>
                <p className="text-muted-foreground mb-4">
                  Record, validate, and analyze meter readings for accurate billing and usage tracking.
                </p>
                <p className="text-sm text-muted-foreground">
                  This feature will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Usage Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate utility costs and consumption patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Usage Calculator</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced usage calculation with efficiency analysis and cost optimization recommendations.
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
              <CardTitle>Rent & Utilities Settings</CardTitle>
              <CardDescription>
                Configure properties, meters, alerts, and billing settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Property Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Manage properties, utility meters, alert thresholds, and billing configurations.
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

export default RentUtilitiesPage; 