import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SalaryCharge } from '@/models/data/charges/salary.model';
import { format } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    Award,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Edit,
    Eye,
    FileText,
    MapPin,
    MoreVertical,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import React from 'react';

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

export interface EmployeeSalaryCardProps {
  /** Salary charge data */
  salaryCharge: SalaryCharge;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Whether to show actions */
  showActions?: boolean;
  /** Whether the card is selected */
  selected?: boolean;
  /** Click handler for the card */
  onClick?: (salaryCharge: SalaryCharge) => void;
  /** Edit handler */
  onEdit?: (salaryCharge: SalaryCharge) => void;
  /** View handler */
  onView?: (salaryCharge: SalaryCharge) => void;
  /** Delete handler */
  onDelete?: (salaryCharge: SalaryCharge) => void;
  /** Approve handler */
  onApprove?: (salaryCharge: SalaryCharge) => void;
  /** Reject handler */
  onReject?: (salaryCharge: SalaryCharge) => void;
  /** Selection handler */
  onSelect?: (salaryCharge: SalaryCharge, selected: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'processed':
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'processed':
    case 'paid':
      return CheckCircle;
    case 'rejected':
    case 'cancelled':
      return XCircle;
    case 'pending':
    case 'draft':
      return AlertTriangle;
    case 'processing':
      return Activity;
    default:
      return FileText;
  }
};

