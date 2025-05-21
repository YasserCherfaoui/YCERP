import { DeliveryEmployee } from "@/models/data/delivery.model";
import { ColumnDef } from "@tanstack/react-table";

export const deliveryEmployeeColumns: ColumnDef<DeliveryEmployee>[] = [
  {
    header: "ID",
    accessorKey: "ID",
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Created",
    accessorKey: "CreatedAt",
    cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleDateString(),
  },
]; 