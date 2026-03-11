import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VariantDepositResponse } from "@/models/data/variant-deposit.model";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, ShoppingCart, Trash2 } from "lucide-react";

interface FranchiseVariantDepositsColumnsProps {
  onFulfill?: (deposit: VariantDepositResponse) => void;
  onCancel?: (deposit: VariantDepositResponse) => void;
}

export const createFranchiseVariantDepositsColumns = ({
  onFulfill,
  onCancel,
}: FranchiseVariantDepositsColumnsProps = {}): ColumnDef<VariantDepositResponse>[] => [
  {
    accessorKey: "customer_phone",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer phone
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Product",
  },
  {
    accessorKey: "product_variant_color",
    header: "Color",
  },
  {
    accessorKey: "product_variant_size",
    header: "Size",
  },
  {
    accessorKey: "amount_paid",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount paid
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return v != null ? `${v.toLocaleString()}` : "—";
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const variant =
        status === "pending"
          ? "default"
          : status === "fulfilled"
            ? "secondary"
            : "destructive";
      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return date ? format(new Date(date), "MMM dd, yyyy") : "—";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const deposit = row.original;
      const isPending = deposit.status === "pending";
      const canFulfill =
        isPending && deposit.in_franchise_inventory === true && onFulfill;

      return (
        <div className="flex items-center gap-2">
          {canFulfill && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onFulfill(deposit)}
              title="Create sale from this deposit"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Create sale
            </Button>
          )}
          {isPending && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(deposit)}
              title="Cancel deposit"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
