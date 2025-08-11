import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    selectCalculatorError,
    selectCalculatorLoading,
    selectCalculatorResult,
    selectMaterialRequirementsData,
    selectMaterialRequirementsError,
    selectMaterialRequirementsLoading,
    selectPackagingMaterials,
    selectPackagingTemplates,
} from '@/features/charges/boxing-selectors';
import {
    calculateBoxingCostsAsync,
    calculateMaterialRequirementsAsync,
    clearCalculatorResult,
    clearMaterialRequirements,
} from '@/features/charges/boxing-slice';
import { PackagingMaterial, PackagingTemplate } from '@/models/data/charges/boxing.model';
import {
    AlertTriangle,
    Box,
    Calculator,
    FileText,
    Minus,
    Package,
    Plus,
    RefreshCw,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface BoxingCalculatorProps {
  /** Initial values */
  initialValues?: {
    batch_size?: number;
    labor_hours?: number;
    labor_rate_per_hour?: number;
    overhead_percentage?: number;
    waste_percentage?: number;
  };
  /** Whether to show the full calculator or compact version */
  variant?: 'full' | 'compact';
  /** Callback when calculation completes */
  onCalculationComplete?: (result: any) => void;
  /** Additional CSS classes */
  className?: string;
}

interface CalculatorFormData {
  batch_size: number;
  materials: Array<{
    material_id: number;
    quantity_per_item: number;
    cost_per_unit: number;
    material?: PackagingMaterial;
  }>;
  labor_hours: number;
  labor_rate_per_hour: number;
  overhead_percentage: number;
  waste_percentage: number;
  
  // Product specifications for material requirements
  product_specifications?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  
  // Template selection
  packaging_template_id?: number;
}

const defaultFormData: CalculatorFormData = {
  batch_size: 100,
  materials: [],
  labor_hours: 8,
  labor_rate_per_hour: 1500, // DZD per hour
  overhead_percentage: 15,
  waste_percentage: 5,
};

export const BoxingCalculator: React.FC<BoxingCalculatorProps> = ({
  initialValues,
  variant = 'full',
  onCalculationComplete,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const calculationResult = useSelector(selectCalculatorResult);
  const calculatorLoading = useSelector(selectCalculatorLoading);
  const calculatorError = useSelector(selectCalculatorError);
  const materialRequirements = useSelector(selectMaterialRequirementsData);
  const materialRequirementsLoading = useSelector(selectMaterialRequirementsLoading);
  const materialRequirementsError = useSelector(selectMaterialRequirementsError);
  const availableMaterials = useSelector(selectPackagingMaterials);
  const packagingTemplates = useSelector(selectPackagingTemplates);

  // Local state
  const [formData, setFormData] = useState<CalculatorFormData>({
    ...defaultFormData,
    ...initialValues,
  });
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    if (autoCalculate && formData.batch_size > 0 && formData.materials.length > 0) {
      handleCalculate();
    }
  }, [
    formData.batch_size,
    formData.materials,
    formData.labor_hours,
    formData.labor_rate_per_hour,
    formData.overhead_percentage,
    formData.waste_percentage,
    autoCalculate,
  ]);

  useEffect(() => {
    if (calculationResult && onCalculationComplete) {
      onCalculationComplete(calculationResult);
    }
  }, [calculationResult, onCalculationComplete]);

  const updateFormData = (field: keyof CalculatorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addMaterial = () => {
    const newMaterial = {
      material_id: 0,
      quantity_per_item: 1,
      cost_per_unit: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const updateMaterial = (index: number, field: keyof typeof formData.materials[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      ),
    }));
  };

  const applyTemplate = (template: PackagingTemplate) => {
    const templateMaterials = template.materials.map(tm => ({
      material_id: tm.material_id,
      quantity_per_item: tm.quantity_needed,
      cost_per_unit: tm.material.unit_cost || tm.material.cost_per_unit || 0,
      material: tm.material,
    }));

    setFormData(prev => ({
      ...prev,
      packaging_template_id: template.ID,
      materials: templateMaterials,
      labor_hours: template.estimated_time / 60, // Convert minutes to hours
    }));
  };

  const calculateMaterialRequirements = () => {
    if (formData.batch_size > 0) {
      // Use the first material type if available, otherwise default to 'box'
      const materialType = formData.materials.length > 0 && formData.materials[0].material?.type 
        ? formData.materials[0].material.type 
        : formData.materials.length > 0 && formData.materials[0].material?.material_type
        ? formData.materials[0].material.material_type
        : 'box';
      
      dispatch(calculateMaterialRequirementsAsync({
        batch_size: formData.batch_size,
        material_type: materialType,
        labor_hours: formData.labor_hours,
      }));
    }
  };

  const handleCalculate = async () => {
    if (formData.batch_size <= 0 || formData.materials.length === 0) return;

    // Use the first material type if available, otherwise default to 'box'
    const materialType = formData.materials.length > 0 && formData.materials[0].material?.type 
      ? formData.materials[0].material.type 
      : formData.materials.length > 0 && formData.materials[0].material?.material_type
      ? formData.materials[0].material.material_type
      : 'box';

    const calculationParams = {
      material_type: materialType,
      quantity: formData.batch_size,
      labor_hours: formData.labor_hours,
      labor_rate: formData.labor_rate_per_hour,
    };

    dispatch(calculateBoxingCostsAsync(calculationParams));
  };

  const handleClear = () => {
    setFormData(defaultFormData);
    dispatch(clearCalculatorResult());
    dispatch(clearMaterialRequirements());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const MaterialRow = ({ material, index }: { material: typeof formData.materials[0]; index: number }) => (
    <div className="grid grid-cols-12 gap-3 items-end p-3 bg-muted/50 rounded-lg">
      <div className="col-span-4">
        <Label className="text-xs">Material</Label>
        <Select
          value={material.material_id?.toString() || ''}
          onValueChange={(value) => {
            const selectedMaterial = availableMaterials.find(m => m.ID === parseInt(value));
            updateMaterial(index, 'material_id', parseInt(value));
            updateMaterial(index, 'material', selectedMaterial);
            if (selectedMaterial) {
              updateMaterial(index, 'cost_per_unit', selectedMaterial.unit_cost || selectedMaterial.cost_per_unit || 0);
            }
          }}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            {availableMaterials.map(mat => (
              <SelectItem key={mat.ID} value={mat.ID.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{mat.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {formatCurrency(mat.unit_cost || mat.cost_per_unit || 0)}/{mat.unit_size || mat.unit_of_measure || 'piece'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-3">
        <Label className="text-xs">Quantity per Item</Label>
        <Input
          type="number"
          value={material.quantity_per_item}
          onChange={(e) => updateMaterial(index, 'quantity_per_item', parseFloat(e.target.value) || 0)}
          className="h-8"
          step="0.01"
        />
      </div>
      
      <div className="col-span-3">
        <Label className="text-xs">Cost per Unit (DZD)</Label>
        <Input
          type="number"
          value={material.cost_per_unit}
          onChange={(e) => updateMaterial(index, 'cost_per_unit', parseFloat(e.target.value) || 0)}
          className="h-8"
          step="0.01"
        />
      </div>
      
      <div className="col-span-1">
        <Label className="text-xs">Total</Label>
        <div className="h-8 flex items-center text-sm font-medium">
          {formatCurrency(material.quantity_per_item * material.cost_per_unit * formData.batch_size)}
        </div>
      </div>
      
      <div className="col-span-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => removeMaterial(index)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const CalculationResult = () => {
    if (!calculationResult) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Calculation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(calculationResult.total_cost)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Cost per Unit</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(calculationResult.cost_per_unit)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 mb-1">Material Cost</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(calculationResult.material_cost)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 mb-1">Labor Cost</p>
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(calculationResult.labor_cost)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Cost Breakdown</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(calculationResult.material_cost)} 
                    ({(calculationResult.material_cost / calculationResult.total_cost * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labor Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(calculationResult.labor_cost)}
                    ({(calculationResult.labor_cost / calculationResult.total_cost * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Size:</span>
                  <span className="font-medium">{calculationResult.batch_size} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labor Hours:</span>
                  <span className="font-medium">{calculationResult.labor_hours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labor Rate:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.labor_rate)}/hr</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Batch Size</Label>
              <Input
                type="number"
                value={formData.batch_size}
                onChange={(e) => updateFormData('batch_size', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-sm">Labor Hours</Label>
              <Input
                type="number"
                value={formData.labor_hours}
                onChange={(e) => updateFormData('labor_hours', parseFloat(e.target.value) || 0)}
                className="h-8"
                step="0.5"
              />
            </div>
          </div>
          
          {calculatorError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{calculatorError}</AlertDescription>
            </Alert>
          )}
          
          {calculationResult && (
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(calculationResult.total_cost)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(calculationResult.cost_per_unit)} per item
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Boxing Cost Calculator</span>
            </CardTitle>
            <CardDescription>
              Calculate packaging costs with materials, labor, and overhead
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={autoCalculate ? "default" : "outline"}>
              {autoCalculate ? "Auto" : "Manual"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoCalculate(!autoCalculate)}
            >
              {autoCalculate ? "Manual" : "Auto"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Packaging Materials</span>
              </h3>
              <Button onClick={addMaterial} size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Add Material
              </Button>
            </div>

            <div className="space-y-3">
              {formData.materials.map((material, index) => (
                <MaterialRow key={index} material={material} index={index} />
              ))}
              
              {formData.materials.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No materials added yet</p>
                  <p className="text-sm">Click "Add Material" to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Labor Tab */}
          <TabsContent value="labor" className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Labor & Overhead</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  value={formData.batch_size}
                  onChange={(e) => updateFormData('batch_size', parseInt(e.target.value) || 0)}
                  placeholder="Number of items to package"
                />
              </div>

              <div>
                <Label>Labor Hours</Label>
                <Input
                  type="number"
                  value={formData.labor_hours}
                  onChange={(e) => updateFormData('labor_hours', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  placeholder="Total hours required"
                />
              </div>

              <div>
                <Label>Labor Rate (DZD/hour)</Label>
                <Input
                  type="number"
                  value={formData.labor_rate_per_hour}
                  onChange={(e) => updateFormData('labor_rate_per_hour', parseFloat(e.target.value) || 0)}
                  step="50"
                  placeholder="Rate per hour"
                />
              </div>

              <div>
                <Label>Overhead Percentage (%)</Label>
                <Input
                  type="number"
                  value={formData.overhead_percentage}
                  onChange={(e) => updateFormData('overhead_percentage', parseFloat(e.target.value) || 0)}
                  step="1"
                  max="100"
                  placeholder="Overhead as % of labor cost"
                />
              </div>

              <div>
                <Label>Waste Percentage (%)</Label>
                <Input
                  type="number"
                  value={formData.waste_percentage}
                  onChange={(e) => updateFormData('waste_percentage', parseFloat(e.target.value) || 0)}
                  step="0.5"
                  max="50"
                  placeholder="Expected material waste"
                />
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Packaging Templates</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packagingTemplates.map(template => (
                <Card key={template.ID} className="cursor-pointer hover:bg-muted/50" onClick={() => applyTemplate(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">
                        {formatCurrency(template.estimated_cost)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.materials.length} materials</span>
                      <span>{template.estimated_time} min</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center space-x-2">
                <Box className="h-4 w-4" />
                <span>Product Specifications</span>
              </h3>
              <Button
                onClick={calculateMaterialRequirements}
                disabled={materialRequirementsLoading}
                size="sm"
              >
                {materialRequirementsLoading ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Calculator className="h-3 w-3 mr-1" />
                )}
                Calculate Requirements
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Length (cm)</Label>
                <Input
                  type="number"
                  value={formData.product_specifications?.length || ''}
                  onChange={(e) => updateFormData('product_specifications', {
                    ...formData.product_specifications,
                    length: parseFloat(e.target.value) || 0,
                  })}
                  step="0.1"
                />
              </div>

              <div>
                <Label>Width (cm)</Label>
                <Input
                  type="number"
                  value={formData.product_specifications?.width || ''}
                  onChange={(e) => updateFormData('product_specifications', {
                    ...formData.product_specifications,
                    width: parseFloat(e.target.value) || 0,
                  })}
                  step="0.1"
                />
              </div>

              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={formData.product_specifications?.height || ''}
                  onChange={(e) => updateFormData('product_specifications', {
                    ...formData.product_specifications,
                    height: parseFloat(e.target.value) || 0,
                  })}
                  step="0.1"
                />
              </div>

              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.product_specifications?.weight || ''}
                  onChange={(e) => updateFormData('product_specifications', {
                    ...formData.product_specifications,
                    weight: parseFloat(e.target.value) || 0,
                  })}
                  step="0.01"
                />
              </div>
            </div>

            {materialRequirementsError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{materialRequirementsError}</AlertDescription>
              </Alert>
            )}

            {materialRequirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Batch Calculation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Total Cost</p>
                        <p className="text-lg font-bold text-blue-700">
                          {formatCurrency(materialRequirements.total_cost)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Cost per Unit</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(materialRequirements.cost_per_unit)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material Cost:</span>
                        <span className="font-medium">{formatCurrency(materialRequirements.material_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labor Cost:</span>
                        <span className="font-medium">{formatCurrency(materialRequirements.labor_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch Size:</span>
                        <span className="font-medium">{materialRequirements.batch_size} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labor Hours:</span>
                        <span className="font-medium">{materialRequirements.labor_hours}h</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleCalculate} 
            disabled={calculatorLoading || formData.batch_size <= 0 || formData.materials.length === 0}
            className="flex-1"
          >
            {calculatorLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            Calculate Costs
          </Button>
          
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {/* Error Display */}
        {calculatorError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{calculatorError}</AlertDescription>
          </Alert>
        )}

        {/* Calculation Result */}
        <CalculationResult />
      </CardContent>
    </Card>
  );
};

export default BoxingCalculator;