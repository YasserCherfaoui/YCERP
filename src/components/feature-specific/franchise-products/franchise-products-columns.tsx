import { Product } from "@/models/data/product.model";
import { ColumnDef } from "@tanstack/react-table";

const nameColumn: ColumnDef<Product> = {
  accessorKey: "name",
  id: "name",
  header: "Name",
};

const normalFranchisePriceColumn: ColumnDef<Product> = {
  accessorKey: "franchise_price",
  id: "franchise_price",
  header: () => <div className="text-right">Franchise Price</div>,
  cell: ({ row }) => {
    const product = row.original;
    const formatted = new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(product.franchise_price ?? 0);
    return <div className="text-right font-medium">{formatted}</div>;
  },
};

const vipFranchisePriceColumn: ColumnDef<Product> = {
  accessorKey: "vip_franchise_price",
  id: "vip_franchise_price",
  header: () => <div className="text-right">VIP Franchise Price</div>,
  cell: ({ row }) => {
    const product = row.original;
    const formatted = new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(product.vip_franchise_price ?? 0);
    return <div className="text-right font-medium">{formatted}</div>;
  },
};

const sellPriceColumn: ColumnDef<Product> = {
  accessorKey: "price",
  id: "price",
  header: () => <div className="text-right">Sell Price</div>,
  cell: ({ row }) => {
    const product = row.original;
    const formatted = new Intl.NumberFormat("en-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(product.price ?? 0);
    return <div className="text-right font-medium">{formatted}</div>;
  },
};

export const franchiseProductsColumnsNormal: ColumnDef<Product>[] = [
  nameColumn,
  normalFranchisePriceColumn,
  sellPriceColumn,
];

export const franchiseProductsColumnsVIP: ColumnDef<Product>[] = [
  nameColumn,
  vipFranchisePriceColumn,
  sellPriceColumn,
];
