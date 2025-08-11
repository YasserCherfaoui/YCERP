import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  selectCalculatorError,
  selectCalculatorLoading,
  selectCalculatorResult,
} from '@/features/charges/salary-selectors';
import {
  calculateSalaryAsync, clearCalculatorResult
} from '@/features/charges/salary-slice';
import {
  AlertTriangle,
  Calculator,
  CheckCircle,
  Clock, Minus,
  Plus,
  RefreshCw, User
} from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

export interface SalaryCalculatorProps {
  /** Initial values */
  initialValues?: {
    base_salary?: number;
    overtime_hours?: number;
    overtime_rate?: number;
    work_days?: number;
    work_hours?: number;
    pay_frequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
  };
  /** Whether to show the full calculator or compact version */
  variant?: 'full' | 'compact';
  /** Callback when calculation completes */
  onCalculationComplete?: (result: any) => void;
  /** Additional CSS classes */
  className?: string;
}

interface CalculatorFormData {
  base_salary: number;
  overtime_hours: number;
  overtime_rate_multiplier: number;
  work_days: number;
  work_hours: number;
  absent_days: number;
  sick_days: number;
  vacation_days: number;
  pay_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  
  // Allowances
  transport_allowance: number;
  meal_allowance: number;
  housing_allowance: number;
  performance_bonus: number;
  special_bonus: number;
  commission: number;
  
  // Deductions
  social_security: number;
  tax_deduction: number;
  insurance_deduction: number;
  advance_deduction: number;
  other_deductions: number;
}

const defaultFormData: CalculatorFormData = {
  base_salary: 0,
  overtime_hours: 0,
  overtime_rate_multiplier: 1.5,
  work_days: 22,
  work_hours: 176, // 22 days * 8 hours
  absent_days: 0,
  sick_days: 0,
  vacation_days: 0,
  pay_frequency: 'monthly',
  
  // Allowances
  transport_allowance: 0,
  meal_allowance: 0,
  housing_allowance: 0,
  performance_bonus: 0,
  special_bonus: 0,
  commission: 0,
  
  // Deductions
  social_security: 0,
  tax_deduction: 0,
  insurance_deduction: 0,
  advance_deduction: 0,
  other_deductions: 0,
};

