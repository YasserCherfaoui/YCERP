// ChargeCard component for displaying individual charges
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Charge, ChargeStatus, ChargeType } from "@/models/data/charges/charge.model";
import { formatDistanceToNow } from "date-fns";
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Eye,
    FileText,
    MoreVertical,
    Paperclip,
    Tag,
    Trash2,
    User,
    XCircle,
} from "lucide-react";

interface ChargeCardProps {
  charge: Charge;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onEdit?: (charge: Charge) => void;
  onView?: (charge: Charge) => void;
  onDelete?: (charge: Charge) => void;
  onApprove?: (charge: Charge) => void;
  onReject?: (charge: Charge) => void;
  onSelect?: (charge: Charge, selected: boolean) => void;
  isSelected?: boolean;
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
};

const statusIcons: Record<ChargeStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  draft: <FileText className="h-3 w-3" />,
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

export default function ChargeCard({
  charge,
  variant = "default",
  showActions = true,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onReject,
  onSelect,
  isSelected = false,
  className,
}: ChargeCardProps) {
  const handleCardClick = () => {
    if (onView) {
      onView(charge);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(charge, e.target.checked);
    }
  };

  const canApprove = charge.status === "pending" && charge.approval_required;
  const canEdit = charge.status === "draft" || charge.status === "pending";
  const hasAttachments = charge.attachment_urls && charge.attachment_urls.length > 0;
  const hasTags = charge.tags && charge.tags.length > 0;

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-blue-500 bg-blue-50",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleSelect}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
              <div>
                <h4 className="font-medium text-sm line-clamp-1">{charge.title}</h4>
                <p className="text-xs text-gray-500">{chargeTypeLabels[charge.type]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs", statusColors[charge.status])}>
                {statusIcons[charge.status]}
                <span className="ml-1 capitalize">{charge.status}</span>
              </Badge>
              <span className="font-semibold text-sm">
                {formatCurrency(charge.amount, charge.currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelect}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg line-clamp-1">{charge.title}</h3>
                {charge.priority === "high" || charge.priority === "urgent" ? (
                  <AlertTriangle className={cn("h-4 w-4", priorityColors[charge.priority])} />
                ) : null}
              </div>
              
              {charge.reference_number && (
                <p className="text-sm text-gray-500 mb-1">#{charge.reference_number}</p>
              )}
              
              {charge.description && variant === "detailed" && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{charge.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>{chargeTypeLabels[charge.type]}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(charge.date), { addSuffix: true })}</span>
                </div>
                
                {charge.created_by && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{charge.created_by.full_name}</span>
                  </div>
                )}
                
                {hasAttachments && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3" />
                    <span>{charge.attachment_urls!.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", statusColors[charge.status])}>
              {statusIcons[charge.status]}
              <span className="ml-1 capitalize">{charge.status}</span>
            </Badge>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
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
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <span className="text-2xl font-bold">
              {formatCurrency(charge.amount, charge.currency)}
            </span>
            {charge.actual_amount && charge.actual_amount !== charge.amount && (
              <span className="text-sm text-gray-500">
                (Actual: {formatCurrency(charge.actual_amount, charge.currency)})
              </span>
            )}
          </div>
          
          {charge.priority && (
            <Badge
              variant="outline"
              className={cn("text-xs", priorityColors[charge.priority])}
            >
              {charge.priority.charAt(0).toUpperCase() + charge.priority.slice(1)} Priority
            </Badge>
          )}
        </div>
        
        {hasTags && variant === "detailed" && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {charge.tags!.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {charge.tags!.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{charge.tags!.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {charge.notes && variant === "detailed" && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 line-clamp-2">{charge.notes}</p>
          </div>
        )}
      </CardContent>
      
      {variant === "detailed" && charge.approval_required && charge.status === "pending" && (
        <CardFooter className="pt-0">
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Pending approval</span>
              <span>
                Submitted {formatDistanceToNow(new Date(charge.CreatedAt), { addSuffix: true })}
              </span>
            </div>
            
            {canApprove && (onApprove || onReject) && (
              <div className="flex space-x-2">
                {onApprove && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(charge);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                {onReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(charge);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}