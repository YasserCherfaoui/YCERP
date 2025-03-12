import { Button } from "@/components/ui/button";
import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import CompanySalesActionsDropdown from "./company-sales-actions-dropdown";

export const companySalesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "ID",
    id: "sale_id",
    header: "ID",
    cell: ({ row }) => <span>S-{row.original.ID}</span>,
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.CreatedAt).toUTCString(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.amount),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.discount),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.total),
  },
  {
    header: "Actions",
    cell: ({ row }) => <CompanySalesActionsDropdown sale={row.original} />,
  },
];
