import { AppDispatch } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
// import { LoadingState } from '@/components/common/loading-states';
import AdvertisingDashboard from '@/components/feature-specific/charges/advertising/advertising-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Calculator,
    // Campaign,
    Settings,
    Target
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const AdvertisingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize advertising data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await dispatch(fetchAdvertisingCharges({
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load advertising data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  if (loading) {
    return <LoadingState message="Loading advertising data..." />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advertising Management</h1>
          <p className="text-muted-foreground">
            Manage campaigns, track ROI, and optimize advertising performance
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
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <Campaign className="h-4 w-4" />
            <span>Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>ROI Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AdvertisingDashboard />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Campaign className="h-5 w-5" />
                <span>Campaign Management</span>
              </CardTitle>
              <CardDescription>
                Create, manage, and optimize advertising campaigns across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Campaign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage advertising campaigns with advanced targeting and optimization features.
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
                <span>ROI Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate return on investment and optimize campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ROI Calculator</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced ROI calculation with attribution modeling and performance optimization.
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
              <CardTitle>Advertising Settings</CardTitle>
              <CardDescription>
                Configure platform accounts, targeting options, and integration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Platform Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Manage advertising platform accounts, API integrations, and targeting configurations.
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

export default AdvertisingPage; 