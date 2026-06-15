import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/models/data/inventory.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Barcode from "react-barcode";

export const franchiseInventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product.name",
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
    accessorKey: "product_variant.color",
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
    accessorKey: "product_variant.size",
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "quantity",
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
    accessorKey: "broken_count",
    header: "Broken Count",
    cell: ({ getValue }: any) => {
      const count = getValue() || 0;
      return <span className={cn(count > 0 ? "text-orange-500 font-semibold" : "text-gray-500")}>{count}</span>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    id: "cost",
    cell: ({ getValue }: any) => {
      return <span className={cn(getValue() < 0 ? "text-red-500" : "text-green-500")}>{Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(getValue())}</span>;
    },
  },
  {
    accessorKey: "franchise_cost",
    header: "Franchise Cost",
    id: "franchise_cost",
    cell: ({ getValue }: any) => {
      return <span className={cn(getValue() < 0 ? "text-red-500" : "text-green-500")}>{Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(getValue())}</span>;
    },
  },
  {
    header: "QR Code",
    accessorKey: "product_variant.qr_code",
    cell: ({ getValue }: any) => <Barcode value={getValue()} height={20} />,
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <>
        <UpdateInventoryItemDialog inventoryItem={row.original} />
        <TransactionsLogDialog inventoryItemId={row.original.ID} />
      </>
    ),
  },
 ];
