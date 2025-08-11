import { RootState } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
import { PageLoading } from '@/components/common/loading-states';
import BulkSalaryForm from '@/components/feature-specific/charges/salary/bulk-salary-form';
import CreateSalaryChargeDialog from '@/components/feature-specific/charges/salary/create-salary-charge-dialog';
import EmployeeSalaryCard from '@/components/feature-specific/charges/salary/employee-salary-card';
import SalaryApprovalInterface from '@/components/feature-specific/charges/salary/salary-approval-interface';
import SalaryCalculator from '@/components/feature-specific/charges/salary/salary-calculator';
import SalaryDashboard from '@/components/feature-specific/charges/salary/salary-dashboard';
import SalaryHistoryChart from '@/components/feature-specific/charges/salary/salary-history-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeleteSalaryCharge, usePendingSalaryCharges, useSalaryCharges, useSalaryTemplates } from '@/hooks/use-salary';
import { cn } from '@/lib/utils';
import { SalaryCharge } from '@/models/data/charges/salary.model';
import {
  Activity,
  Award,
  BarChart3,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Grid,
  List,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const SalariesPage: React.FC = () => {
  // Get company ID from Redux state
  const companyId = useSelector((state: RootState) => state.company?.company?.ID || state.user?.company?.ID);
  
  // React Query hooks
  const {
    data: salaryChargesResponse,
    isLoading: salaryLoading,
    error: salaryError,
    refetch: refetchSalaryCharges
  } = useSalaryCharges({ 
    limit: 50, 
    offset: 0,
    company_id: companyId 
  });

  const {
    data: pendingChargesResponse,
    refetch: refetchPendingCharges
  } = usePendingSalaryCharges({ 
    limit: 10,
    company_id: companyId 
  });

  useSalaryTemplates(companyId);

  // Mutations
  const deleteSalaryChargeMutation = useDeleteSalaryCharge();

  // Local state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isCalculatorDialogOpen, setIsCalculatorDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Extract data from responses
  const salaryCharges = salaryChargesResponse?.data || [];
  const pendingApprovalsCount = pendingChargesResponse?.data?.length || 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSalaryCharges(),
        refetchPendingCharges()
      ]);
    } finally {
      setRefreshing(false);
    }
  };


  const handleEditSalary = async (salaryCharge: SalaryCharge) => {
    // TODO: Implement edit functionality
    // For now, we'll just log the salary charge
    console.log('Edit salary charge:', salaryCharge);
  };

  const handleDeleteSalary = async (salaryCharge: SalaryCharge) => {
    if (window.confirm(`Are you sure you want to delete the salary charge for ${salaryCharge.employee_name}?`)) {
      try {
        await deleteSalaryChargeMutation.mutateAsync({ id: salaryCharge.ID, companyId });
        handleRefresh();
      } catch (error) {
        console.error('Error deleting salary charge:', error);
      }
    }
  };

  const handleSalaryChargeClick = (salaryCharge: SalaryCharge) => {
    // TODO: Implement salary charge details view
    console.log('Salary charge clicked:', salaryCharge);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    trend?: { value: number; isPositive: boolean };
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{value}</p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (salaryLoading && salaryCharges.length === 0) {
    return <PageLoading />;
  }

  if (salaryError) {
    return (
      <ErrorState
        title="Failed to load salary data"
        description={salaryError instanceof Error ? salaryError.message : 'An error occurred while loading salary data'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Employee Salaries</h1>
          <p className="text-muted-foreground">
            Manage employee compensation, payroll, and approval workflows
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          
          <Dialog open={isCalculatorDialogOpen} onOpenChange={setIsCalculatorDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Salary Calculator</DialogTitle>
                <DialogDescription>
                  Calculate employee salaries with allowances, deductions, and overtime calculations.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)]">
                <div className="pr-4">
                  <SalaryCalculator variant="full" />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Bulk Salary Management</DialogTitle>
                <DialogDescription>
                  Manage multiple salary entries at once with bulk operations.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)]">
                <div className="pr-4">
                  <BulkSalaryForm 
                    onComplete={() => {
                      setIsBulkDialogOpen(false);
                      handleRefresh();
                    }}
                    onCancel={() => setIsBulkDialogOpen(false)}
                  />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          {/* New Create Salary Charge Dialog */}
          <CreateSalaryChargeDialog />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Employees"
          value={salaryCharges.length}
          subtitle="Active salaries"
          icon={Users}
          color="blue"
        />
        
        <StatCard
          title="Total Cost"
          value={formatCurrency(salaryCharges.reduce((sum, charge) => sum + charge.gross_amount, 0))}
          subtitle="Gross payroll"
          icon={DollarSign}
          color="green"
        />
        
        <StatCard
          title="Average Salary"
          value={formatCurrency(salaryCharges.length > 0 ? salaryCharges.reduce((sum, charge) => sum + charge.gross_amount, 0) / salaryCharges.length : 0)}
          subtitle="Per employee"
          icon={TrendingUp}
          color="purple"
        />
        
        <StatCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          subtitle="Awaiting review"
          icon={Clock}
          color={pendingApprovalsCount > 0 ? "yellow" : "green"}
        />
        
        <StatCard
          title="Payroll Batches"
          value={0} // This will need to be fetched from a different endpoint or calculated
          subtitle="N/A"
          icon={FileText}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Salary List</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center space-x-2 relative">
            <CheckCircle className="h-4 w-4" />
            <span>Approvals</span>
            {pendingApprovalsCount > 0 && (
              <Badge className="ml-1 px-1 min-w-[1.25rem] h-5 text-xs">
                {pendingApprovalsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculator</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <SalaryDashboard />
        </TabsContent>

        {/* Salary List Tab */}
        <TabsContent value="list" className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Salary Charges</h2>
              <Badge variant="outline">
                {salaryCharges.length} total
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className={cn(
            'grid gap-4 w-full max-w-full',
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          )}>
            {salaryCharges.map(salaryCharge => (
              <EmployeeSalaryCard
                key={salaryCharge.ID}
                salaryCharge={salaryCharge}
                variant={viewMode === 'grid' ? 'default' : 'compact'}
                onClick={handleSalaryChargeClick}
                onEdit={handleEditSalary}
                onDelete={handleDeleteSalary}
                className="w-full max-w-full"
              />
            ))}
          </div>

          {salaryCharges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Salary Charges</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first salary charge.
                </p>
                <CreateSalaryChargeDialog />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <SalaryHistoryChart
            salaryCharges={salaryCharges}
            height={400}
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <SalaryApprovalInterface />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Overtime Cost</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(salaryCharges.reduce((sum, charge) => sum + (charge.overtime_amount || 0), 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600 mb-1">Total Deductions</p>
                    <p className="text-xl font-bold text-red-700">
                      {formatCurrency(salaryCharges.reduce((sum, charge) => sum + charge.total_deductions, 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Net Payout</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(salaryCharges.reduce((sum, charge) => sum + charge.net_amount, 0))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Allowances</p>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(salaryCharges.reduce((sum, charge) => sum + charge.total_allowances, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Batches:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed:</span>
                    <span className="font-medium text-green-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Processing:</span>
                    <span className="font-medium text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Draft:</span>
                    <span className="font-medium text-yellow-600">0</span>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion Rate:</span>
                      <span className="font-bold">0.0%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <SalaryCalculator variant="full" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalariesPage;