import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

interface FranchiseMissingVariantsColumnsProps {
  onEdit?: (request: MissingVariantRequestResponse) => void;
  onCancel?: (request: MissingVariantRequestResponse) => void;
}

export const createFranchiseMissingVariantsColumns = ({
  onEdit,
  onCancel,
}: FranchiseMissingVariantsColumnsProps = {}): ColumnDef<MissingVariantRequestResponse>[] => [
  {
    accessorKey: "product_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "product_variant_color",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Color
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "product_variant_size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Size
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "requested_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const variant = status === "pending" ? "default" : 
                    status === "fulfilled" ? "secondary" : "destructive";
      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ getValue }) => {
      const comment = getValue() as string;
      return comment ? (
        <span className="max-w-[200px] truncate" title={comment}>
          {comment}
        </span>
      ) : (
        <span className="text-gray-400">No comment</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      const canEdit = request.status === "pending";
      
      return (
        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(request)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canEdit && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

// Default columns without actions
export const franchiseMissingVariantsColumns = createFranchiseMissingVariantsColumns();
