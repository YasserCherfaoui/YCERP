import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import { Button } from "@/components/ui/button";
import { MissingVariantRequestResponse } from "@/models/data/missing-variant.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Trash2 } from "lucide-react";

interface CompanyMissingVariantsColumnsProps {
  onCancel?: (request: MissingVariantRequestResponse) => void;
}

export const createCompanyMissingVariantsColumns = ({
  onCancel,
}: CompanyMissingVariantsColumnsProps = {}): ColumnDef<MissingVariantRequestResponse>[] => [
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
    accessorKey: "franchise_inventory_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Franchise stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qty = row.original.franchise_inventory_quantity ?? 0;
      const itemId = row.original.franchise_inventory_item_id;
      if (!itemId) {
        return <span className="text-muted-foreground">{qty}</span>;
      }
      return (
        <TransactionsLogDialog
          inventoryItemId={itemId}
          trigger={
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {qty}
            </button>
          }
        />
      );
    },
  },
  {
    accessorKey: "franchise_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Franchise
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "franchise_administrator_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Requested By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
      const canCancel = request.status === "pending";

      return (
        <div className="flex items-center gap-2">
          {canCancel && onCancel && (
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
export const companyMissingVariantsColumns = createCompanyMissingVariantsColumns();
