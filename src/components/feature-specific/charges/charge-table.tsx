// ChargeTable component for displaying charges in a data table
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Charge, ChargeStatus, ChargeType } from "@/models/data/charges/charge.model";
import { format } from "date-fns";
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Eye,
    FileText,
    MoreVertical,
    Paperclip,
    Trash2,
    XCircle,
} from "lucide-react";

interface ChargeTableProps {
  charges: Charge[];
  loading?: boolean;
  onRowClick?: (charge: Charge) => void;
  onEdit?: (charge: Charge) => void;
  onView?: (charge: Charge) => void;
  onDelete?: (charge: Charge) => void;
  onApprove?: (charge: Charge) => void;
  onReject?: (charge: Charge) => void;
  onMarkPaid?: (charge: Charge) => void;
  
  // Selection
  selectedCharges?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  onSelectAll?: (selected: boolean) => void;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  
  // Display options
  showActions?: boolean;
  showSelection?: boolean;
  compact?: boolean;
  className?: string;
}

const chargeTypeLabels: Record<ChargeType, string> = {
  exchange_rate: "Exchange Rate",
  salary: "Salary",
  boxing: "Boxing",
  shipping: "Shipping",
  returns: "Returns",
  other: "Other",
  advertising: "Advertising",
  rent_utility: "Rent & Utilities",
};

const statusColors: Record<ChargeStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  paid: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusIcons: Record<ChargeStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  draft: <FileText className="h-3 w-3" />,
  paid: <DollarSign className="h-3 w-3" />,
};

const priorityColors: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface SortableHeaderProps {
  field: string;
  children: React.ReactNode;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  className?: string;
}

function SortableHeader({ field, children, sortBy, sortOrder, onSort, className }: SortableHeaderProps) {
  const isSorted = sortBy === field;
  
  return (
    <TableHead className={className}>
      {onSort ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-semibold text-left justify-start"
          onClick={() => onSort(field)}
        >
          {children}
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDown className="ml-2 h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ) : (
        children
      )}
    </TableHead>
  );
}

export default function ChargeTable({
  charges,
  loading = false,
  onRowClick,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onReject,
  onMarkPaid,
  selectedCharges = [],
  onSelectionChange,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
  showActions = true,
  showSelection = false,
  compact = false,
  className,
}: ChargeTableProps) {
  const isAllSelected = charges.length > 0 && selectedCharges.length === charges.length;
  const isSomeSelected = selectedCharges.length > 0 && selectedCharges.length < charges.length;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    } else if (onSelectionChange) {
      onSelectionChange(checked ? charges.map(c => c.ID) : []);
    }
  };

  const handleSelectCharge = (chargeId: number, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedCharges, chargeId]);
      } else {
        onSelectionChange(selectedCharges.filter(id => id !== chargeId));
      }
    }
  };

  const handleRowClick = (charge: Charge, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="menuitem"]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(charge);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (charges.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No charges found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters to find charges.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected || isSomeSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""}
                />
              </TableHead>
            )}
            
            <SortableHeader
              field="title"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
              className="min-w-[200px]"
            >
              Title
            </SortableHeader>
            
            <SortableHeader
              field="type"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            >
              Type
            </SortableHeader>
            
            <SortableHeader
              field="amount"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
              className="text-right"
            >
              Amount
            </SortableHeader>
            
            <SortableHeader
              field="status"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            >
              Status
            </SortableHeader>
            
            {!compact && (
              <SortableHeader
                field="priority"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Priority
              </SortableHeader>
            )}
            
            <SortableHeader
              field="date"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            >
              Date
            </SortableHeader>
            
            {!compact && (
              <TableHead>Created By</TableHead>
            )}
            
            <TableHead className="w-12"></TableHead>
            
            {showActions && (
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {charges.map((charge) => {
            const isSelected = selectedCharges.includes(charge.ID);
            const canApprove = charge.status === "pending" && charge.approval_required;
            const canEdit = charge.status === "draft" || charge.status === "pending";
            const hasAttachments = charge.attachment_urls && charge.attachment_urls.length > 0;
            
            return (
              <TableRow
                key={charge.ID}
                className={cn(
                  "cursor-pointer hover:bg-gray-50",
                  isSelected && "bg-blue-50"
                )}
                onClick={(e) => handleRowClick(charge, e)}
              >
                {showSelection && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectCharge(charge.ID, checked as boolean)}
                      aria-label={`Select charge ${charge.title}`}
                    />
                  </TableCell>
                )}
                
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="line-clamp-1">{charge.title}</span>
                      {charge.priority === "high" || charge.priority === "urgent" ? (
                        <AlertTriangle className={cn("h-4 w-4", priorityColors[charge.priority])} />
                      ) : null}
                      {hasAttachments && (
                        <Paperclip className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    {charge.reference_number && (
                      <div className="text-xs text-gray-500">#{charge.reference_number}</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {chargeTypeLabels[charge.type]}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right font-medium">
                  <div className="space-y-1">
                    <div>{formatCurrency(charge.amount, charge.currency)}</div>
                    {charge.actual_amount && charge.actual_amount !== charge.amount && (
                      <div className="text-xs text-gray-500">
                        Actual: {formatCurrency(charge.actual_amount, charge.currency)}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={cn("text-xs", statusColors[charge.status])}>
                    {statusIcons[charge.status]}
                    <span className="ml-1 capitalize">{charge.status}</span>
                  </Badge>
                </TableCell>
                
                {!compact && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", priorityColors[charge.priority])}
                    >
                      {charge.priority.charAt(0).toUpperCase() + charge.priority.slice(1)}
                    </Badge>
                  </TableCell>
                )}
                
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(charge.date), 'MMM dd, yyyy')}
                </TableCell>
                
                {!compact && (
                  <TableCell className="text-sm text-gray-500">
                    {charge.created_by?.full_name || 'Unknown'}
                  </TableCell>
                )}
                
                <TableCell>
                  {charge.tags && charge.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">{charge.tags.length}</span>
                    </div>
                  )}
                </TableCell>
                
                {showActions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(charge)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        
                        {canEdit && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(charge)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        
                        {canApprove && (
                          <>
                            <DropdownMenuSeparator />
                            {onApprove && (
                              <DropdownMenuItem onClick={() => onApprove(charge)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {onReject && (
                              <DropdownMenuItem onClick={() => onReject(charge)}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        
                        {charge.status === "approved" && onMarkPaid && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onMarkPaid(charge)}>
                              <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
                              Mark as Paid
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {onDelete && charge.status === "draft" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(charge)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}