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
    header: "First Price",
  },
  {
    accessorKey: "price",
    header: "Sell Price",
  },
];
