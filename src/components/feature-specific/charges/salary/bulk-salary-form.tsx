import { AppDispatch } from '@/app/store';
import { FileUpload } from '@/components/common/file-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    selectBulkOperationError,
    selectBulkOperationLoading,
    selectBulkOperationResult,
    selectSalaryTemplates,
} from '@/features/charges/salary-selectors';
import {
    bulkCreateSalaryChargesAsync,
    bulkUpdateSalaryChargesAsync,
    createPayrollBatchAsync,
    importSalaryChargesAsync,
} from '@/features/charges/salary-slice';
import { cn } from '@/lib/utils';
import { SalaryTemplate } from '@/models/data/charges/salary.model';
import { CreateSalaryChargeData } from '@/services/salary-service';
import {
    AlertTriangle,
    CheckCircle,
    Copy,
    Download,
    FileSpreadsheet,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    Upload,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface BulkSalaryFormProps {
  /** Form variant */
  variant?: 'create' | 'update' | 'payroll';
  /** Pre-filled employee IDs */
  employeeIds?: number[];
  /** Pre-filled department */
  department?: string;
  /** Callback when operation completes */
  onComplete?: (result: any) => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface BulkSalaryEntry extends CreateSalaryChargeData {
  id: string;
  isValid: boolean;
  errors: Record<string, string>;
}

const defaultSalaryEntry: Omit<BulkSalaryEntry, 'id'> = {
  employee_name: '',
  employee_position: '',
  employee_department: '',
  base_salary: 0,
  overtime_hours: 0,
  overtime_rate: 0,
  work_days: 22,
  work_hours: 176,
  absent_days: 0,
  sick_days: 0,
  vacation_days: 0,
  pay_period_start: '',
  pay_period_end: '',
  pay_frequency: 'monthly',
  payment_method: 'bank_transfer',
  employment_type: 'full_time',
  tax_year: new Date().getFullYear(),
  tax_month: new Date().getMonth() + 1,
  tax_declaration_included: false,
  transport_allowance: 0,
  meal_allowance: 0,
  housing_allowance: 0,
  performance_bonus: 0,
  special_bonus: 0,
  commission: 0,
  social_security: 0,
  tax_deduction: 0,
  insurance_deduction: 0,
  advance_deduction: 0,
  other_deductions: 0,
  isValid: false,
  errors: {},
};

export const BulkSalaryForm: React.FC<BulkSalaryFormProps> = ({
  variant = 'create',
  employeeIds = [],
  department,
  onComplete,
  onCancel,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const bulkLoading = useSelector(selectBulkOperationLoading);
  const bulkResult = useSelector(selectBulkOperationResult);
  const bulkError = useSelector(selectBulkOperationError);
  const salaryTemplates = useSelector(selectSalaryTemplates);

  // Local state
  const [salaryEntries, setSalaryEntries] = useState<BulkSalaryEntry[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [payrollBatchName, setPayrollBatchName] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'entries' | 'review' | 'complete'>('setup');

  // Initialize entries
  React.useEffect(() => {
    if (employeeIds.length > 0 && salaryEntries.length === 0) {
      const newEntries = employeeIds.map((id, index) => ({
        ...defaultSalaryEntry,
        id: `entry-${index}`,
        employee_id: id,
        employee_department: department || '',
      }));
      setSalaryEntries(newEntries);
      setCurrentStep('entries');
    } else if (salaryEntries.length === 0) {
      addNewEntry();
    }
  }, [employeeIds, department]);

  const addNewEntry = () => {
    const newEntry: BulkSalaryEntry = {
      ...defaultSalaryEntry,
      id: `entry-${Date.now()}`,
      employee_department: department || '',
    };
    setSalaryEntries(prev => [...prev, newEntry]);
  };

  const removeEntry = (id: string) => {
    setSalaryEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const duplicateEntry = (id: string) => {
    const entry = salaryEntries.find(e => e.id === id);
    if (entry) {
      const duplicated: BulkSalaryEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
        employee_name: `${entry.employee_name} (Copy)`,
      };
      setSalaryEntries(prev => [...prev, duplicated]);
    }
  };

  const updateEntry = (id: string, updates: Partial<BulkSalaryEntry>) => {
    setSalaryEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const applyTemplate = (template: SalaryTemplate) => {
    setSalaryEntries(prev => prev.map(entry => ({
      ...entry,
      employee_position: template.position,
      employee_department: template.department || entry.employee_department,
      base_salary: template.base_salary,
      overtime_rate: template.overtime_rate || 0,
      transport_allowance: template.allowances.transport || 0,
      meal_allowance: template.allowances.meal || 0,
      housing_allowance: template.allowances.housing || 0,
      social_security: template.deductions.social_security_rate ? 
        (entry.base_salary * template.deductions.social_security_rate / 100) : 0,
      tax_deduction: template.deductions.tax_rate ? 
        (entry.base_salary * template.deductions.tax_rate / 100) : 0,
      insurance_deduction: template.deductions.insurance_rate ? 
        (entry.base_salary * template.deductions.insurance_rate / 100) : 0,
    })));
    setSelectedTemplate(template);
  };

  const validateEntries = () => {
    const validatedEntries = salaryEntries.map(entry => {
      const errors: Record<string, string> = {};

      if (!entry.employee_name.trim()) {
        errors.employee_name = 'Employee name is required';
      }
      if (!entry.employee_position.trim()) {
        errors.employee_position = 'Position is required';
      }
      if (entry.base_salary <= 0) {
        errors.base_salary = 'Base salary must be greater than 0';
      }
      if (!entry.pay_period_start) {
        errors.pay_period_start = 'Pay period start is required';
      }
      if (!entry.pay_period_end) {
        errors.pay_period_end = 'Pay period end is required';
      }
      if (entry.work_days <= 0) {
        errors.work_days = 'Work days must be greater than 0';
      }

      return {
        ...entry,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    });

    setSalaryEntries(validatedEntries);
    return validatedEntries.every(entry => entry.isValid);
  };

  const handleSubmit = async () => {
    if (!validateEntries()) {
      return;
    }

    setProcessing(true);
    try {
      const salaryData = salaryEntries.map(({ id, isValid, errors, ...entry }) => entry);

      let result;
      if (variant === 'payroll') {
        // Create payroll batch first
        const batchResult = await dispatch(createPayrollBatchAsync({
          name: payrollBatchName || `Payroll Batch ${new Date().toLocaleDateString()}`,
          pay_period_start: salaryEntries[0]?.pay_period_start || '',
          pay_period_end: salaryEntries[0]?.pay_period_end || '',
          auto_calculate: true,
        }));

        if (createPayrollBatchAsync.fulfilled.match(batchResult)) {
          result = await dispatch(bulkCreateSalaryChargesAsync(salaryData));
        }
      } else if (variant === 'create') {
        result = await dispatch(bulkCreateSalaryChargesAsync(salaryData));
      } else {
        // Update variant would need IDs
        const updateData = salaryData.map((entry, index) => ({
          ...entry,
          id: salaryEntries[index].employee_id || 0,
        }));
        result = await dispatch(bulkUpdateSalaryChargesAsync(updateData as any));
      }

      if (result && onComplete) {
        onComplete(result);
      }
      setCurrentStep('complete');
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    try {
      await dispatch(importSalaryChargesAsync({ 
        file, 
        options: { 
          skip_duplicates: true, 
          auto_calculate: true 
        } 
      }));
      setImportDialogOpen(false);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const EntryForm = ({ entry, index }: { entry: BulkSalaryEntry; index: number }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Employee #{index + 1}
            {entry.employee_name && ` - ${entry.employee_name}`}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={entry.isValid ? "default" : "destructive"}>
              {entry.isValid ? 'Valid' : 'Invalid'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateEntry(entry.id)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeEntry(entry.id)}
              disabled={salaryEntries.length <= 1}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Employee Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Employee Name</Label>
            <Input
              value={entry.employee_name}
              onChange={(e) => updateEntry(entry.id, { employee_name: e.target.value })}
              placeholder="Enter employee name"
              className={entry.errors.employee_name ? 'border-red-500' : ''}
            />
            {entry.errors.employee_name && (
              <p className="text-xs text-red-600">{entry.errors.employee_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              value={entry.employee_position}
              onChange={(e) => updateEntry(entry.id, { employee_position: e.target.value })}
              placeholder="Enter position"
              className={entry.errors.employee_position ? 'border-red-500' : ''}
            />
            {entry.errors.employee_position && (
              <p className="text-xs text-red-600">{entry.errors.employee_position}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Input
              value={entry.employee_department || ''}
              onChange={(e) => updateEntry(entry.id, { employee_department: e.target.value })}
              placeholder="Enter department"
            />
          </div>
        </div>

        {/* Salary Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Base Salary (DZD)</Label>
            <Input
              type="number"
              value={entry.base_salary}
              onChange={(e) => updateEntry(entry.id, { base_salary: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className={entry.errors.base_salary ? 'border-red-500' : ''}
            />
            {entry.errors.base_salary && (
              <p className="text-xs text-red-600">{entry.errors.base_salary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Overtime Hours</Label>
            <Input
              type="number"
              value={entry.overtime_hours || 0}
              onChange={(e) => updateEntry(entry.id, { overtime_hours: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Work Days</Label>
            <Input
              type="number"
              value={entry.work_days}
              onChange={(e) => updateEntry(entry.id, { work_days: parseInt(e.target.value) || 0 })}
              placeholder="22"
              className={entry.errors.work_days ? 'border-red-500' : ''}
            />
            {entry.errors.work_days && (
              <p className="text-xs text-red-600">{entry.errors.work_days}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select 
              value={entry.employment_type} 
              onValueChange={(value: any) => updateEntry(entry.id, { employment_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pay Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Pay Period Start</Label>
            <Input
              type="date"
              value={entry.pay_period_start}
              onChange={(e) => updateEntry(entry.id, { pay_period_start: e.target.value })}
              className={entry.errors.pay_period_start ? 'border-red-500' : ''}
            />
            {entry.errors.pay_period_start && (
              <p className="text-xs text-red-600">{entry.errors.pay_period_start}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pay Period End</Label>
            <Input
              type="date"
              value={entry.pay_period_end}
              onChange={(e) => updateEntry(entry.id, { pay_period_end: e.target.value })}
              className={entry.errors.pay_period_end ? 'border-red-500' : ''}
            />
            {entry.errors.pay_period_end && (
              <p className="text-xs text-red-600">{entry.errors.pay_period_end}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select 
              value={entry.payment_method} 
              onValueChange={(value: any) => updateEntry(entry.id, { payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Calculation Display */}
        {entry.base_salary > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Gross: </span>
                <span className="font-medium">{formatCurrency(entry.base_salary + (entry.overtime_hours || 0) * (entry.overtime_rate || 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Allowances: </span>
                <span className="font-medium">{formatCurrency((entry.transport_allowance || 0) + (entry.meal_allowance || 0) + (entry.housing_allowance || 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Deductions: </span>
                <span className="font-medium">{formatCurrency((entry.social_security || 0) + (entry.tax_deduction || 0) + (entry.insurance_deduction || 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Net: </span>
                <span className="font-medium text-primary">
                  {formatCurrency(
                    entry.base_salary + 
                    (entry.overtime_hours || 0) * (entry.overtime_rate || 0) +
                    (entry.transport_allowance || 0) + (entry.meal_allowance || 0) + (entry.housing_allowance || 0) -
                    (entry.social_security || 0) - (entry.tax_deduction || 0) - (entry.insurance_deduction || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const validEntries = salaryEntries.filter(entry => entry.isValid).length;
  const totalEntries = salaryEntries.length;
  const progress = totalEntries > 0 ? (validEntries / totalEntries) * 100 : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>
                  {variant === 'create' ? 'Bulk Create Salaries' : 
                   variant === 'update' ? 'Bulk Update Salaries' : 
                   'Create Payroll Batch'}
                </span>
              </CardTitle>
              <CardDescription>
                {variant === 'payroll' ? 
                  'Create a payroll batch with multiple employee salaries' :
                  'Manage multiple employee salary entries efficiently'
                }
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Salary Data</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <FileUpload
                      onFilesChange={handleImport}
                      acceptedFileTypes={['.xlsx', '.csv']}
                      maxFiles={1}
                      variant="dropzone"
                      dropzoneText="Drop your salary file here or click to browse"
                    />
                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertDescription>
                        Upload an Excel (.xlsx) or CSV file with employee salary data. 
                        Required columns: employee_name, employee_position, base_salary, pay_period_start, pay_period_end.
                      </AlertDescription>
                    </Alert>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {validEntries} of {totalEntries} entries valid
              </span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        {/* Templates */}
        {salaryTemplates.length > 0 && (
          <CardContent className="border-t">
            <div className="space-y-3">
              <Label>Apply Template to All Entries</Label>
              <div className="flex flex-wrap gap-2">
                {salaryTemplates.map(template => (
                  <Button
                    key={template.ID}
                    variant={selectedTemplate?.ID === template.ID ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name} - {template.position}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payroll Batch Name */}
      {variant === 'payroll' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label>Payroll Batch Name</Label>
              <Input
                value={payrollBatchName}
                onChange={(e) => setPayrollBatchName(e.target.value)}
                placeholder="Enter payroll batch name"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      <div className="space-y-4">
        {salaryEntries.map((entry, index) => (
          <EntryForm key={entry.id} entry={entry} index={index} />
        ))}
      </div>

      {/* Add Entry */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={addNewEntry} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Employee
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {bulkError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{bulkError}</AlertDescription>
        </Alert>
      )}

      {/* Result Display */}
      {bulkResult && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Bulk operation completed: {bulkResult.successful_records} successful, {bulkResult.failed_records} failed.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => validateEntries()}
            disabled={processing}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Validate All
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={processing || totalEntries === 0}
          >
            {processing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {variant === 'payroll' ? 'Create Payroll Batch' : 
             variant === 'create' ? 'Create All Salaries' : 
             'Update All Salaries'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkSalaryForm;