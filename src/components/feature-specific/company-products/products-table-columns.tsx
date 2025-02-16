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
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Product } from "../../../models/data/product.model";

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "first_price",
    header: () => <div className="text-right">First Price</div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("first_price"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },
  {
    accessorKey: "franchise_price",
    header: () => <div className="text-right">Franchise Price</div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("franchise_price"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right"> Price </div>,
    cell: ({ row }) => {
      const price = parseInt(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(price);

      return <div className="text-right font-medium"> {formatted} </div>;
    },
  },
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

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
                navigator.clipboard.writeText(product.ID.toString())
              }
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View product details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