const payFrequencyOptions = [
  { value: 'weekly', label: 'Weekly', workDays: 5, workHours: 40 },
  { value: 'biweekly', label: 'Bi-weekly', workDays: 10, workHours: 80 },
  { value: 'monthly', label: 'Monthly', workDays: 22, workHours: 176 },
  { value: 'quarterly', label: 'Quarterly', workDays: 66, workHours: 528 },
];

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  initialValues,
  variant = 'full',
  onCalculationComplete,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const calculationResult = useSelector(selectCalculatorResult);
  const calculatorLoading = useSelector(selectCalculatorLoading);
  const calculatorError = useSelector(selectCalculatorError);

  const form = useForm<CalculatorFormData>({
    defaultValues: {
      ...defaultFormData,
      ...initialValues,
    },
  });

  const { watch, setValue, reset } = form;
  const watchedValues = watch();

  // Handle initial values changes
  useEffect(() => {
    if (initialValues) {
      reset({
        ...defaultFormData,
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  const handleCalculate = useCallback(async () => {
    const formData = form.getValues();
    if (formData.base_salary <= 0) return;

    const calculationParams = {
      base_salary: formData.base_salary,
      overtime_hours: formData.overtime_hours,
      overtime_rate: formData.base_salary / formData.work_hours * formData.overtime_rate_multiplier,
      work_days: formData.work_days,
      work_hours: formData.work_hours,
      absent_days: formData.absent_days,
      sick_days: formData.sick_days,
      vacation_days: formData.vacation_days,
      allowances: {
        transport: formData.transport_allowance,
        meal: formData.meal_allowance,
        housing: formData.housing_allowance,
        performance_bonus: formData.performance_bonus,
        special_bonus: formData.special_bonus,
        commission: formData.commission,
      },
      deductions: {
        social_security: formData.social_security,
        tax_deduction: formData.tax_deduction,
        insurance_deduction: formData.insurance_deduction,
        advance_deduction: formData.advance_deduction,
        other_deductions: formData.other_deductions,
      },
      pay_frequency: formData.pay_frequency,
    };

    dispatch(calculateSalaryAsync(calculationParams));
  }, [form, dispatch]);

  useEffect(() => {
    if (calculationResult && onCalculationComplete) {
      onCalculationComplete(calculationResult);
    }
  }, [calculationResult, onCalculationComplete]);

  const updatePayFrequency = (frequency: "weekly" | "biweekly" | "monthly" | "quarterly") => {
    const frequencyData = payFrequencyOptions.find(opt => opt.value === frequency);
    if (frequencyData) {
      setValue('pay_frequency', frequency);
      setValue('work_days', frequencyData.workDays);
      setValue('work_hours', frequencyData.workHours);
    }
  };

  const handleClear = () => {
    reset(defaultFormData);
    dispatch(clearCalculatorResult());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const CalculationResult = () => {
    if (!calculationResult) return null;

    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Calculation Result</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">Gross Amount</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(calculationResult.gross_amount)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Net Amount</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(calculationResult.net_amount)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Breakdown</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Salary:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.base_amount)}</span>
                </div>
                {calculationResult.overtime_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime:</span>
                    <span className="font-medium">{formatCurrency(calculationResult.overtime_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Allowances:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.total_allowances)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Deductions:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(calculationResult.total_deductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective Hourly Rate:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.effective_hourly_rate)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours Worked:</span>
                  <span className="font-medium">{calculationResult.hours_worked} hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {variant === 'full' && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Allowances</h5>
                  <div className="space-y-1 text-sm">
                    {Object.entries(calculationResult.calculation_breakdown.allowances).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-700 mb-2">Deductions</h5>
                  <div className="space-y-1 text-sm">
                    {Object.entries(calculationResult.calculation_breakdown.deductions).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-red-600">-{formatCurrency(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary" className="text-sm font-medium">Base Salary</Label>
              <div className="relative">
                <Input
                  id="base_salary"
                  type="number"
                  value={watchedValues.base_salary || ''}
                  onChange={(e) => setValue('base_salary', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</Label>
              <div className="relative">
                <Input
                  id="overtime_hours"
                  type="number"
                  value={watchedValues.overtime_hours || ''}
                  onChange={(e) => setValue('overtime_hours', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  hrs
                </span>
              </div>
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
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(calculationResult.net_amount)}
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
              <span>Salary Calculator</span>
            </CardTitle>
            <CardDescription>
              Calculate employee salaries with allowances, deductions, and overtime
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Basic Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary" className="text-sm font-medium">Base Salary</Label>
              <div className="relative">
                <Input
                  id="base_salary"
                  type="number"
                  value={watchedValues.base_salary || ''}
                  onChange={(e) => setValue('base_salary', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Monthly base salary amount</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pay Frequency</Label>
              <Select
                value={watchedValues.pay_frequency}
                onValueChange={(value) => {
                  setValue('pay_frequency', value as "weekly" | "biweekly" | "monthly" | "quarterly");
                  updatePayFrequency(value as "weekly" | "biweekly" | "monthly" | "quarterly");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payFrequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work_days" className="text-sm font-medium">Work Days</Label>
              <div className="relative">
                <Input
                  id="work_days"
                  type="number"
                  value={watchedValues.work_days || ''}
                  onChange={(e) => setValue('work_days', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Number of working days in period</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work_hours" className="text-sm font-medium">Work Hours</Label>
              <div className="relative">
                <Input
                  id="work_hours"
                  type="number"
                  value={watchedValues.work_hours || ''}
                  onChange={(e) => setValue('work_hours', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  hrs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Total working hours</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="absent_days" className="text-sm font-medium">Absent Days</Label>
              <div className="relative">
                <Input
                  id="absent_days"
                  type="number"
                  value={watchedValues.absent_days || ''}
                  onChange={(e) => setValue('absent_days', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sick_days" className="text-sm font-medium">Sick Days</Label>
              <div className="relative">
                <Input
                  id="sick_days"
                  type="number"
                  value={watchedValues.sick_days || ''}
                  onChange={(e) => setValue('sick_days', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacation_days" className="text-sm font-medium">Vacation Days</Label>
              <div className="relative">
                <Input
                  id="vacation_days"
                  type="number"
                  value={watchedValues.vacation_days || ''}
                  onChange={(e) => setValue('vacation_days', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Overtime */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Overtime</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</Label>
              <div className="relative">
                <Input
                  id="overtime_hours"
                  type="number"
                  value={watchedValues.overtime_hours || ''}
                  onChange={(e) => setValue('overtime_hours', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  hrs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Additional hours worked</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="overtime_rate_multiplier" className="text-sm font-medium">Overtime Rate Multiplier</Label>
              <div className="relative">
                <Input
                  id="overtime_rate_multiplier"
                  type="number"
                  value={watchedValues.overtime_rate_multiplier || ''}
                  onChange={(e) => setValue('overtime_rate_multiplier', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  x
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Multiplier for overtime rate (e.g., 1.5x)</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Allowances */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Allowances</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transport_allowance" className="text-sm font-medium">Transport Allowance</Label>
              <div className="relative">
                <Input
                  id="transport_allowance"
                  type="number"
                  value={watchedValues.transport_allowance || ''}
                  onChange={(e) => setValue('transport_allowance', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal_allowance" className="text-sm font-medium">Meal Allowance</Label>
              <div className="relative">
                <Input
                  id="meal_allowance"
                  type="number"
                  value={watchedValues.meal_allowance || ''}
                  onChange={(e) => setValue('meal_allowance', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="housing_allowance" className="text-sm font-medium">Housing Allowance</Label>
              <div className="relative">
                <Input
                  id="housing_allowance"
                  type="number"
                  value={watchedValues.housing_allowance || ''}
                  onChange={(e) => setValue('housing_allowance', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="performance_bonus" className="text-sm font-medium">Performance Bonus</Label>
              <div className="relative">
                <Input
                  id="performance_bonus"
                  type="number"
                  value={watchedValues.performance_bonus || ''}
                  onChange={(e) => setValue('performance_bonus', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_bonus" className="text-sm font-medium">Special Bonus</Label>
              <div className="relative">
                <Input
                  id="special_bonus"
                  type="number"
                  value={watchedValues.special_bonus || ''}
                  onChange={(e) => setValue('special_bonus', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission" className="text-sm font-medium">Commission</Label>
              <div className="relative">
                <Input
                  id="commission"
                  type="number"
                  value={watchedValues.commission || ''}
                  onChange={(e) => setValue('commission', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deductions */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Minus className="h-4 w-4" />
            <span>Deductions</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="social_security" className="text-sm font-medium">Social Security</Label>
              <div className="relative">
                <Input
                  id="social_security"
                  type="number"
                  value={watchedValues.social_security || ''}
                  onChange={(e) => setValue('social_security', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_deduction" className="text-sm font-medium">Tax Deduction</Label>
              <div className="relative">
                <Input
                  id="tax_deduction"
                  type="number"
                  value={watchedValues.tax_deduction || ''}
                  onChange={(e) => setValue('tax_deduction', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance_deduction" className="text-sm font-medium">Insurance Deduction</Label>
              <div className="relative">
                <Input
                  id="insurance_deduction"
                  type="number"
                  value={watchedValues.insurance_deduction || ''}
                  onChange={(e) => setValue('insurance_deduction', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advance_deduction" className="text-sm font-medium">Advance Deduction</Label>
              <div className="relative">
                <Input
                  id="advance_deduction"
                  type="number"
                  value={watchedValues.advance_deduction || ''}
                  onChange={(e) => setValue('advance_deduction', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other_deductions" className="text-sm font-medium">Other Deductions</Label>
              <div className="relative">
                <Input
                  id="other_deductions"
                  type="number"
                  value={watchedValues.other_deductions || ''}
                  onChange={(e) => setValue('other_deductions', parseFloat(e.target.value) || 0)}
                  className="pr-12"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  DZD
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleCalculate} 
            disabled={calculatorLoading || watchedValues.base_salary <= 0}
            className="flex-1"
          >
            {calculatorLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            Calculate Salary
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

export default SalaryCalculator;