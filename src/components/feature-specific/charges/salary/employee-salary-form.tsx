import { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEmployeeSalaryChargeAsync } from '@/features/charges/charges-slice';
import { AlertCircle, Calculator, DollarSign, User } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export interface EmployeeSalaryFormProps {
  companyId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EmployeeSalaryForm: React.FC<EmployeeSalaryFormProps> = ({ 
  companyId, 
  onSuccess, 
  onCancel 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting, error } = useSelector((state: RootState) => state.charges);
  
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_position: '',
    base_salary: 0,
    allowances: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    overtime_amount: 0,
    payment_method: 'bank_transfer',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'cash', label: 'Cash' },
    { value: 'online', label: 'Online Payment' },
  ];

  const positions = [
    'Developer',
    'Designer',
    'Manager',
    'Administrator',
    'Sales Representative',
    'Customer Support',
    'Marketing Specialist',
    'Accountant',
    'HR Specialist',
    'Other',
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateOvertimeAmount = () => {
    const { overtime_hours, overtime_rate } = formData;
    if (overtime_hours && overtime_rate) {
      const overtimeAmount = overtime_hours * overtime_rate;
      setFormData(prev => ({ ...prev, overtime_amount: overtimeAmount }));
    }
  };

  const calculateTotalSalary = () => {
    const { base_salary, allowances, overtime_amount } = formData;
    return base_salary + allowances + overtime_amount;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_name.trim()) {
      newErrors.employee_name = 'Employee name is required';
    }

    if (!formData.employee_position.trim()) {
      newErrors.employee_position = 'Employee position is required';
    }

    if (formData.base_salary <= 0) {
      newErrors.base_salary = 'Base salary must be greater than 0';
    }

    if (formData.overtime_hours < 0) {
      newErrors.overtime_hours = 'Overtime hours cannot be negative';
    }

    if (formData.overtime_rate < 0) {
      newErrors.overtime_rate = 'Overtime rate cannot be negative';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
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
      await dispatch(createEmployeeSalaryChargeAsync({
        company_id: companyId,
        ...formData,
      })).unwrap();

      toast.success('Employee salary charge created successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create employee salary charge');
    }
  };

  const handleCalculateOvertime = () => {
    calculateOvertimeAmount();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Create Employee Salary Charge
        </CardTitle>
        <CardDescription>
          Record employee salary payments and associated costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee_name">Employee Name *</Label>
              <Input
                id="employee_name"
                value={formData.employee_name}
                onChange={(e) => handleInputChange('employee_name', e.target.value)}
                placeholder="Enter employee full name"
                className={errors.employee_name ? 'border-red-500' : ''}
              />
              {errors.employee_name && (
                <p className="text-sm text-red-500 mt-1">{errors.employee_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="employee_position">Position *</Label>
              <Select
                value={formData.employee_position}
                onValueChange={(value) => handleInputChange('employee_position', value)}
              >
                <SelectTrigger className={errors.employee_position ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_position && (
                <p className="text-sm text-red-500 mt-1">{errors.employee_position}</p>
              )}
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_salary">Base Salary *</Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                value={formData.base_salary}
                onChange={(e) => handleInputChange('base_salary', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.base_salary ? 'border-red-500' : ''}
              />
              {errors.base_salary && (
                <p className="text-sm text-red-500 mt-1">{errors.base_salary}</p>
              )}
            </div>

            <div>
              <Label htmlFor="allowances">Allowances (Optional)</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                value={formData.allowances}
                onChange={(e) => handleInputChange('allowances', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Overtime Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="overtime_hours">Overtime Hours</Label>
                <Input
                  id="overtime_hours"
                  type="number"
                  step="0.5"
                  value={formData.overtime_hours}
                  onChange={(e) => handleInputChange('overtime_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={errors.overtime_hours ? 'border-red-500' : ''}
                />
                {errors.overtime_hours && (
                  <p className="text-sm text-red-500 mt-1">{errors.overtime_hours}</p>
                )}
              </div>

              <div>
                <Label htmlFor="overtime_rate">Overtime Rate</Label>
                <Input
                  id="overtime_rate"
                  type="number"
                  step="0.01"
                  value={formData.overtime_rate}
                  onChange={(e) => handleInputChange('overtime_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.overtime_rate ? 'border-red-500' : ''}
                />
                {errors.overtime_rate && (
                  <p className="text-sm text-red-500 mt-1">{errors.overtime_rate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="overtime_amount">Overtime Amount</Label>
                <Input
                  id="overtime_amount"
                  type="number"
                  step="0.01"
                  value={formData.overtime_amount}
                  onChange={(e) => handleInputChange('overtime_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculateOvertime}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculate Overtime
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => handleInputChange('payment_method', value)}
            >
              <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-red-500 mt-1">{errors.payment_method}</p>
            )}
          </div>

          {/* Total Salary Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span>{formData.base_salary.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span>{formData.allowances.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Amount:</span>
                  <span>{formData.overtime_amount.toLocaleString()} DZD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Salary:</span>
                    <span>{calculateTotalSalary().toLocaleString()} DZD</span>
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
              <DollarSign className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Salary Charge'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeSalaryForm; 