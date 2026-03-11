import { ColumnDef } from "@tanstack/react-table";
import { ShipFromStore } from "@/models/data/ship-from-store.model";

export const franchiseShipFromStoreColumns: ColumnDef<ShipFromStore>[] = [
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
    header: "Quantity",
  },
];
