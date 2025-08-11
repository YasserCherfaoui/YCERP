// Exchange rate calculator component
import { AppDispatch } from "@/app/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    selectCalculator,
    selectCalculatorResult,
    selectCalculatorValidation,
    selectCurrentRateStatus,
} from "@/features/charges/exchange-rates-selectors";
import {
    fetchCurrentRates,
    quickConvert,
    resetCalculator,
    setCalculatorResult,
    updateCalculator,
} from "@/features/charges/exchange-rates-slice";
import { cn } from "@/lib/utils";
import { calculateExchangeAmount, calculateExchangeLossGain } from "@/services/exchange-rate-service";
import { format } from "date-fns";
import {
    AlertTriangle,
    ArrowRightLeft,
    Calculator,
    DollarSign,
    Info,
    RefreshCw,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const currencyOptions = [
  { value: "DZD", label: "Algerian Dinar (DZD)", symbol: "DA" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
];



export default function ExchangeCalculator() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const calculator = useSelector(selectCalculator);
  const calculatorResult = useSelector(selectCalculatorResult);
  const rateStatus = useSelector(selectCurrentRateStatus);
  const validation = useSelector(selectCalculatorValidation);
  
  // Local state
  const [expectedRate, setExpectedRate] = useState<number>(0);
  const [feePercentage, setFeePercentage] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh rates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"]));
        if (validation.canCalculate) {
          handleCalculate();
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, validation.canCalculate, dispatch]);

  // Update calculator state
  const updateField = (field: keyof typeof calculator, value: any) => {
    dispatch(updateCalculator({ [field]: value }));
  };

  // Swap currencies
  const swapCurrencies = () => {
    dispatch(updateCalculator({
      sourceCurrency: calculator.targetCurrency,
      targetCurrency: calculator.sourceCurrency,
    }));
  };

  // Get current rate from latest exchange rate
  const getCurrentRate = async () => {
    try {
      // Get the current rates from the store
      const currentRates = await dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"])).unwrap();
      console.log('Calculator - Current Rates from API:', currentRates);
      
      // Create the pair key - the service returns EUR/DZD format
      const pair = `${calculator.sourceCurrency}/${calculator.targetCurrency}`;
      console.log('Calculator - Looking for pair:', pair);
      
      // Check if we have the exact pair
      if (currentRates[pair]) {
        console.log('Calculator - Found exact pair:', pair, 'Rate:', currentRates[pair]);
        return currentRates[pair];
      }
      
      // If not found, try to find any available rate
      // The service should return EUR/DZD and USD/DZD
      if (calculator.sourceCurrency === "EUR" && calculator.targetCurrency === "DZD") {
        const rate = currentRates["EUR/DZD"] || 0;
        console.log('Calculator - EUR/DZD rate:', rate);
        return rate;
      } else if (calculator.sourceCurrency === "USD" && calculator.targetCurrency === "DZD") {
        const rate = currentRates["USD/DZD"] || 0;
        console.log('Calculator - USD/DZD rate:', rate);
        return rate;
      } else if (calculator.sourceCurrency === "DZD" && calculator.targetCurrency === "EUR") {
        // For DZD/EUR, we need to invert the EUR/DZD rate
        const eurDzdRate = currentRates["EUR/DZD"];
        const invertedRate = eurDzdRate ? 1 / eurDzdRate : 0;
        console.log('Calculator - DZD/EUR inverted rate:', invertedRate, 'from EUR/DZD:', eurDzdRate);
        return invertedRate;
      } else if (calculator.sourceCurrency === "DZD" && calculator.targetCurrency === "USD") {
        // For DZD/USD, we need to invert the USD/DZD rate
        const usdDzdRate = currentRates["USD/DZD"];
        const invertedRate = usdDzdRate ? 1 / usdDzdRate : 0;
        console.log('Calculator - DZD/USD inverted rate:', invertedRate, 'from USD/DZD:', usdDzdRate);
        return invertedRate;
      }
      
      console.log('Calculator - No matching rate found, returning 0');
      return 0;
    } catch (error) {
      console.error('Failed to fetch current rate:', error);
      return 0;
    }
  };

  // Calculate exchange
  const handleCalculate = async () => {
    if (!validation.canCalculate) return;

    setIsCalculating(true);
    
    try {
      const rate = await getCurrentRate();
      console.log('Calculator - Source Currency:', calculator.sourceCurrency);
      console.log('Calculator - Target Currency:', calculator.targetCurrency);
      console.log('Calculator - Retrieved Rate:', rate);
      
      if (rate <= 0) {
        throw new Error('Invalid exchange rate');
      }

      // Calculate conversion
      const conversion = calculateExchangeAmount(
        calculator.sourceAmount,
        rate,
        feePercentage
      );

      console.log('Calculator - Conversion Result:', conversion);

      // Calculate loss/gain if expected rate is provided
      let lossGain = null;
      if (expectedRate > 0) {
        lossGain = calculateExchangeLossGain(
          calculator.sourceAmount,
          rate,
          expectedRate
        );
      }

      const result = {
        sourceAmount: calculator.sourceAmount,
        targetAmount: conversion.targetAmount,
        exchangeRate: rate,
        feeAmount: conversion.feeAmount,
        totalCost: conversion.totalCost,
        lossGainAmount: lossGain?.lossGainAmount,
        lossGainPercentage: lossGain?.lossGainPercentage,
        isGain: lossGain?.isGain,
      };

      console.log('Calculator - Final Result:', result);
      dispatch(setCalculatorResult(result));
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Quick convert using API
  const handleQuickConvert = async () => {
    if (!validation.canCalculate) return;

    setIsCalculating(true);
    
    try {
      await dispatch(quickConvert({
        amount: calculator.sourceAmount,
        sourceCurrency: calculator.sourceCurrency,
        targetCurrency: calculator.targetCurrency,
        source: calculator.selectedSource,
      })).unwrap();
    } catch (error) {
      console.error('Quick convert failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset calculator
  const handleReset = () => {
    dispatch(resetCalculator());
    setExpectedRate(0);
    setFeePercentage(0);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencyOptions.find(c => c.value === currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount).replace(currency, currencyInfo?.symbol || currency);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Exchange Rate Calculator</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh && "bg-green-50 border-green-200")}
          >
            <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rate Status */}
        {!rateStatus.hasRates && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No current rates available. Please refresh or check your connection.
            </AlertDescription>
          </Alert>
        )}

        {rateStatus.isStale && rateStatus.hasRates && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Rates are {rateStatus.minutesSinceUpdate} minutes old. Consider refreshing.
            </AlertDescription>
          </Alert>
        )}

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>From Currency</Label>
            <Select 
              value={calculator.sourceCurrency} 
              onValueChange={(value) => updateField('sourceCurrency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <div className="flex items-center space-x-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapCurrencies}
              className="h-10 w-10 p-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To Currency</Label>
            <Select 
              value={calculator.targetCurrency} 
              onValueChange={(value) => updateField('targetCurrency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <div className="flex items-center space-x-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>Amount to Convert</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-10"
              value={calculator.sourceAmount || ''}
              onChange={(e) => updateField('sourceAmount', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Rate Source - Always use latest exchange rate */}
        <div className="space-y-2">
          <Label>Rate Source</Label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            Using latest exchange rate from current market
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Expected Rate (Optional)</Label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.0000"
              value={expectedRate || ''}
              onChange={(e) => setExpectedRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fee Percentage (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              value={feePercentage || ''}
              onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCalculate}
            disabled={!validation.canCalculate || isCalculating}
            className="flex-1"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleQuickConvert}
            disabled={!validation.canCalculate || isCalculating}
          >
            Quick Convert
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isCalculating}
          >
            Reset
          </Button>
        </div>

        {/* Results */}
        {calculatorResult && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">Conversion Result</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md border">
                <div className="text-sm text-gray-600 mb-1">You Send</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(calculatorResult.sourceAmount, calculator.sourceCurrency)}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-md border">
                <div className="text-sm text-gray-600 mb-1">They Receive</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(calculatorResult.targetAmount, calculator.targetCurrency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-md border">
                <div className="text-gray-600 mb-1">Exchange Rate</div>
                <div className="font-medium text-gray-900">
                  1 {calculator.sourceCurrency} = {calculatorResult.exchangeRate.toFixed(4)} {calculator.targetCurrency}
                </div>
              </div>

              {calculatorResult.feeAmount > 0 && (
                <div className="bg-white p-3 rounded-md border">
                  <div className="text-gray-600 mb-1">Fee</div>
                  <div className="font-medium text-gray-900">
                    {formatCurrency(calculatorResult.feeAmount, calculator.sourceCurrency)}
                  </div>
                </div>
              )}

              <div className="bg-white p-3 rounded-md border">
                <div className="text-gray-600 mb-1">Total Cost</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(calculatorResult.totalCost, calculator.sourceCurrency)}
                </div>
              </div>

              {calculatorResult.lossGainAmount !== undefined && (
                <div className="bg-white p-3 rounded-md border">
                  <div className="text-gray-600 mb-1">Loss/Gain</div>
                  <div className={cn(
                    "font-medium flex items-center space-x-1",
                    calculatorResult.isGain ? "text-green-600" : "text-red-600"
                  )}>
                    {calculatorResult.isGain ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {formatCurrency(Math.abs(calculatorResult.lossGainAmount), calculator.targetCurrency)}
                      ({calculatorResult.lossGainPercentage?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded border-t">
              Rate from latest exchange rate • Updated {format(new Date(), 'MMM dd, HH:mm')} • 
              Using current market rate
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}