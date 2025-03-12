import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";

export const companySalesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "ID",
    id: "sale_id",
    header: "ID",
    cell: ({ row }) => <span>S-{row.original.ID}</span>,
  },
  {
    accessorKey: "CreatedAt",
    header: "Date",
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
];
