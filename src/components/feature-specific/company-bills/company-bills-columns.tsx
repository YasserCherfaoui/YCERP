import RemoveBillActionDialog from "@/components/feature-specific/company-bills/remove-bill-action-dialog";
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import CompanyBillDialog from "./company-bill-dialog";


export const companyBillColumns: ColumnDef<ExitBill>[] = [
  {
    id: "bill_number",
    header: () => <div>Bill Number</div>,
    cell: ({ row }) => {
      return <div>EXB-{row.original.ID}</div>;
    },
  },
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
    accessorKey: "franchise.name",
    id:"franchise_name",
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
    accessorKey: "cogs",
    header: () => <div className="text-right">Benifits (DZD)</div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("cogs"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },
  {
    accessorKey: "franchise_total_amount",
    header: () => <div className="text-right">Franchise Total</div>,
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
    accessorKey: "company_total_amount",
    header: () => <div className="text-right">Company Total</div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("company_total_amount"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },
  {
    header:  ({ column }) => {
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
    cell: ({row})=> new Date(row.original.CreatedAt).toUTCString()
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
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <CompanyBillDialog bill={exitBill} />
            {/* <UpdateBillActionDialog bill={exitBill} /> */}
            <RemoveBillActionDialog bill={exitBill} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
