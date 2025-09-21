import { Product } from "@/models/data/product.model";
import { ColumnDef } from "@tanstack/react-table";

export const franchiseProductsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    id:"name",
    header: "Name",
  },
  {
    accessorKey: "franchise_price",
    header: "Franchise Price",
    cell: ({ row }) => {
      const product = row.original;
      // Note: This will show the normal franchise price in the table
      // For VIP pricing, it would be better to show both or have conditional logic
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(product.franchise_price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "vip_franchise_price", 
    header: "VIP Price",
    cell: ({ row }) => {
      const product = row.original;
      const price = product.vip_franchise_price || 0;
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Sell Price",
  },
];
