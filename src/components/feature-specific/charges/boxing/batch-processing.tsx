import { AppDispatch } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    selectBatchesLoading,
    selectBatchStatusSummary,
    selectIsBatchSubmitting,
    selectPackagingBatches,
    selectPackagingTemplates,
    selectSelectedBatch
} from '@/features/charges/boxing-selectors';
import {
    completeBatchProcessingAsync,
    createPackagingBatchAsync,
    fetchPackagingBatches,
    fetchPackagingTemplates,
    setSelectedBatch,
    startBatchProcessingAsync,
    updateBatchProgressAsync
} from '@/features/charges/boxing-slice';
import { cn } from '@/lib/utils';
import { PackagingBatch } from '@/models/data/charges/boxing.model';
import { CreateBatchData } from '@/services/boxing-service';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Package,
    Play,
    Plus,
    RefreshCw, XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface BatchProcessingProps {
  /** Whether to show all batches or specific status */
  statusFilter?: 'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
  /** Number of batches to display per page */
  pageSize?: number;
  /** Additional CSS classes */
  className?: string;
}

interface BatchFormData extends Omit<CreateBatchData, 'products'> {
  products: Array<{
    product_id: number;
    product_variant_id?: number;
    quantity: number;
    packaging_template_id?: number;
    special_instructions?: string;
    priority: 'low' | 'medium' | 'high';
    product_name?: string;
    variant_name?: string;
    estimated_cost?: number;
  }>;
}

const defaultBatchFormData: BatchFormData = {
  batch_name: '',
  batch_date: new Date().toISOString().split('T')[0],
  products: [],
  assigned_workers: [],
  planned_duration: 8,
  supervised_by_id: undefined,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(1)}h`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const BatchProcessing: React.FC<BatchProcessingProps> = ({
  statusFilter = 'all',
  pageSize = 10,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const batches = useSelector(selectPackagingBatches);
  const selectedBatch = useSelector(selectSelectedBatch);
  const batchesLoading = useSelector(selectBatchesLoading);
  const isSubmitting = useSelector(selectIsBatchSubmitting);
  const batchStatusSummary = useSelector(selectBatchStatusSummary);
  const packagingTemplates = useSelector(selectPackagingTemplates);

  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [batchFormData, setBatchFormData] = useState<BatchFormData>(defaultBatchFormData);
  const [progressData, setProgressData] = useState<{
    completed_items: Array<{
      product_id: number;
      product_variant_id?: number;
      completed_quantity: number;
    }>;
  }>({ completed_items: [] });
  const [completionData, setCompletionData] = useState({
    actual_duration: 0,
    quality_notes: '',
    defect_count: 0,
    rework_count: 0,
  });
  const [currentStatusFilter, setCurrentStatusFilter] = useState(statusFilter);

  // Initialize data
  useEffect(() => {
    dispatch(fetchPackagingBatches({
      status: currentStatusFilter === 'all' ? undefined : currentStatusFilter,
      limit: pageSize,
    }));
    dispatch(fetchPackagingTemplates({ active_only: true }));
  }, [dispatch, currentStatusFilter, pageSize]);

  // Filter batches based on status
  const filteredBatches = batches.filter(batch => 
    currentStatusFilter === 'all' || batch.status === currentStatusFilter
  );

  const handleCreateBatch = async () => {
    try {
      const createData: CreateBatchData = {
        batch_name: batchFormData.batch_name,
        batch_date: batchFormData.batch_date,
        products: batchFormData.products.map(p => ({
          product_id: p.product_id,
          product_variant_id: p.product_variant_id,
          quantity: p.quantity,
          packaging_template_id: p.packaging_template_id,
          special_instructions: p.special_instructions,
          priority: p.priority,
        })),
        assigned_workers: batchFormData.assigned_workers,
        planned_duration: batchFormData.planned_duration,
        supervised_by_id: batchFormData.supervised_by_id,
      };

      await dispatch(createPackagingBatchAsync(createData));
      setIsCreateDialogOpen(false);
      setBatchFormData(defaultBatchFormData);
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  const handleStartBatch = async (batch: PackagingBatch) => {
    try {
      await dispatch(startBatchProcessingAsync(batch.ID));
    } catch (error) {
      console.error('Failed to start batch:', error);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedBatch) return;
    
    try {
      await dispatch(updateBatchProgressAsync({
        batchId: selectedBatch.ID,
        data: progressData,
      }));
      setIsProgressDialogOpen(false);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleCompleteBatch = async () => {
    if (!selectedBatch) return;
    
    try {
      await dispatch(completeBatchProcessingAsync({
        batchId: selectedBatch.ID,
        data: completionData,
      }));
      setIsCompleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to complete batch:', error);
    }
  };

  const addProductToBatch = () => {
    setBatchFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        product_id: 0,
        quantity: 1,
        priority: 'medium',
      }],
    }));
  };

  const removeProductFromBatch = (index: number) => {
    setBatchFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setBatchFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const BatchCard = ({ batch }: { batch: PackagingBatch }) => {
    const canStart = batch.status === 'planned';
    const canUpdate = batch.status === 'in_progress';
    const canComplete = batch.status === 'in_progress' && batch.completion_percentage >= 100;

    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          selectedBatch?.ID === batch.ID && 'ring-2 ring-primary bg-primary/5'
        )}
        onClick={() => dispatch(setSelectedBatch(batch))}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{batch.batch_name}</CardTitle>
              <CardDescription>
                {new Date(batch.batch_date).toLocaleDateString()} • {batch.total_items} items
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(batch.status)}>
                {batch.status.replace('_', ' ').toUpperCase()}
              </Badge>
              
              {batch.status === 'in_progress' && (
                <Badge variant="outline">
                  {batch.completion_percentage.toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{batch.completion_percentage.toFixed(1)}%</span>
            </div>
            <Progress value={batch.completion_percentage} className="h-2" />
          </div>

          {/* Batch Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Cost</p>
              <p className="font-medium">{formatCurrency(batch.total_cost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {batch.actual_duration ? 
                  `${formatDuration(batch.actual_duration)} (actual)` : 
                  `${formatDuration(batch.planned_duration)} (planned)`
                }
              </p>
            </div>
          </div>

          {/* Quality Metrics */}
          {batch.status !== 'planned' && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Quality Score</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{batch.overall_quality_score.toFixed(1)}/100</p>
                  {batch.overall_quality_score >= 90 ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : batch.overall_quality_score >= 70 ? (
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Defects</p>
                <p className="font-medium">{batch.defect_count} items</p>
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Products ({batch.products.length})</p>
            <div className="space-y-1">
              {batch.products.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>Product #{product.product_id}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getPriorityColor(product.priority)}>
                      {product.priority}
                    </Badge>
                    <span className="text-muted-foreground">
                      {product.completed_quantity}/{product.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {batch.products.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{batch.products.length - 3} more products
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {canStart && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartBatch(batch);
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            
            {canUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setSelectedBatch(batch));
                  setIsProgressDialogOpen(true);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Update Progress
              </Button>
            )}
            
            {canComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setSelectedBatch(batch));
                  setIsCompleteDialogOpen(true);
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setSelectedBatch(batch));
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BatchForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Batch Name</Label>
              <Input
                value={batchFormData.batch_name}
                onChange={(e) => setBatchFormData(prev => ({ ...prev, batch_name: e.target.value }))}
                placeholder="Enter batch name"
                required
              />
            </div>

            <div>
              <Label>Batch Date</Label>
              <Input
                type="date"
                value={batchFormData.batch_date}
                onChange={(e) => setBatchFormData(prev => ({ ...prev, batch_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label>Planned Duration (hours)</Label>
              <Input
                type="number"
                value={batchFormData.planned_duration}
                onChange={(e) => setBatchFormData(prev => ({ 
                  ...prev, 
                  planned_duration: parseFloat(e.target.value) || 0 
                }))}
                step="0.5"
                min="0.5"
                required
              />
            </div>

            <div>
              <Label>Supervisor ID (Optional)</Label>
              <Input
                type="number"
                value={batchFormData.supervised_by_id || ''}
                onChange={(e) => setBatchFormData(prev => ({ 
                  ...prev, 
                  supervised_by_id: parseInt(e.target.value) || undefined 
                }))}
                placeholder="Supervisor employee ID"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Products to Package</h4>
            <Button onClick={addProductToBatch} size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {batchFormData.products.map((product, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-3">
                    <Label className="text-xs">Product ID</Label>
                    <Input
                      type="number"
                      value={product.product_id || ''}
                      onChange={(e) => updateProduct(index, 'product_id', parseInt(e.target.value) || 0)}
                      placeholder="Product ID"
                      className="h-8"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-8"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Priority</Label>
                    <Select
                      value={product.priority}
                      onValueChange={(value) => updateProduct(index, 'priority', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label className="text-xs">Template (Optional)</Label>
                    <Select
                      value={product.packaging_template_id?.toString() || ''}
                      onValueChange={(value) => updateProduct(index, 'packaging_template_id', 
                        value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {packagingTemplates.map(template => (
                          <SelectItem key={template.ID} value={template.ID.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductFromBatch(index)}
                      className="h-8 w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {product.special_instructions !== undefined && (
                  <div className="mt-3">
                    <Label className="text-xs">Special Instructions</Label>
                    <Textarea
                      value={product.special_instructions || ''}
                      onChange={(e) => updateProduct(index, 'special_instructions', e.target.value)}
                      placeholder="Any special packaging instructions..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                )}
              </Card>
            ))}

            {batchFormData.products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No products added yet</p>
                <p className="text-sm">Click "Add Product" to get started</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <div>
            <Label>Assigned Workers (Employee IDs)</Label>
            <Textarea
              value={batchFormData.assigned_workers.join(', ')}
              onChange={(e) => {
                const workerIds = e.target.value
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id));
                setBatchFormData(prev => ({ ...prev, assigned_workers: workerIds }));
              }}
              placeholder="Enter employee IDs separated by commas (e.g., 1, 2, 3)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter employee IDs separated by commas
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Batch Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Products:</span>
            <span className="ml-2 font-medium">{batchFormData.products.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Items:</span>
            <span className="ml-2 font-medium">
              {batchFormData.products.reduce((sum, p) => sum + p.quantity, 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Workers:</span>
            <span className="ml-2 font-medium">{batchFormData.assigned_workers.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2 font-medium">{formatDuration(batchFormData.planned_duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const StatusSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold">{batchStatusSummary.total}</p>
          <p className="text-sm text-muted-foreground">Total Batches</p>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-blue-600">{batchStatusSummary.planned}</p>
          <p className="text-sm text-muted-foreground">Planned</p>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{batchStatusSummary.in_progress}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">{batchStatusSummary.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </CardContent>
      </Card>
      
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold">{batchStatusSummary.completion_rate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Batch Processing</h2>
          <p className="text-muted-foreground">
            Manage packaging batches and track progress
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={currentStatusFilter} onValueChange={setCurrentStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Packaging Batch</DialogTitle>
              </DialogHeader>
              
              <BatchForm />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBatch} 
                  disabled={isSubmitting || !batchFormData.batch_name || batchFormData.products.length === 0}
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Summary */}
      <StatusSummary />

      {/* Batches Grid */}
      {batchesLoading && filteredBatches.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map(batch => (
            <BatchCard key={batch.ID} batch={batch} />
          ))}
        </div>
      )}

      {filteredBatches.length === 0 && !batchesLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Batches Found</h3>
            <p className="text-muted-foreground mb-4">
              {currentStatusFilter === 'all' 
                ? 'Get started by creating your first packaging batch.'
                : `No batches with status "${currentStatusFilter}".`
              }
            </p>
            {currentStatusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Update Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Batch Progress - {selectedBatch?.batch_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Update the completed quantities for each product in this batch.
            </p>
            
            {/* Progress form would go here */}
            <div className="text-center p-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Progress update form coming soon...</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProgress}>
                Update Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Batch - {selectedBatch?.batch_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Actual Duration (hours)</Label>
                <Input
                  type="number"
                  value={completionData.actual_duration}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    actual_duration: parseFloat(e.target.value) || 0 
                  }))}
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <Label>Defect Count</Label>
                <Input
                  type="number"
                  value={completionData.defect_count}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    defect_count: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>

              <div>
                <Label>Rework Count</Label>
                <Input
                  type="number"
                  value={completionData.rework_count}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    rework_count: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label>Quality Notes</Label>
              <Textarea
                value={completionData.quality_notes}
                onChange={(e) => setCompletionData(prev => ({ 
                  ...prev, 
                  quality_notes: e.target.value 
                }))}
                placeholder="Any quality issues or notes..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteBatch}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchProcessing;