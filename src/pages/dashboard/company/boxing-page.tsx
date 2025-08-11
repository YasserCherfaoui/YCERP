import { AppDispatch, RootState } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
import { PageLoading } from '@/components/common/loading-states';
import BatchProcessing from '@/components/feature-specific/charges/boxing/batch-processing';

import BoxingCalculator from '@/components/feature-specific/charges/boxing/boxing-calculator';
import BoxingDashboard from '@/components/feature-specific/charges/boxing/boxing-dashboard';
import MaterialManagement from '@/components/feature-specific/charges/boxing/material-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  selectBoxingError,
  selectBoxingLoading,
  selectDashboardData,
  selectLowStockMaterials
} from '@/features/charges/boxing-selectors';
import {
  createBoxingChargeAsync,
  fetchBoxingDashboard,
  fetchPackagingMaterials
} from '@/features/charges/boxing-slice';
import { CreateBoxingChargeData } from '@/services/boxing-service';
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  Package,
  Plus,
  Settings,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const BoxingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const dashboardData = useSelector(selectDashboardData);
  const lowStockMaterials = useSelector(selectLowStockMaterials);
  const boxingLoading = useSelector(selectBoxingLoading);
  const boxingError = useSelector(selectBoxingError);
  
  // Get company information
  let company = useSelector((state: RootState) => state.company.company);
  if (!company) {
    company = useSelector((state: RootState) => state.user.company);
  }

  // Local state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const [quickFormData, setQuickFormData] = useState<Partial<CreateBoxingChargeData>>({
    batch_size: 100,
    material_type: 'box',
    material_cost: 0,
    labor_hours: 8,
    labor_rate: 1500,
    quantity: 100,
    company_id: company?.ID || 0,
    title: 'Quick boxing charge',
    description: 'Quick boxing charge entry',
    date: new Date().toISOString().split('T')[0],
  });

  // Initialize page data
  useEffect(() => {
    if (company?.ID) {
      dispatch(fetchBoxingDashboard({ company_id: company.ID }));
      dispatch(fetchPackagingMaterials({ limit: 50 }));
    }
  }, [dispatch, company?.ID]);

  const handleQuickBoxingCharge = async () => {
    try {
      const createData: CreateBoxingChargeData = {
        batch_size: quickFormData.batch_size || 100,
        material_type: quickFormData.material_type || 'box',
        material_cost: quickFormData.material_cost || 0,
        labor_hours: quickFormData.labor_hours || 8,
        labor_rate: quickFormData.labor_rate || 1500,
        quantity: quickFormData.quantity || 100,
        company_id: company?.ID || 0,
        title: quickFormData.title || 'Quick boxing charge',
        description: quickFormData.description || 'Quick boxing charge entry',
        date: quickFormData.date || new Date().toISOString().split('T')[0],
      };

      await dispatch(createBoxingChargeAsync(createData));
      setIsQuickFormOpen(false);
      // Refresh dashboard data
      if (company?.ID) {
        dispatch(fetchBoxingDashboard({ company_id: company.ID }));
      }
    } catch (error) {
      console.error('Failed to create boxing charge:', error);
    }
  };

  const PageHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Boxing & Packaging</h1>
        <p className="text-muted-foreground">
          Manage packaging operations, materials, and costs
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Dialog open={isQuickFormOpen} onOpenChange={setIsQuickFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Quick Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Boxing Charge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Batch Size</label>
                  <input
                    type="number"
                    value={quickFormData.batch_size}
                    onChange={(e) => setQuickFormData(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Labor Hours</label>
                  <input
                    type="number"
                    value={quickFormData.labor_hours}
                    onChange={(e) => setQuickFormData(prev => ({ ...prev, labor_hours: parseFloat(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsQuickFormOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuickBoxingCharge}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button onClick={() => setActiveTab('calculator')}>
          <Calculator className="h-4 w-4 mr-2" />
          Calculator
        </Button>
      </div>
    </div>
  );

  const QuickStats = () => {
    if (!dashboardData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Batches</p>
                <p className="text-xl font-bold">{dashboardData.total_batches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Packaged</p>
                <p className="text-xl font-bold">{dashboardData.total_items_packaged.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-xl font-bold">{dashboardData.efficiency_metrics.packaging_efficiency.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Rate</p>
                <p className="text-xl font-bold">{dashboardData.quality_metrics.pass_rate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const AlertsSection = () => {
    if (lowStockMaterials.length === 0) return null;

    return (
      <Alert className="border-yellow-200 bg-yellow-50 mb-6">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-yellow-800">
              {lowStockMaterials.length} material(s) are running low on stock
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockMaterials.slice(0, 5).map(material => (
                <Badge key={material.ID} variant="outline" className="text-yellow-700">
                  {material.name}: {material.current_stock} left
                </Badge>
              ))}
              {lowStockMaterials.length > 5 && (
                <Badge variant="outline" className="text-yellow-700">
                  +{lowStockMaterials.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  if (boxingLoading && !dashboardData) {
    return <PageLoading />;
  }

  if (boxingError) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState
          title="Failed to load boxing data"
          description={boxingError}
          // actionButton={{
          //   text: "Retry",
          //   onClick: () => {
          //     dispatch(fetchBoxingDashboard({}));
          //     dispatch(fetchPackagingMaterials({ limit: 50 }));
          //   }
          // }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader />
      <AlertsSection />
      <QuickStats />

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
          <TabsTrigger value="materials" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Materials</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Batches</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BoxingDashboard companyId={company?.ID || 0} />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BoxingCalculator 
              variant="full"
              onCalculationComplete={(result) => {
                console.log('Calculation completed:', result);
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization Tips</CardTitle>
                <CardDescription>
                  Recommendations to improve your packaging efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Material Selection</h4>
                  <p className="text-sm text-blue-700">
                    Consider bulk purchasing for frequently used materials to reduce per-unit costs.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Batch Sizing</h4>
                  <p className="text-sm text-green-700">
                    Larger batches often reduce labor cost per item through economies of scale.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Template Usage</h4>
                  <p className="text-sm text-purple-700">
                    Using packaging templates can reduce setup time and material waste.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <MaterialManagement 
            variant="full"
            showLowStockAlerts={true}
          />
        </TabsContent>

        <TabsContent value="batches" className="space-y-6">
          <BatchProcessing 
            statusFilter="all"
            pageSize={12}
          />
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default BoxingPage;