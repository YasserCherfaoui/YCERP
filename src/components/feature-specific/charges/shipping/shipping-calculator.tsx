import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { calculateShippingCostsAsync, clearCalculatorResult, getRouteRatesAsync } from '@/features/charges/shipping-slice';
import { cn } from '@/lib/utils';
import { ShippingCostCalculationParams } from '@/services/shipping-service';
import {
    Calculator,
    CheckCircle,
    Clock,
    DollarSign,
    Info,
    Package,
    RefreshCw,
    Truck,
    Weight
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface ShippingCalculatorProps {
  onCalculationComplete?: (result: any) => void;
  className?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  // onCalculationComplete,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Mock selectors - replace with actual selectors
  const calculatorState = {
    params: null,
    result: null,
    loading: false,
    error: null,
  };
  
  const routeRates = {
    rates: [
      { 
        ID: 1, 
        provider_id: 1, 
        service_type: 'standard', 
        base_rate: 500, 
        rate_per_kg: 150, 
        estimated_days: 3,
        minimum_charge: 800,
        fuel_surcharge_rate: 15,
        insurance_rate: 2,
      },
      { 
        ID: 2, 
        provider_id: 2, 
        service_type: 'express', 
        base_rate: 800, 
        rate_per_kg: 250, 
        estimated_days: 1,
        minimum_charge: 1200,
        fuel_surcharge_rate: 15,
        insurance_rate: 2,
      },
      { 
        ID: 3, 
        provider_id: 1, 
        service_type: 'express', 
        base_rate: 750, 
        rate_per_kg: 200, 
        estimated_days: 2,
        minimum_charge: 1000,
        fuel_surcharge_rate: 15,
        insurance_rate: 2,
      },
    ],
    loading: false,
    error: null,
  };

  // Form state
  const [formData, setFormData] = useState<ShippingCostCalculationParams>({
    origin_zone: '',
    destination_zone: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: 'cm',
    },
    service_type: '',
    provider_id: undefined,
    insurance_value: 0,
    cash_on_delivery: false,
    cod_amount: 0,
    fuel_surcharge_rate: 15,
    special_services: [],
  });

  const [selectedRateId, setSelectedRateId] = useState<number | null>(null);
  const [estimatedResult, setEstimatedResult] = useState<any>(null);

  // Available zones (mock data)
  const zones = [
    { value: 'algiers_center', label: 'Algiers Center' },
    { value: 'algiers_suburbs', label: 'Algiers Suburbs' },
    { value: 'oran_center', label: 'Oran Center' },
    { value: 'constantine', label: 'Constantine' },
    { value: 'annaba', label: 'Annaba' },
    { value: 'setif', label: 'Setif' },
    { value: 'batna', label: 'Batna' },
    { value: 'tlemcen', label: 'Tlemcen' },
  ];

  const serviceTypes = [
    { value: 'standard', label: 'Standard Delivery', icon: Package },
    { value: 'express', label: 'Express Delivery', icon: Truck },
    { value: 'overnight', label: 'Overnight Delivery', icon: Clock },
    { value: 'same_day', label: 'Same Day Delivery', icon: RefreshCw },
  ];

  const providers = [
    { value: 1, label: 'Yalidine' },
    { value: 2, label: 'Ecureuil' },
    { value: 3, label: 'ZR Express' },
  ];

  // Calculate volumetric weight
  const calculateVolumetricWeight = () => {
    const { length, width, height, unit } = formData.dimensions;
    let volumeCm3 = length * width * height;
    
    if (unit === 'inch') {
      volumeCm3 = volumeCm3 * 16.387; // Convert cubic inches to cubic cm
    }
    
    return volumeCm3 / 5000; // Standard volumetric weight divisor
  };

  // Calculate estimated cost based on selected rate
  const calculateEstimatedCost = (rate: any) => {
    const actualWeight = formData.weight;
    const volumetricWeight = calculateVolumetricWeight();
    const billableWeight = Math.max(actualWeight, volumetricWeight);
    
    const baseCost = Math.max(rate.base_rate + (rate.rate_per_kg * billableWeight), rate.minimum_charge);
    const fuelSurcharge = baseCost * (rate.fuel_surcharge_rate / 100);
    const insurance = formData.insurance_value ? (formData.insurance_value * (rate.insurance_rate / 100)) : 0;
    const codFee = formData.cash_on_delivery ? ((formData.cod_amount || 0) * 0.02) : 0; // 2% COD fee
    
    const total = baseCost + fuelSurcharge + insurance + codFee;
    
    return {
      base_cost: baseCost,
      fuel_surcharge: fuelSurcharge,
      insurance_cost: insurance,
      cod_fee: codFee,
      total_cost: total,
      billable_weight: billableWeight,
      volumetric_weight: volumetricWeight,
      estimated_delivery_days: rate.estimated_days,
    };
  };

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        (newData as any)[parent] = { ...(newData as any)[parent], [child]: value };
      } else {
        (newData as any)[field] = value;
      }
      return newData;
    });
  };

  // Fetch route rates when origin/destination changes
  useEffect(() => {
    if (formData.origin_zone && formData.destination_zone) {
      dispatch(getRouteRatesAsync({
        origin_zone: formData.origin_zone,
        destination_zone: formData.destination_zone,
        service_type: formData.service_type || undefined,
        provider_id: formData.provider_id,
      }));
    }
  }, [dispatch, formData.origin_zone, formData.destination_zone, formData.service_type, formData.provider_id]);

  // Update estimated result when form data or selected rate changes
  useEffect(() => {
    if (selectedRateId && formData.weight > 0) {
      const selectedRate = routeRates.rates.find(r => r.ID === selectedRateId);
      if (selectedRate) {
        const result = calculateEstimatedCost(selectedRate);
        setEstimatedResult(result);
      }
    } else {
      setEstimatedResult(null);
    }
  }, [selectedRateId, formData, routeRates.rates]);

  // Handle calculate button
  const handleCalculate = () => {
    if (!formData.origin_zone || !formData.destination_zone || !formData.weight) {
      return;
    }

    dispatch(calculateShippingCostsAsync(formData));
  };

  // Handle clear
  const handleClear = () => {
    setFormData({
      origin_zone: '',
      destination_zone: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm',
      },
      service_type: '',
      provider_id: undefined,
      insurance_value: 0,
      cash_on_delivery: false,
      cod_amount: 0,
      fuel_surcharge_rate: 15,
      special_services: [],
    });
    setSelectedRateId(null);
    setEstimatedResult(null);
    dispatch(clearCalculatorResult());
  };

  const isFormValid = formData.origin_zone && formData.destination_zone && formData.weight > 0;

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Shipping Cost Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate shipping costs and compare rates from different providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin_zone">Origin Zone *</Label>
              <Select 
                value={formData.origin_zone} 
                onValueChange={(value) => updateFormData('origin_zone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_zone">Destination Zone *</Label>
              <Select 
                value={formData.destination_zone} 
                onValueChange={(value) => updateFormData('destination_zone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Package Details</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                  placeholder="Enter package weight"
                />
              </div>

              <div className="space-y-2">
                <Label>Dimension Unit</Label>
                <Select 
                  value={formData.dimensions.unit} 
                  onValueChange={(value) => updateFormData('dimensions.unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters</SelectItem>
                    <SelectItem value="inch">Inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length ({formData.dimensions.unit})</Label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  value={formData.dimensions.length || ''}
                  onChange={(e) => updateFormData('dimensions.length', parseFloat(e.target.value) || 0)}
                  placeholder="Length"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width ({formData.dimensions.unit})</Label>
                <Input
                  id="width"
                  type="number"
                  min="0"
                  value={formData.dimensions.width || ''}
                  onChange={(e) => updateFormData('dimensions.width', parseFloat(e.target.value) || 0)}
                  placeholder="Width"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height ({formData.dimensions.unit})</Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  value={formData.dimensions.height || ''}
                  onChange={(e) => updateFormData('dimensions.height', parseFloat(e.target.value) || 0)}
                  placeholder="Height"
                />
              </div>
            </div>

            {formData.dimensions.length > 0 && formData.dimensions.width > 0 && formData.dimensions.height > 0 && (
              <Alert>
                <Weight className="h-4 w-4" />
                <AlertDescription>
                  Volumetric weight: {calculateVolumetricWeight().toFixed(2)} kg
                  {calculateVolumetricWeight() > formData.weight && (
                    <span className="text-amber-600 ml-2">
                      (Will be used for billing as it's higher than actual weight)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Service Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Service Options</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(value) => updateFormData('service_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex items-center space-x-2">
                          <service.icon className="h-4 w-4" />
                          <span>{service.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Provider</Label>
                <Select 
                  value={formData.provider_id?.toString() || ''} 
                  onValueChange={(value) => updateFormData('provider_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Provider</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value.toString()}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Additional Services</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_value">Insurance Value (DZD)</Label>
                <Input
                  id="insurance_value"
                  type="number"
                  min="0"
                  value={formData.insurance_value || ''}
                  onChange={(e) => updateFormData('insurance_value', parseFloat(e.target.value) || 0)}
                  placeholder="Declared value for insurance"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cash_on_delivery"
                    checked={formData.cash_on_delivery}
                    onCheckedChange={(checked) => updateFormData('cash_on_delivery', checked)}
                  />
                  <Label htmlFor="cash_on_delivery">Cash on Delivery (COD)</Label>
                </div>

                {formData.cash_on_delivery && (
                  <div className="space-y-2">
                    <Label htmlFor="cod_amount">COD Amount (DZD)</Label>
                    <Input
                      id="cod_amount"
                      type="number"
                      min="0"
                      value={formData.cod_amount || ''}
                      onChange={(e) => updateFormData('cod_amount', parseFloat(e.target.value) || 0)}
                      placeholder="Amount to collect"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={calculatorState.loading}
            >
              Clear
            </Button>
            
            <Button 
              onClick={handleCalculate}
              disabled={!isFormValid || calculatorState.loading}
              className="min-w-32"
            >
              {calculatorState.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Rates */}
      {routeRates.rates.length > 0 && formData.origin_zone && formData.destination_zone && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rates</CardTitle>
            <CardDescription>
              Select a rate to see detailed cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeRates.rates.map((rate) => {
                const isSelected = selectedRateId === rate.ID;
                const estimate = formData.weight > 0 ? calculateEstimatedCost(rate) : null;
                
                return (
                  <div
                    key={rate.ID}
                    className={cn(
                      'p-4 border rounded-lg cursor-pointer transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setSelectedRateId(isSelected ? null : rate.ID)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2',
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        )}>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">
                            {providers.find(p => p.value === rate.provider_id)?.label || 'Unknown Provider'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {serviceTypes.find(s => s.value === rate.service_type)?.label || rate.service_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {estimate && (
                          <>
                            <p className="text-lg font-bold">{formatCurrency(estimate.total_cost)}</p>
                            <p className="text-sm text-muted-foreground">
                              {estimate.estimated_delivery_days} day{estimate.estimated_delivery_days !== 1 ? 's' : ''}
                            </p>
                          </>
                        )}
                        {!estimate && formData.weight === 0 && (
                          <p className="text-sm text-muted-foreground">Enter weight to see estimate</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      {estimatedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Cost Breakdown</span>
            </CardTitle>
            <CardDescription>
              Detailed breakdown of shipping costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Cost:</span>
                    <span className="font-medium">{formatCurrency(estimatedResult.base_cost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fuel Surcharge:</span>
                    <span className="font-medium">{formatCurrency(estimatedResult.fuel_surcharge)}</span>
                  </div>
                  
                  {estimatedResult.insurance_cost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Insurance:</span>
                      <span className="font-medium">{formatCurrency(estimatedResult.insurance_cost)}</span>
                    </div>
                  )}
                  
                  {estimatedResult.cod_fee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">COD Fee:</span>
                      <span className="font-medium">{formatCurrency(estimatedResult.cod_fee)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Actual Weight:</span>
                    <span className="font-medium">{formData.weight} kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volumetric Weight:</span>
                    <span className="font-medium">{estimatedResult.volumetric_weight.toFixed(2)} kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Billable Weight:</span>
                    <span className="font-medium text-primary">{estimatedResult.billable_weight.toFixed(2)} kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Delivery Time:</span>
                    <span className="font-medium">{estimatedResult.estimated_delivery_days} day(s)</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Cost:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(estimatedResult.total_cost)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {calculatorState.error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{calculatorState.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ShippingCalculator;