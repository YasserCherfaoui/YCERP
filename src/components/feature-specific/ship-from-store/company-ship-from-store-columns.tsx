import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ShipFromStore } from "@/models/data/ship-from-store.model";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function createCompanyShipFromStoreColumns(
  onEdit: (record: ShipFromStore) => void,
  onDelete: (record: ShipFromStore) => void
): ColumnDef<ShipFromStore>[] {
  return [
    {
      accessorKey: "CreatedAt",
      header: "Date",
      cell: ({ row }) => {
        const v = row.original.CreatedAt;
        return v ? new Date(v).toLocaleString() : "—";
      },
    },
    {
      accessorKey: "tracking_number",
      header: "Tracking number",
    },
    {
      id: "franchise",
      header: "Franchise",
      cell: ({ row }) => row.original.franchise?.name ?? "—",
    },
    {
      id: "variant",
      header: "Variant",
      cell: ({ row }) => {
        const pv = row.original.product_variant;
        if (!pv) return "—";
        const name = pv.product?.name;
        return pv.qr_code ? (name ? `${pv.qr_code} (${name})` : pv.qr_code) : name ?? "—";
      },
    },
    {
      accessorKey: "quantity",
      header: "Qty",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(record)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(record)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
