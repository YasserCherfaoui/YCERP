import { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBoxingChargeAsync } from '@/features/charges/charges-slice';
import { AlertCircle, Calculator, Package, Ruler } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export interface BoxingFormProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BoxingForm: React.FC<BoxingFormProps> = ({ 
  companyId, 
  onSuccess, 
  onCancel 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting, error } = useSelector((state: RootState) => state.charges);
  
  const [formData, setFormData] = useState({
    title: '',
    box_type: 'medium',
    box_size: '',
    material_cost: 0,
    labor_hours: 0,
    labor_rate: 0,
    labor_cost: 0,
    product_id: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const boxTypes = [
    { value: 'small', label: 'Small Box' },
    { value: 'medium', label: 'Medium Box' },
    { value: 'large', label: 'Large Box' },
    { value: 'custom', label: 'Custom Size' },
  ];

  const boxSizes = [
    '20x15x10cm',
    '30x20x15cm',
    '40x30x20cm',
    '50x40x30cm',
    '60x50x40cm',
    'Custom',
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateLaborCost = () => {
    const { labor_hours, labor_rate } = formData;
    if (labor_hours && labor_rate) {
      const laborCost = labor_hours * labor_rate;
      setFormData(prev => ({ ...prev, labor_cost: laborCost }));
    }
  };

  const calculateTotalCost = () => {
    const { material_cost, labor_cost } = formData;
    return material_cost + labor_cost;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.box_type) {
      newErrors.box_type = 'Box type is required';
    }

    if (!formData.box_size.trim()) {
      newErrors.box_size = 'Box size is required';
    }

    if (formData.material_cost < 0) {
      newErrors.material_cost = 'Material cost cannot be negative';
    }

    if (formData.labor_hours < 0) {
      newErrors.labor_hours = 'Labor hours cannot be negative';
    }

    if (formData.labor_rate < 0) {
      newErrors.labor_rate = 'Labor rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createBoxingChargeAsync({
        company_id: companyId,
        ...formData,
      })).unwrap();

      toast.success('Boxing charge created successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create boxing charge');
    }
  };

  const handleCalculateLabor = () => {
    calculateLaborCost();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Create Boxing Charge
        </CardTitle>
        <CardDescription>
          Record packaging and boxing services costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Product Packaging for Order #123"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="box_type">Box Type *</Label>
                <Select
                  value={formData.box_type}
                  onValueChange={(value) => handleInputChange('box_type', value)}
                >
                  <SelectTrigger className={errors.box_type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boxTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.box_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.box_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="box_size">Box Size *</Label>
                <Select
                  value={formData.box_size}
                  onValueChange={(value) => handleInputChange('box_size', value)}
                >
                  <SelectTrigger className={errors.box_size ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.box_size && (
                  <p className="text-sm text-red-500 mt-1">{errors.box_size}</p>
                )}
              </div>
            </div>
          </div>

          {/* Material Costs */}
          <div>
            <Label htmlFor="material_cost">Material Cost</Label>
            <Input
              id="material_cost"
              type="number"
              step="0.01"
              value={formData.material_cost}
              onChange={(e) => handleInputChange('material_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.material_cost ? 'border-red-500' : ''}
            />
            {errors.material_cost && (
              <p className="text-sm text-red-500 mt-1">{errors.material_cost}</p>
            )}
          </div>

          {/* Labor Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="labor_hours">Labor Hours</Label>
                <Input
                  id="labor_hours"
                  type="number"
                  step="0.5"
                  value={formData.labor_hours}
                  onChange={(e) => handleInputChange('labor_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={errors.labor_hours ? 'border-red-500' : ''}
                />
                {errors.labor_hours && (
                  <p className="text-sm text-red-500 mt-1">{errors.labor_hours}</p>
                )}
              </div>

              <div>
                <Label htmlFor="labor_rate">Labor Rate (per hour)</Label>
                <Input
                  id="labor_rate"
                  type="number"
                  step="0.01"
                  value={formData.labor_rate}
                  onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.labor_rate ? 'border-red-500' : ''}
                />
                {errors.labor_rate && (
                  <p className="text-sm text-red-500 mt-1">{errors.labor_rate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="labor_cost">Labor Cost</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => handleInputChange('labor_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculateLabor}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculate Labor Cost
              </Button>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <Label htmlFor="product_id">Product ID (Optional)</Label>
            <Input
              id="product_id"
              type="number"
              value={formData.product_id}
              onChange={(e) => handleInputChange('product_id', parseInt(e.target.value) || 0)}
              placeholder="Enter product ID if applicable"
            />
          </div>

          {/* Cost Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span>{formData.material_cost.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Cost:</span>
                  <span>{formData.labor_cost.toLocaleString()} DZD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>{calculateTotalCost().toLocaleString()} DZD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Ruler className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Boxing Charge'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoxingForm; 