import { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createShippingChargeAsync } from '@/features/charges/charges-slice';
import { AlertCircle, MapPin, Truck } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export interface ShippingFormProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ 
  companyId, 
  onSuccess, 
  onCancel 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting, error } = useSelector((state: RootState) => state.charges);
  
  const [formData, setFormData] = useState({
    title: '',
    shipping_method: 'standard',
    destination: '',
    weight: 0,
    dimensions: '',
    distance: 0,
    fuel_cost: 0,
    driver_fee: 0,
    insurance_fee: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingMethods = [
    { value: 'standard', label: 'Standard Delivery' },
    { value: 'express', label: 'Express Delivery' },
    { value: 'overnight', label: 'Overnight Delivery' },
    { value: 'same_day', label: 'Same Day Delivery' },
    { value: 'freight', label: 'Freight Shipping' },
  ];

  const destinations = [
    'Algiers',
    'Oran',
    'Constantine',
    'Annaba',
    'Batna',
    'Blida',
    'Setif',
    'Tlemcen',
    'Ghardaia',
    'Other',
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTotalCost = () => {
    const { fuel_cost, driver_fee, insurance_fee } = formData;
    return fuel_cost + driver_fee + insurance_fee;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.shipping_method) {
      newErrors.shipping_method = 'Shipping method is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (formData.weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    if (formData.distance < 0) {
      newErrors.distance = 'Distance cannot be negative';
    }

    if (formData.fuel_cost < 0) {
      newErrors.fuel_cost = 'Fuel cost cannot be negative';
    }

    if (formData.driver_fee < 0) {
      newErrors.driver_fee = 'Driver fee cannot be negative';
    }

    if (formData.insurance_fee < 0) {
      newErrors.insurance_fee = 'Insurance fee cannot be negative';
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
      await dispatch(createShippingChargeAsync({
        company_id: companyId,
        ...formData,
      })).unwrap();

      toast.success('Shipping charge created successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shipping charge');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Create Shipping Charge
        </CardTitle>
        <CardDescription>
          Record shipping and delivery costs
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
                placeholder="e.g., Delivery to Customer in Algiers"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipping_method">Shipping Method *</Label>
                <Select
                  value={formData.shipping_method}
                  onValueChange={(value) => handleInputChange('shipping_method', value)}
                >
                  <SelectTrigger className={errors.shipping_method ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shipping_method && (
                  <p className="text-sm text-red-500 mt-1">{errors.shipping_method}</p>
                )}
              </div>

              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Select
                  value={formData.destination}
                  onValueChange={(value) => handleInputChange('destination', value)}
                >
                  <SelectTrigger className={errors.destination ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest} value={dest}>
                        {dest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.destination && (
                  <p className="text-sm text-red-500 mt-1">{errors.destination}</p>
                )}
              </div>
            </div>
          </div>

          {/* Package Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="e.g., 30x20x15cm"
              />
            </div>

            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => handleInputChange('distance', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={errors.distance ? 'border-red-500' : ''}
              />
              {errors.distance && (
                <p className="text-sm text-red-500 mt-1">{errors.distance}</p>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fuel_cost">Fuel Cost</Label>
                <Input
                  id="fuel_cost"
                  type="number"
                  step="0.01"
                  value={formData.fuel_cost}
                  onChange={(e) => handleInputChange('fuel_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.fuel_cost ? 'border-red-500' : ''}
                />
                {errors.fuel_cost && (
                  <p className="text-sm text-red-500 mt-1">{errors.fuel_cost}</p>
                )}
              </div>

              <div>
                <Label htmlFor="driver_fee">Driver Fee</Label>
                <Input
                  id="driver_fee"
                  type="number"
                  step="0.01"
                  value={formData.driver_fee}
                  onChange={(e) => handleInputChange('driver_fee', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.driver_fee ? 'border-red-500' : ''}
                />
                {errors.driver_fee && (
                  <p className="text-sm text-red-500 mt-1">{errors.driver_fee}</p>
                )}
              </div>

              <div>
                <Label htmlFor="insurance_fee">Insurance Fee</Label>
                <Input
                  id="insurance_fee"
                  type="number"
                  step="0.01"
                  value={formData.insurance_fee}
                  onChange={(e) => handleInputChange('insurance_fee', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.insurance_fee ? 'border-red-500' : ''}
                />
                {errors.insurance_fee && (
                  <p className="text-sm text-red-500 mt-1">{errors.insurance_fee}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Fuel Cost:</span>
                  <span>{formData.fuel_cost.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Fee:</span>
                  <span>{formData.driver_fee.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance Fee:</span>
                  <span>{formData.insurance_fee.toLocaleString()} DZD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Shipping Cost:</span>
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
              <MapPin className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Shipping Charge'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShippingForm; 