const getEmploymentTypeColor = (type: string) => {
  switch (type) {
    case 'full_time':
      return 'bg-blue-100 text-blue-800';
    case 'part_time':
      return 'bg-green-100 text-green-800';
    case 'contract':
      return 'bg-purple-100 text-purple-800';
    case 'temporary':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatEmploymentType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const EmployeeSalaryCard: React.FC<EmployeeSalaryCardProps> = ({
  salaryCharge,
  variant = 'default',
  showActions = true,
  selected = false,
  onClick,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onReject,
  // onSelect,
  className,
}) => {
  const StatusIcon = getStatusIcon(salaryCharge.status);
  const deductionPercentage = salaryCharge.gross_amount > 0 
    ? (salaryCharge.total_deductions / salaryCharge.gross_amount) * 100 
    : 0;

  const handleCardClick = () => {
    if (onClick) {
      onClick(salaryCharge);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md w-full max-w-full overflow-hidden',
          selected && 'ring-2 ring-primary bg-primary/5',
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">{salaryCharge.employee_name}</h3>
                <p className="text-xs text-muted-foreground truncate">{salaryCharge.employee_position}</p>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm">{formatCurrency(salaryCharge.net_amount)}</p>
              <Badge variant="outline" className={cn('text-xs', getStatusColor(salaryCharge.status))}>
                <span className="truncate">{salaryCharge.status}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md w-full max-w-full overflow-hidden',
        selected && 'ring-2 ring-primary bg-primary/5',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{salaryCharge.employee_name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 text-sm">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{salaryCharge.employee_position}</span>
                {salaryCharge.employee_department && (
                  <>
                    <span className="flex-shrink-0">•</span>
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{salaryCharge.employee_department}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="outline" className={cn(getEmploymentTypeColor(salaryCharge.employment_type), "text-xs")}>
              {formatEmploymentType(salaryCharge.employment_type)}
            </Badge>
            
            <Badge variant="outline" className={cn(getStatusColor(salaryCharge.status), "text-xs")}>
              <StatusIcon className="h-3 w-3 mr-1" />
              <span className="truncate">{salaryCharge.status}</span>
            </Badge>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onView(salaryCharge))}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onEdit(salaryCharge))}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onApprove && salaryCharge.status === 'pending' && (
                    <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onApprove(salaryCharge))}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  {onReject && salaryCharge.status === 'pending' && (
                    <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onReject(salaryCharge))}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => handleActionClick(e, () => onDelete(salaryCharge))}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Salary Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 min-w-0 overflow-hidden">
            <p className="text-xs text-green-600 mb-1 truncate">Gross Amount</p>
            <p className="text-sm sm:text-lg font-bold text-green-700 truncate">
              {formatCurrency(salaryCharge.gross_amount)}
            </p>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200 min-w-0 overflow-hidden">
            <p className="text-xs text-blue-600 mb-1 truncate">Net Amount</p>
            <p className="text-sm sm:text-lg font-bold text-blue-700 truncate">
              {formatCurrency(salaryCharge.net_amount)}
            </p>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 min-w-0 overflow-hidden">
            <p className="text-xs text-purple-600 mb-1 truncate">Allowances</p>
            <p className="text-sm sm:text-lg font-bold text-purple-700 truncate">
              {formatCurrency(salaryCharge.total_allowances)}
            </p>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200 min-w-0 overflow-hidden">
            <p className="text-xs text-red-600 mb-1 truncate">Deductions</p>
            <p className="text-sm sm:text-lg font-bold text-red-700 truncate">
              {formatCurrency(salaryCharge.total_deductions)}
            </p>
          </div>
        </div>

        {/* Deduction Progress */}
        {salaryCharge.total_deductions > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deductions</span>
              <span className="font-medium">{deductionPercentage.toFixed(1)}% of gross</span>
            </div>
            <Progress value={deductionPercentage} className="h-2" />
          </div>
        )}

        {variant === 'detailed' && (
          <>
            <Separator />

            {/* Detailed Information */}
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center min-w-0">
                    <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Base Salary:</span>
                  </span>
                  <span className="font-medium ml-2">{formatCurrency(salaryCharge.base_salary)}</span>
                </div>
                
                {salaryCharge.overtime_amount && salaryCharge.overtime_amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center min-w-0">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Overtime ({salaryCharge.overtime_hours}h):</span>
                    </span>
                    <span className="font-medium ml-2">{formatCurrency(salaryCharge.overtime_amount)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center min-w-0">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Work Days:</span>
                  </span>
                  <span className="font-medium ml-2">{salaryCharge.work_days} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center min-w-0">
                    <CreditCard className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Payment Method:</span>
                  </span>
                  <span className="font-medium ml-2 capitalize truncate">
                    {salaryCharge.payment_method.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground truncate">Pay Period:</span>
                  <span className="font-medium ml-2 text-right">
                    {safeFormatDate(salaryCharge.pay_period_start, 'MMM dd')} - 
                    {safeFormatDate(salaryCharge.pay_period_end, 'MMM dd, yyyy')}
                  </span>
                </div>
                
                {salaryCharge.payment_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Payment Date:</span>
                    <span className="font-medium ml-2">
                      {safeFormatDate(salaryCharge.payment_date, 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                
                {salaryCharge.performance_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center min-w-0">
                      <Award className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Performance:</span>
                    </span>
                    <span className="font-medium ml-2">{salaryCharge.performance_rating}/10</span>
                  </div>
                )}
                
                {salaryCharge.absent_days && salaryCharge.absent_days > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Absent Days:</span>
                    <span className="font-medium ml-2 text-red-600">{salaryCharge.absent_days} days</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons for mobile */}
        {showActions && variant === 'detailed' && (
          <>
            <Separator />
            <div className="flex space-x-2 md:hidden">
              {onView && (
                <Button variant="outline" size="sm" onClick={(e) => handleActionClick(e, () => onView(salaryCharge))}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={(e) => handleActionClick(e, () => onEdit(salaryCharge))}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
              {onApprove && salaryCharge.status === 'pending' && (
                <Button variant="outline" size="sm" onClick={(e) => handleActionClick(e, () => onApprove(salaryCharge))}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              )}
            </div>
          </>
        )}

        {/* Footer with last updated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t gap-2">
          <span className="flex items-center min-w-0">
            <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">ID: {salaryCharge.ID}</span>
          </span>
          <span className="text-right truncate">
            Updated {safeFormatDate(salaryCharge.UpdatedAt, 'MMM dd, HH:mm')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeSalaryCard;