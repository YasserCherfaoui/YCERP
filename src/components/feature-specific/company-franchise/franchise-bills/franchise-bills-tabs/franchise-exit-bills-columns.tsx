import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExitBill } from "@/models/data/bill.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Clipboard, MoreHorizontal } from "lucide-react";
import FranchiseEntryBillsForm from "./franchise-entry-bills-form";
import FranchiseExitBillDialog from "./franchise-exit-bill-dialog";

export const franchiseExitBillsColumns: ColumnDef<ExitBill>[] = [
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
    accessorKey: "ID",
    id: "bill_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bill ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => `EXB-${row.original.ID}`,
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "CreatedAt",
    cell: ({ row }) => new Date(row.original.CreatedAt).toUTCString(),
  },
  {
    accessorKey: "status",
    id: "status",
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
    cell: ({ row }) => row.original.entry_bill == null ? <Badge variant={'destructive'}>Pending</Badge> : <Badge variant={'secondary'}>Acquired</Badge>,
  },
  {
    accessorKey: "franchise_total_amount",
    header: () => <div className="text-right">Total (DZD)</div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("franchise_total_amount"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const exitBill = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(exitBill.ID.toString())
              }
            >
              <Clipboard />
              Copy Bill ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <FranchiseExitBillDialog bill={exitBill} />
            <FranchiseEntryBillsForm bill={exitBill} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
