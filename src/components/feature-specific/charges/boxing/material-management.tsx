import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    selectBoxingError,
    selectFilteredPackagingMaterials,
    selectIsMaterialSubmitting,
    selectLowStockMaterials,
    selectMaterialFilters,
    selectMaterialFormData,
    selectMaterialFormErrors,
    selectMaterialsLoading,
    selectSelectedMaterial,
} from '@/features/charges/boxing-selectors';
import {
    clearMaterialFormData,
    createPackagingMaterialAsync,
    deletePackagingMaterialAsync,
    fetchPackagingMaterials,
    setMaterialFilters, setSelectedMaterial,
    updatePackagingMaterialAsync
} from '@/features/charges/boxing-slice';
import { cn } from '@/lib/utils';
import { PackagingMaterial } from '@/models/data/charges/boxing.model';
import { CreateMaterialData, UpdateMaterialData } from '@/services/boxing-service';
import {
    AlertTriangle, Box,
    Download,
    Layers,
    Leaf,
    Package,
    Plus,
    Recycle,
    Search,
    ShieldCheck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface MaterialManagementProps {
  /** Component variant */
  variant?: 'full' | 'selection' | 'inventory';
  /** Whether to show low stock alerts */
  showLowStockAlerts?: boolean;
  /** Callback when material is selected (for selection variant) */
  onMaterialSelect?: (material: PackagingMaterial) => void;
  /** Additional CSS classes */
  className?: string;
}

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case 'box': return Box;
    case 'bubble_wrap': return Layers;
    case 'tape': return Package;
    case 'label': return Package;
    case 'insert': return Package;
    case 'padding': return Layers;
    case 'bag': return Package;
    default: return Package;
  }
};

