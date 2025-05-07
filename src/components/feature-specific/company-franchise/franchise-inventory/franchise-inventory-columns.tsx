import { RootState } from "@/app/store";
import TransactionsLogDialog from "@/components/feature-specific/company-warehouse/transactions-log-dialog";
import UpdateInventoryItemDialog from "@/components/feature-specific/company-warehouse/update-inventory-item-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryItem } from "@/models/data/inventory.model";
import { getFranchiseInventoryTransactionLogs } from "@/services/inventory-service";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Barcode from "react-barcode";
import { useSelector } from "react-redux";

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
    header: "Quantity"
  },
  {
    header: "QR Code",
    accessorKey: "product_variant.qr_code",
    cell: ({ getValue }: any) => <Barcode value={getValue()} height={20} />,
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const franchise = useSelector(
        (state: RootState) => state.franchise.franchise
      );
      const { data: logData } = useQuery({
        queryKey: ["inventory-log", franchise?.ID ?? 0],
        queryFn: () => getFranchiseInventoryTransactionLogs(franchise?.ID ?? 0),
        enabled: !!franchise,
      });
      return (
        <>
          <UpdateInventoryItemDialog inventoryItem={row.original} />
          <TransactionsLogDialog
            logs={
              logData?.data?.filter(
                (log) => log.inventory_item_id == row.original.ID
              ) ?? []
            }
          />
        </>
      );
    },
  },
 ];
