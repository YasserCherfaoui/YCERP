import { AppDispatch } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
// import { LoadingState } from '@/components/common/loading-states';
import ReturnsCalculator from '@/components/feature-specific/charges/returns/returns-calculator';
import ReturnsDashboard from '@/components/feature-specific/charges/returns/returns-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchReturnsCharges } from '@/features/charges/returns-slice';
import {
    BarChart3,
    Calculator,
    RotateCcw,
    Settings,
    Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ReturnsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize returns data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await dispatch(fetchReturnsCharges({
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        })).unwrap();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load returns data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  if (loading) {
    return <LoadingState message="Loading returns data..." />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Returns Management</h1>
          <p className="text-muted-foreground">
            Process returns, calculate refunds, and analyze return patterns
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
          <TabsTrigger value="returns" className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Returns</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ReturnsDashboard />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>Returns Cost Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate return processing costs and estimated refund amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnsCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Management</CardTitle>
              <CardDescription>
                View and manage all return charges and process refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Return Processing</h3>
                <p className="text-muted-foreground mb-4">
                  View, create, and manage return charges with inspection workflows.
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
              <CardTitle>Returns Settings</CardTitle>
              <CardDescription>
                Configure return policies, fraud detection, and Yalidine integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Return Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Manage return policies, fraud detection rules, and Yalidine integration settings.
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

export default ReturnsPage; 