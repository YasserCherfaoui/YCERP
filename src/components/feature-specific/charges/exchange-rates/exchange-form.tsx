import { RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ExchangeRateCharge, ExchangeRateSource } from '@/models/data/charges/exchange-rate.model';
import { CreateExchangeRateChargeData, createExchangeRateChargeFromForm } from '@/services/exchange-rate-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle, CalendarIcon, CheckCircle, DollarSign, Euro, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

// Form validation schema
const exchangeFormSchema = z.object({
  source_amount: z.number().min(0.01, 'Source amount must be greater than 0'),
  target_amount: z.number().min(0.01, 'Target amount must be greater than 0'),
  source_currency: z.string().min(1, 'Source currency is required'),
  target_currency: z.string().min(1, 'Target currency is required'),
  exchange_date: z.date({
    required_error: "Please select a date",
  }),
  reference_number: z.string().optional(),
  description: z.string().optional(),
});

type ExchangeFormData = z.infer<typeof exchangeFormSchema>;

export interface ExchangeFormProps {
  initialData?: Partial<ExchangeRateCharge>;
  sources?: ExchangeRateSource[];
  currentOfficialRate?: number;
  isEditing?: boolean;
  onSuccess?: (data: ExchangeRateCharge) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
}

export const ExchangeForm: React.FC<ExchangeFormProps> = ({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
  loading = false,
  error,
  success,
}) => {
  const [calculatedRate, setCalculatedRate] = useState(0);
  const { toast } = useToast();
  
  // Get company ID and user ID from Redux state
  const companyId = useSelector((state: RootState) => state.company.companyID);
  const userId = useSelector((state: RootState) => state.auth.user?.ID);

  const form = useForm<ExchangeFormData>({
    resolver: zodResolver(exchangeFormSchema),
    defaultValues: {
      source_amount: initialData?.source_amount || 0,
      target_amount: initialData?.target_amount || 0,
      source_currency: initialData?.source_currency || 'DZD',
      target_currency: initialData?.target_currency || 'EUR',
      exchange_date: initialData?.rate_date ? new Date(initialData.rate_date) : new Date(),
      reference_number: initialData?.transaction_reference || '',
      description: initialData?.purchase_description || '',
    },
  });

  // Watch form values for rate calculation
  const sourceAmount = form.watch('source_amount');
  const targetAmount = form.watch('target_amount');

  // Calculate exchange rate when values change
  React.useEffect(() => {
    // Convert to numbers and handle empty/NaN values
    const source = typeof sourceAmount === 'number' && !isNaN(sourceAmount) ? sourceAmount : 0;
    const target = typeof targetAmount === 'number' && !isNaN(targetAmount) ? targetAmount : 0;
    
    console.log('Form values:', { sourceAmount, targetAmount, source, target });
    
    // Check if both values are greater than 0
    if (source > 0 && target > 0) {
      const rate = target / source;
      console.log('Calculated rate:', rate);
      setCalculatedRate(rate);
    } else {
      console.log('Setting rate to 0');
      setCalculatedRate(0);
    }
  }, [sourceAmount, targetAmount]);

  // Mutation for creating exchange rate charge
  const createExchangeRateMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      // Validate that we have company ID and user ID
      if (!companyId) {
        throw new Error('No company selected. Please select a company first.');
      }

      if (!userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Map form data to service format
      const formData: CreateExchangeRateChargeData = {
        source_currency: data.source_currency as "DZD" | "EUR" | "USD",
        target_currency: data.target_currency as "DZD" | "EUR" | "USD",
        source_amount: data.source_amount,
        target_amount: data.target_amount,
        exchange_rate: calculatedRate,
        exchange_date: data.exchange_date,
        reference_number: data.reference_number,
        description: data.description,
      };

      console.log('Submitting exchange rate charge:', formData);

      const response = await createExchangeRateChargeFromForm(formData, companyId, userId);
      
      if (response.status === 'success' && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create exchange rate charge');
      }
    },
    onSuccess: (data) => {
      console.log('Exchange rate charge created successfully:', data);
      
      // Show success toast
      toast({
        title: "Exchange Rate Charge Created",
        description: `Successfully recorded ${data.source_amount} ${data.source_currency} to ${data.target_amount} ${data.target_currency} exchange.`,
        variant: "default",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Close dialog if onCancel is provided (modal variant)
      if (onCancel) {
        onCancel();
      }
      
      // Reset form after successful submission
      form.reset();
      setCalculatedRate(0);
    },
    onError: (error: Error) => {
      console.error('Form submission error:', error);
      
      // Show error toast
      toast({
        title: "Error Creating Exchange Rate Charge",
        description: error.message || "Failed to create exchange rate charge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ExchangeFormData) => {
    createExchangeRateMutation.mutate(data);
  };

  const swapCurrencies = () => {
    const sourceCurrency = form.getValues('source_currency');
    const targetCurrency = form.getValues('target_currency');
    
    form.setValue('source_currency', targetCurrency);
    form.setValue('target_currency', sourceCurrency);
    
    // Reset amounts when swapping currencies
    form.setValue('source_amount', 0);
    form.setValue('target_amount', 0);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {createExchangeRateMutation.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{createExchangeRateMutation.error.message}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Currency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>From Currency</span>
          </Label>
          <Select 
            value={form.watch('source_currency')} 
            onValueChange={(value) => form.setValue('source_currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DZD">DZD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Euro className="h-4 w-4" />
            <span>To Currency</span>
          </Label>
          <Select 
            value={form.watch('target_currency')} 
            onValueChange={(value) => form.setValue('target_currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="DZD">DZD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Currency Swap Button */}
      <div className="flex justify-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={swapCurrencies}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Swap Currencies</span>
        </Button>
      </div>

      {/* Amount Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source Amount ({form.watch('source_currency')})</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            autoComplete="off"
            {...form.register('source_amount', { 
              valueAsNumber: true,
              onChange: (e) => {
                const value = parseFloat(e.target.value) || 0;
                form.setValue('source_amount', value);
              }
            })}
          />
          <p className="text-sm text-muted-foreground">
            Amount you're exchanging from
          </p>
        </div>

        <div className="space-y-2">
          <Label>Target Amount ({form.watch('target_currency')})</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            autoComplete="off"
            {...form.register('target_amount', { 
              valueAsNumber: true,
              onChange: (e) => {
                const value = parseFloat(e.target.value) || 0;
                form.setValue('target_amount', value);
              }
            })}
          />
          <p className="text-sm text-muted-foreground">
            Amount you're receiving
          </p>
        </div>
      </div>

      {/* Calculated Exchange Rate */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">Calculated Exchange Rate</h4>
        {calculatedRate > 0 ? (
          <>
            <div className="text-2xl font-bold text-blue-600">
              1 {form.watch('target_currency')} = {(1 / calculatedRate).toFixed(4)} {form.watch('source_currency')}
            </div>
            <div className="text-lg text-gray-600 mt-2">
              1 {form.watch('source_currency')} = {calculatedRate.toFixed(4)} {form.watch('target_currency')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is the effective rate you received from the black market
            </p>
          </>
        ) : (
          <div className="text-gray-500">
            Enter both amounts to see the calculated exchange rate
          </div>
        )}
      </div>

      {/* Exchange Date */}
      <div className="space-y-2">
        <Label>Exchange Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch('exchange_date') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('exchange_date') ? (
                format(form.watch('exchange_date'), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch('exchange_date')}
              onSelect={(date) => form.setValue('exchange_date', date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          Date when the exchange transaction occurred
        </p>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Information</h3>
        
        <div className="space-y-2">
          <Label>Reference Number</Label>
          <Input 
            placeholder="Transaction reference..." 
            autoComplete="off"
            {...form.register('reference_number')} 
          />
          <p className="text-sm text-muted-foreground">
            Optional reference number for this transaction
          </p>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            placeholder="Additional details..." 
            rows={3}
            autoComplete="off"
            {...form.register('description')} 
          />
          <p className="text-sm text-muted-foreground">
            Optional description or notes about the transaction
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || createExchangeRateMutation.isPending}>
          {createExchangeRateMutation.isPending ? 'Creating Exchange Rate Charge...' : loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
}; 