import { RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useApproveSalaryCharge, usePendingSalaryCharges, useRejectSalaryCharge, useSalaryCharges } from '@/hooks/use-salary';
import { cn } from '@/lib/utils';
import { SalaryCharge } from '@/models/data/charges/salary.model';
import { format } from 'date-fns';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Filter,
    RefreshCw,
    Send,
    User,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

// Utility function to safely format dates
const safeFormatDate = (dateString: string | Date | null | undefined, formatString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatString);
  } catch (error) {
    return 'N/A';
  }
};

export interface SalaryApprovalInterfaceProps {
  /** Additional CSS classes */
  className?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending_approval':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'resubmitted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const SalaryApprovalInterface: React.FC<SalaryApprovalInterfaceProps> = ({
  className,
}) => {
  // Get company ID from Redux state
  const companyId = useSelector((state: RootState) => state.company?.company?.ID || state.user?.company?.ID);
  const approverId = useSelector((state: RootState) => state.user?.user?.ID);

  // Local state
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'pending',
  });
  const [selectedSalaryCharge, setSelectedSalaryCharge] = useState<SalaryCharge | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // React Query hooks
  const {
    data: pendingChargesResponse,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPendingCharges
  } = usePendingSalaryCharges({
    limit: 50,
    department: filters.department === 'all' ? undefined : filters.department,
    approver_id: approverId,
    company_id: companyId
  });

  const {
    data: approvedChargesResponse,
    refetch: refetchApprovedCharges
  } = useSalaryCharges({
    limit: 50,
    status: 'approved,rejected',
    department: filters.department === 'all' ? undefined : filters.department,
    company_id: companyId
  });

  // Mutations
  const approveSalaryChargeMutation = useApproveSalaryCharge();
  const rejectSalaryChargeMutation = useRejectSalaryCharge();

  // Extract data from responses
  const pendingCharges = pendingChargesResponse?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPendingCharges(),
        refetchApprovedCharges()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSalaryCharge) return;
    
    try {
      await approveSalaryChargeMutation.mutateAsync({
        id: selectedSalaryCharge.ID,
        notes: approvalNotes,
        companyId
      });
      setIsApproveDialogOpen(false);
      setApprovalNotes('');
      setSelectedSalaryCharge(null);
    } catch (error) {
      console.error('Failed to approve salary charge:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedSalaryCharge) return;
    
    try {
      await rejectSalaryChargeMutation.mutateAsync({
        id: selectedSalaryCharge.ID,
        reason: rejectionReason,
        companyId
      });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedSalaryCharge(null);
    } catch (error) {
      console.error('Failed to reject salary charge:', error);
    }
  };


  const filteredPendingApprovals = pendingCharges.filter(charge => {
    if (filters.department !== 'all' && charge.employee_department !== filters.department) {
      return false;
    }

    if (filters.status === 'approved' && charge.status !== 'approved') {
      return false;
    }

    if (filters.status === 'rejected' && charge.status !== 'rejected') {
      return false;
    }

    if (filters.status === 'pending' && charge.status !== 'pending') {
      return false;
    }

    return true;
  });



  const openActionDialog = (type: 'approve' | 'reject', salaryCharge: SalaryCharge) => {
    setSelectedSalaryCharge(salaryCharge);
    if (type === 'approve') {
      setIsApproveDialogOpen(true);
      setApprovalNotes('');
    } else {
      setIsRejectDialogOpen(true);
      setRejectionReason('');
    }
  };


  if (pendingLoading && pendingCharges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading approvals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingError) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {pendingError instanceof Error ? pendingError.message : 'Failed to load approval data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salary Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve pending salary charges.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees, positions, departments..."
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {/* Add department options here */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredPendingApprovals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
              <p className="text-muted-foreground">
                All salary charges have been reviewed or there are no submissions pending approval.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPendingApprovals.map(salaryCharge => (
            <Card key={salaryCharge.ID} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle className="text-lg">{salaryCharge.employee_name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{salaryCharge.employee_position}</span>
                        {salaryCharge.employee_department && (
                          <>
                            <span>•</span>
                            <span>{salaryCharge.employee_department}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(salaryCharge.status)}>
                      {salaryCharge.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Salary Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Gross Amount</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(salaryCharge.gross_amount)}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Net Amount</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(salaryCharge.net_amount)}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1">Allowances</p>
                    <p className="text-lg font-bold text-purple-700">
                      {formatCurrency(salaryCharge.total_allowances)}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 mb-1">Deductions</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(salaryCharge.total_deductions)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSalaryCharge(salaryCharge);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionDialog('reject', salaryCharge)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionDialog('approve', salaryCharge)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Dialogs */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Approve Salary Charge
            </DialogTitle>
          </DialogHeader>
          
          {selectedSalaryCharge && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedSalaryCharge.employee_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSalaryCharge.employee_position} • {formatCurrency(selectedSalaryCharge.gross_amount)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Approval Notes (Optional)</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approvalNotes.trim() === ''}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject Salary Charge
            </DialogTitle>
          </DialogHeader>
          
          {selectedSalaryCharge && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedSalaryCharge.employee_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSalaryCharge.employee_position} • {formatCurrency(selectedSalaryCharge.gross_amount)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Rejection Reason (Required)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejectionReason.trim() === ''}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Salary Charge Details</DialogTitle>
          </DialogHeader>
          
          {selectedSalaryCharge && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSalaryCharge.employee_name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{selectedSalaryCharge.employee_position}</span>
                  {selectedSalaryCharge.employee_department && (
                    <>
                      <span>•</span>
                      <span>{selectedSalaryCharge.employee_department}</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Gross Amount</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(selectedSalaryCharge.gross_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Net Amount</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(selectedSalaryCharge.net_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Allowances</p>
                    <p className="text-lg font-bold text-purple-700">
                      {formatCurrency(selectedSalaryCharge.total_allowances)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deductions</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(selectedSalaryCharge.total_deductions)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Submission Date</p>
                    <p className="text-sm text-muted-foreground">
                      {safeFormatDate(selectedSalaryCharge.CreatedAt, 'MM/dd/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Approval Date</p>
                    <p className="text-sm text-muted-foreground">
                      {safeFormatDate(selectedSalaryCharge.approved_at, 'MM/dd/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {safeFormatDate(selectedSalaryCharge.UpdatedAt, 'MM/dd/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedSalaryCharge.status)}>
                      {selectedSalaryCharge.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Created By</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSalaryCharge.created_by_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Approved By</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSalaryCharge.approved_by_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Approval Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSalaryCharge.approval_notes || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSalaryCharge.description || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryApprovalInterface;