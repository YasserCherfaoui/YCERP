import { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createExchangeRateChargeAsync } from '@/features/charges/charges-slice';
import { AlertCircle, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export interface ExchangeRateFormProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({ 
  companyId, 
  onSuccess, 
  onCancel 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting, error } = useSelector((state: RootState) => state.charges);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source_currency: 'EUR',
    target_currency: 'DZD',
    source_amount: 0,
    target_amount: 0,
    exchange_rate: 0,
    rate_source: 'bank',
    exchange_loss: 0,
    bank_fees: 0,
    total_cost: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencies = [
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'DZD', name: 'Algerian Dinar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
  ];

  const rateSources = [
    { value: 'bank', label: 'Bank Rate' },
    { value: 'official', label: 'Official Rate' },
    { value: 'market', label: 'Market Rate' },
    { value: 'custom', label: 'Custom Rate' },
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTargetAmount = () => {
    const { source_amount, exchange_rate } = formData;
    if (source_amount && exchange_rate) {
      const targetAmount = source_amount * exchange_rate;
      setFormData(prev => ({ 
        ...prev, 
        target_amount: targetAmount,
        total_cost: targetAmount + (formData.exchange_loss || 0) + (formData.bank_fees || 0)
      }));
    }
  };

  const calculateTotalCost = () => {
    const { target_amount, exchange_loss, bank_fees } = formData;
    const total = target_amount + (exchange_loss || 0) + (bank_fees || 0);
    setFormData(prev => ({ ...prev, total_cost: total }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.source_amount <= 0) {
      newErrors.source_amount = 'Source amount must be greater than 0';
    }

    if (formData.exchange_rate <= 0) {
      newErrors.exchange_rate = 'Exchange rate must be greater than 0';
    }

    if (formData.target_amount <= 0) {
      newErrors.target_amount = 'Target amount must be greater than 0';
    }

    if (!formData.rate_source) {
      newErrors.rate_source = 'Rate source is required';
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
      await dispatch(createExchangeRateChargeAsync({
        company_id: companyId,
        ...formData,
      })).unwrap();

      toast.success('Exchange rate charge created successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create exchange rate charge');
    }
  };

  const handleCalculate = () => {
    calculateTargetAmount();
    calculateTotalCost();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Create Exchange Rate Charge
        </CardTitle>
        <CardDescription>
          Record currency exchange operations and associated costs
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
                placeholder="e.g., EUR to DZD Exchange for Advertising"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this exchange operation"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Currency Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source_currency">Source Currency</Label>
              <Select
                value={formData.source_currency}
                onValueChange={(value) => handleInputChange('source_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_currency">Target Currency</Label>
              <Select
                value={formData.target_currency}
                onValueChange={(value) => handleInputChange('target_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="source_amount">Source Amount *</Label>
              <Input
                id="source_amount"
                type="number"
                step="0.01"
                value={formData.source_amount}
                onChange={(e) => handleInputChange('source_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.source_amount ? 'border-red-500' : ''}
              />
              {errors.source_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.source_amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="exchange_rate">Exchange Rate *</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.0001"
                value={formData.exchange_rate}
                onChange={(e) => handleInputChange('exchange_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.0000"
                className={errors.exchange_rate ? 'border-red-500' : ''}
              />
              {errors.exchange_rate && (
                <p className="text-sm text-red-500 mt-1">{errors.exchange_rate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="target_amount">Target Amount *</Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.target_amount ? 'border-red-500' : ''}
                readOnly
              />
              {errors.target_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.target_amount}</p>
              )}
            </div>
          </div>

          {/* Rate Source */}
          <div>
            <Label htmlFor="rate_source">Rate Source *</Label>
            <Select
              value={formData.rate_source}
              onValueChange={(value) => handleInputChange('rate_source', value)}
            >
              <SelectTrigger className={errors.rate_source ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rateSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rate_source && (
              <p className="text-sm text-red-500 mt-1">{errors.rate_source}</p>
            )}
          </div>

          {/* Additional Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exchange_loss">Exchange Loss (Optional)</Label>
              <Input
                id="exchange_loss"
                type="number"
                step="0.01"
                value={formData.exchange_loss}
                onChange={(e) => handleInputChange('exchange_loss', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="bank_fees">Bank Fees (Optional)</Label>
              <Input
                id="bank_fees"
                type="number"
                step="0.01"
                value={formData.bank_fees}
                onChange={(e) => handleInputChange('bank_fees', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <Label htmlFor="total_cost">Total Cost</Label>
            <Input
              id="total_cost"
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={(e) => handleInputChange('total_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-lg font-semibold"
            />
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculate}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calculate Amounts
            </Button>
          </div>

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
              <TrendingUp className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Charge'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateForm; 