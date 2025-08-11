import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { FetchChargesParams } from '@/models/requests/create-product-request';
import { ChargeExportData } from '@/models/responses/charge-response.model';
import { exportCharges } from '@/services/charges-service';
import { format } from 'date-fns';
import { Download, FileText, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

export interface ChargeExportProps {
  /** Current filters applied to charges table */
  filters?: FetchChargesParams;
  /** Selected charge IDs (if exporting only selected charges) */
  selectedChargeIds?: number[];
  /** Whether to show the component as a button trigger or inline */
  variant?: 'button' | 'inline';
  /** Custom button text for trigger */
  buttonText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired when export starts */
  onExportStart?: () => void;
  /** Callback fired when export completes */
  onExportComplete?: (data: ChargeExportData) => void;
  /** Callback fired when export fails */
  onExportError?: (error: string) => void;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeAttachments: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
  chargeTypes?: string[];
  statusFilter?: string[];
}

const formatOptions = [
  { value: 'excel', label: 'Excel (.xlsx)', description: 'Best for data analysis and manipulation' },
  { value: 'csv', label: 'CSV (.csv)', description: 'Compatible with most spreadsheet applications' },
  { value: 'pdf', label: 'PDF (.pdf)', description: 'Professional formatted report for printing' },
  { value: 'json', label: 'JSON (.json)', description: 'Raw data format for developers' },
] as const;

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processing', label: 'Processing' },
] as const;

const chargeTypeOptions = [
  { value: 'exchange_rate', label: 'Exchange Rate' },
  { value: 'salary', label: 'Employee Salary' },
  { value: 'boxing', label: 'Boxing Products' },
  { value: 'shipping', label: 'Shipping Fees' },
  { value: 'returns', label: 'Return Fees' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'rent_utility', label: 'Rent & Utilities' },
  { value: 'other', label: 'Other' },
] as const;

export const ChargeExport: React.FC<ChargeExportProps> = ({
  filters = {},
  selectedChargeIds = [],
  variant = 'button',
  buttonText = 'Export Charges',
  className,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeAttachments: false,
    chargeTypes: [],
    statusFilter: [],
  });

  const handleExport = async () => {
    if (!exportOptions.format) {
      toast({
        title: 'Export Error',
        description: 'Please select an export format.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    onExportStart?.();

    try {
      // Prepare export parameters
      const exportParams: FetchChargesParams & {
        format: 'pdf' | 'excel' | 'csv' | 'json';
        include_attachments?: boolean;
      } = {
        ...filters,
        format: exportOptions.format,
        include_attachments: exportOptions.includeAttachments,
      };

      // Apply additional filters
      if (exportOptions.dateRange?.from) {
        exportParams.date_from = exportOptions.dateRange.from;
      }
      if (exportOptions.dateRange?.to) {
        exportParams.date_to = exportOptions.dateRange.to;
      }
      if (exportOptions.chargeTypes && exportOptions.chargeTypes.length > 0) {
        exportParams.type = exportOptions.chargeTypes.join(',');
      }
      if (exportOptions.statusFilter && exportOptions.statusFilter.length > 0) {
        exportParams.status = exportOptions.statusFilter.join(',');
      }

      // If specific charges are selected, we might need to handle this differently
      // For now, we'll use the existing filters approach
      if (selectedChargeIds.length > 0) {
        // Note: This might need backend support for selected IDs
        console.log('Selected charge IDs:', selectedChargeIds);
      }

      const response = await exportCharges(exportParams);

      if (response.success && response.data) {
        // Trigger download
        const link = document.createElement('a');
        link.href = response.data.file_url;
        link.download = `charges_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.${
          exportOptions.format === 'excel' ? 'xlsx' : exportOptions.format
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Successful',
          description: `${response.data.records_count} charges exported successfully.`,
        });

        onExportComplete?.(response.data);
        setIsOpen(false);
      } else {
        throw new Error(response.message || 'Export failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: 'Export Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      onExportError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({
      ...prev,
      format: format as 'pdf' | 'excel' | 'csv' | 'json',
    }));
  };

  const handleIncludeAttachmentsChange = (checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      includeAttachments: checked,
    }));
  };

  const handleChargeTypeToggle = (type: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      chargeTypes: checked
        ? [...(prev.chargeTypes || []), type]
        : (prev.chargeTypes || []).filter(t => t !== type),
    }));
  };

  const handleStatusToggle = (status: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      statusFilter: checked
        ? [...(prev.statusFilter || []), status]
        : (prev.statusFilter || []).filter(s => s !== status),
    }));
  };

  const ExportContent = () => (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Export Format</Label>
        <Select value={exportOptions.format} onValueChange={handleFormatChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select export format" />
          </SelectTrigger>
          <SelectContent>
            {formatOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Filter Options */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Filter Options</Label>
        
        {/* Charge Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Charge Types</CardTitle>
            <CardDescription className="text-xs">
              Select specific charge types to export (leave empty for all)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {chargeTypeOptions.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={exportOptions.chargeTypes?.includes(type.value) || false}
                  onCheckedChange={(checked) => 
                    handleChargeTypeToggle(type.value, checked as boolean)
                  }
                />
                <Label htmlFor={`type-${type.value}`} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Status Filter</CardTitle>
            <CardDescription className="text-xs">
              Select specific statuses to export (leave empty for all)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={exportOptions.statusFilter?.includes(status.value) || false}
                  onCheckedChange={(checked) => 
                    handleStatusToggle(status.value, checked as boolean)
                  }
                />
                <Label htmlFor={`status-${status.value}`} className="text-sm font-normal">
                  {status.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Additional Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Additional Options</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-attachments"
            checked={exportOptions.includeAttachments}
            onCheckedChange={handleIncludeAttachmentsChange}
          />
          <Label htmlFor="include-attachments" className="text-sm font-normal">
            Include attachments and receipts
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: Including attachments may significantly increase export file size and processing time.
        </p>
      </div>

      {/* Export Summary */}
      {(selectedChargeIds.length > 0 || Object.keys(filters).length > 0) && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm">
              <div className="font-medium mb-2">Export Summary:</div>
              {selectedChargeIds.length > 0 && (
                <div className="text-muted-foreground">
                  • Exporting {selectedChargeIds.length} selected charges
                </div>
              )}
              {filters.type && (
                <div className="text-muted-foreground">
                  • Filtered by type: {filters.type}
                </div>
              )}
              {filters.status && (
                <div className="text-muted-foreground">
                  • Filtered by status: {filters.status}
                </div>
              )}
              {filters.date_from && (
                <div className="text-muted-foreground">
                  • Date range: {filters.date_from} to {filters.date_to || 'now'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Charges
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Charges</span>
          </CardTitle>
          <CardDescription>
            Export charge data in your preferred format with custom filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportContent />
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Charges</span>
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and download charge data in your preferred format.
          </DialogDescription>
        </DialogHeader>
        <ExportContent />
      </DialogContent>
    </Dialog>
  );
};

export default ChargeExport;