const getMaterialTypeColor = (type: string) => {
  switch (type) {
    case 'box': return 'bg-blue-100 text-blue-800';
    case 'bubble_wrap': return 'bg-green-100 text-green-800';
    case 'tape': return 'bg-purple-100 text-purple-800';
    case 'label': return 'bg-orange-100 text-orange-800';
    case 'insert': return 'bg-indigo-100 text-indigo-800';
    case 'padding': return 'bg-yellow-100 text-yellow-800';
    case 'bag': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStockStatus = (material: PackagingMaterial) => {
  if (material.current_stock === undefined || material.reorder_point === undefined || material.reorder_point === 0) {
    return { status: 'unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
  
  const ratio = material.current_stock / material.reorder_point;
  if (ratio <= 0.5) return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  if (ratio <= 1) return { status: 'low', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  if (ratio <= 2) return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-100' };
  return { status: 'high', color: 'text-blue-600', bgColor: 'bg-blue-100' };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const MaterialManagement: React.FC<MaterialManagementProps> = ({
  variant = 'full',
  showLowStockAlerts = true,
  onMaterialSelect,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const materials = useSelector(selectFilteredPackagingMaterials);
  const selectedMaterial = useSelector(selectSelectedMaterial);
  const materialsLoading = useSelector(selectMaterialsLoading);
  const error = useSelector(selectBoxingError);
  const filters = useSelector(selectMaterialFilters);
  const lowStockMaterials = useSelector(selectLowStockMaterials);
  const formData = useSelector(selectMaterialFormData);
  const formErrors = useSelector(selectMaterialFormErrors);
  const isSubmitting = useSelector(selectIsMaterialSubmitting);

  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockUpdateData, setStockUpdateData] = useState({
    quantity_change: 0,
    transaction_type: 'addition' as 'addition' | 'usage' | 'adjustment',
    notes: '',
  });

  // Initialize data
  useEffect(() => {
    dispatch(fetchPackagingMaterials({ limit: 50 }));
  }, [dispatch]);

  // Update search filter
  useEffect(() => {
    dispatch(setMaterialFilters({ search: searchTerm }));
  }, [searchTerm, dispatch]);

  const handleCreateMaterial = async (data: CreateMaterialData | UpdateMaterialData) => {
    try {
      if ('name' in data && data.name && 'type' in data && data.type && 'unit_cost' in data && typeof data.unit_cost === 'number' && 'unit_size' in data && data.unit_size) {
        const createData: CreateMaterialData = {
          name: data.name,
          type: data.type,
          unit_cost: data.unit_cost,
          unit_size: data.unit_size,
          description: data.description || '',
        };
        await dispatch(createPackagingMaterialAsync(createData));
        setIsCreateDialogOpen(false);
        dispatch(clearMaterialFormData());
      }
    } catch (error) {
      console.error('Failed to create material:', error);
    }
  };

  const handleEditMaterial = async (data: CreateMaterialData | UpdateMaterialData) => {
    if (!selectedMaterial) return;
    
    try {
      const updateData: UpdateMaterialData = {};
      if ('name' in data && data.name) updateData.name = data.name;
      if ('type' in data && data.type) updateData.type = data.type;
      if ('unit_cost' in data && typeof data.unit_cost === 'number') updateData.unit_cost = data.unit_cost;
      if ('unit_size' in data && data.unit_size) updateData.unit_size = data.unit_size;
      if ('description' in data) updateData.description = data.description;
      
      await dispatch(updatePackagingMaterialAsync({ id: selectedMaterial.ID, data: updateData }));
      setIsEditDialogOpen(false);
      dispatch(clearMaterialFormData());
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  };

  const handleDeleteMaterial = async (material: PackagingMaterial) => {
    if (window.confirm(`Are you sure you want to delete ${material.name}?`)) {
      try {
        await dispatch(deletePackagingMaterialAsync(material.ID));
      } catch (error) {
        console.error('Failed to delete material:', error);
      }
    }
  };

  const handleMaterialClick = (material: PackagingMaterial) => {
    dispatch(setSelectedMaterial(material));
    if (onMaterialSelect) {
      onMaterialSelect(material);
    }
  };

  const MaterialCard = ({ material }: { material: PackagingMaterial }) => {
    const stockStatus = getStockStatus(material);
    const MaterialIcon = getMaterialTypeIcon(material.type || material.material_type || 'other');
    const stockPercentage = material.current_stock && material.reorder_point 
      ? (material.current_stock / material.reorder_point) * 100 
      : 0;

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          selectedMaterial?.ID === material.ID && 'ring-2 ring-primary bg-primary/5'
        )}
        onClick={() => handleMaterialClick(material)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 rounded-lg', getMaterialTypeColor(material.type || material.material_type || 'other'))}>
                <MaterialIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{material.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{(material.type || material.material_type || 'other').replace('_', ' ')}</span>
                  {material.sku && (
                    <>
                      <span>•</span>
                      <span>SKU: {material.sku}</span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={stockStatus.color}>
                {stockStatus.status.toUpperCase()}
              </Badge>
              
              {material.quality_grade && (
                <Badge variant="outline" className={getMaterialTypeColor(material.quality_grade)}>
                  {material.quality_grade}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stock Information */}
          {material.current_stock !== undefined && material.reorder_point !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stock Level</span>
                <span className="font-medium">
                  {material.current_stock} / {material.reorder_point} {material.unit_size || material.unit_of_measure || 'piece'}
                </span>
              </div>
              <Progress value={Math.min(stockPercentage, 100)} className="h-2" />
            </div>
          )}

          {/* Cost Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Cost per Unit</p>
              <p className="font-medium">{formatCurrency(material.unit_cost || material.cost_per_unit || 0)}</p>
            </div>
            {material.average_cost && (
              <div>
                <p className="text-muted-foreground">Average Cost</p>
                <p className="font-medium">{formatCurrency(material.average_cost)}</p>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-1 font-medium">{material.type || material.material_type || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span>
                <span className="ml-1 font-medium">{material.unit_size || material.unit_of_measure || 'N/A'}</span>
              </div>
              {material.quality_grade && (
                <div>
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="ml-1 font-medium">{material.quality_grade}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">SKU:</span>
                <span className="ml-1 font-medium">{material.sku || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Sustainability Features */}
          {(material.recyclable !== undefined || material.biodegradable !== undefined || material.food_safe !== undefined) && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sustainability</h4>
              <div className="flex flex-wrap gap-1">
                {material.recyclable && (
                  <Badge variant="secondary" className="text-xs">
                    <Recycle className="h-3 w-3 mr-1" />
                    Recyclable
                  </Badge>
                )}
                {material.biodegradable && (
                  <Badge variant="secondary" className="text-xs">
                    <Leaf className="h-3 w-3 mr-1" />
                    Biodegradable
                  </Badge>
                )}
                {material.food_safe && (
                  <Badge variant="secondary" className="text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Food Safe
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const MaterialForm = ({ 
    isEdit = false, 
    onSubmit, 
    onCancel 
  }: { 
    isEdit?: boolean; 
    onSubmit: (data: CreateMaterialData | UpdateMaterialData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<CreateMaterialData>({
      name: isEdit && selectedMaterial ? selectedMaterial.name : '',
      type: isEdit && selectedMaterial ? (selectedMaterial.type || selectedMaterial.material_type || 'box') : 'box',
      unit_cost: isEdit && selectedMaterial ? (selectedMaterial.unit_cost || selectedMaterial.cost_per_unit || 0) : 0,
      unit_size: isEdit && selectedMaterial ? (selectedMaterial.unit_size || selectedMaterial.unit_of_measure || 'piece') : 'piece',
      description: isEdit && selectedMaterial ? (selectedMaterial.description || '') : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isEdit) {
        // For edit, we need to create an UpdateMaterialData object
        const updateData: UpdateMaterialData = {
          name: formData.name,
          type: formData.type,
          unit_cost: formData.unit_cost,
          unit_size: formData.unit_size,
          description: formData.description,
        };
        onSubmit(updateData);
      } else {
        // For create, we can use the CreateMaterialData directly
        onSubmit(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Material Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter material name"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Material Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="bubble_wrap">Bubble Wrap</SelectItem>
                <SelectItem value="tape">Tape</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
                <SelectItem value="plastic">Plastic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit_cost">Unit Cost (DZD)</Label>
            <Input
              id="unit_cost"
              type="number"
              value={formData.unit_cost}
              onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
              placeholder="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="unit_size">Unit Size</Label>
            <Select value={formData.unit_size} onValueChange={(value) => setFormData({ ...formData, unit_size: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piece">Piece</SelectItem>
                <SelectItem value="meter">Meter</SelectItem>
                <SelectItem value="roll">Roll</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter material description"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Material' : 'Create Material'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Material Management</h2>
          <p className="text-muted-foreground">
            Manage packaging materials and inventory levels
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Material</DialogTitle>
              </DialogHeader>
              <MaterialForm
                onSubmit={handleCreateMaterial}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {showLowStockAlerts && lowStockMaterials.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <span className="font-medium text-yellow-800">
              {lowStockMaterials.length} material(s) are running low on stock.
            </span>
            <div className="mt-2 space-x-2">
              {lowStockMaterials.slice(0, 3).map(material => (
                <Badge key={material.ID} variant="outline" className="text-yellow-700">
                  {material.name}: {material.current_stock} left
                </Badge>
              ))}
              {lowStockMaterials.length > 3 && (
                <span className="text-sm text-yellow-700">
                  and {lowStockMaterials.length - 3} more...
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.material_type || 'all'} 
              onValueChange={(value) => dispatch(setMaterialFilters({ 
                material_type: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="bubble_wrap">Bubble Wrap</SelectItem>
                <SelectItem value="tape">Tape</SelectItem>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="insert">Insert</SelectItem>
                <SelectItem value="padding">Padding</SelectItem>
                <SelectItem value="bag">Bag</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.low_stock_only || false}
                onCheckedChange={(checked) => dispatch(setMaterialFilters({ low_stock_only: checked }))}
              />
              <Label className="text-sm">Low Stock Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Materials Grid */}
      {materialsLoading && materials.length === 0 ? (
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
          {materials.map(material => (
            <MaterialCard key={material.ID} material={material} />
          ))}
        </div>
      )}

      {materials.length === 0 && !materialsLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Materials Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filters.material_type || filters.low_stock_only
                ? 'No materials match your current filters.'
                : 'Get started by adding your first packaging material.'
              }
            </p>
            {!searchTerm && !filters.material_type && !filters.low_stock_only && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Material
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>
          <MaterialForm
            isEdit
            onSubmit={handleEditMaterial}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMaterial && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-lg font-medium">
                  {selectedMaterial.current_stock || 0} {selectedMaterial.unit_size || selectedMaterial.unit_of_measure || 'piece'}
                </p>
              </div>
            )}

            <div>
              <Label>Transaction Type</Label>
              <Select
                value={stockUpdateData.transaction_type}
                onValueChange={(value: any) => setStockUpdateData(prev => ({ ...prev, transaction_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Stock Addition</SelectItem>
                  <SelectItem value="usage">Material Usage</SelectItem>
                  <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity Change</Label>
              <Input
                type="number"
                value={stockUpdateData.quantity_change}
                onChange={(e) => setStockUpdateData(prev => ({ 
                  ...prev, 
                  quantity_change: parseInt(e.target.value) || 0 
                }))}
                placeholder={stockUpdateData.transaction_type === 'usage' ? 'Amount used' : 'Amount added'}
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={stockUpdateData.notes}
                onChange={(e) => setStockUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this stock update..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // This button is now effectively disabled as updateMaterialStockAsync is removed
                // Keeping it for now, but it won't trigger the stock update logic
                alert('Stock update functionality is currently disabled.');
                setIsStockDialogOpen(false);
              }}>
                Update Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialManagement;