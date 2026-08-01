import { ColumnDef } from "@tanstack/react-table";
import { WooLineItemGroup } from "@/services/woocommerce-service";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const wooLineItemsSummaryColumns: ColumnDef<WooLineItemGroup>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        SKU
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const sku = getValue() as string;
      return sku || "—";
    },
  },
  {
    accessorKey: "total_quantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const qty = getValue() as number;
      return qty?.toLocaleString() ?? 0;
    },
  },
  {
    accessorKey: "orders_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Orders
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const count = getValue() as number;
      return count?.toLocaleString() ?? 0;
    },
  },
];
