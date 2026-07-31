import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductSalesResponse } from "@/models/responses/company-stats.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

function SortHeader({
  label,
  column,
}: {
  label: string;
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      className="-ml-4 h-8"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

export const companyStatsColumns: ColumnDef<ProductSalesResponse>[] = [
  {
    header: ({ column }) => <SortHeader label="Product" column={column} />,
    accessorKey: "name",
    id: "name",
  },
  {
    header: "Variants",
    accessorKey: "variants",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <Accordion type="single" collapsible>
          <AccordionItem value={row.original.product_id.toString()}>
            <AccordionTrigger>{row.original.name}</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Sold Warehouse</TableHead>
                  <TableHead>Sold Algiers</TableHead>
                  <TableHead>Sold Quantity</TableHead>
                  <TableHead>Delivered Yalidine</TableHead>
                  <TableHead>Delivered My Companies</TableHead>
                </TableHeader>
                <TableBody>
                  {row.original.variants.map((variant) => (
                    <TableRow key={variant.product_variant_id}>
                      <TableCell>{variant.color}</TableCell>
                      <TableCell>{variant.size}</TableCell>
                      <TableCell>{variant.sold_warehouse}</TableCell>
                      <TableCell>{variant.sold_algiers}</TableCell>
                      <TableCell>{variant.sold_quantity}</TableCell>
                      <TableCell>
                        {variant.total_delivered_woo_orders_yalidine}
                      </TableCell>
                      <TableCell>
                        {variant.total_delivered_woo_orders_my_companies}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
  {
    header: ({ column }) => (
      <SortHeader label="Total Sold Warehouse" column={column} />
    ),
    accessorKey: "total_sold_warehouse",
    id: "total_sold_warehouse",
  },
  {
    header: ({ column }) => (
      <SortHeader label="Total Sold Algiers" column={column} />
    ),
    accessorKey: "total_sold_algiers",
    id: "total_sold_algiers",
  },
  {
    header: ({ column }) => (
      <SortHeader label="Total Sold Quantity" column={column} />
    ),
    accessorKey: "total_sold_quantity",
    id: "total_sold_quantity",
  },
  {
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered Yalidine" column={column} />
    ),
    accessorKey: "total_delivered_woo_orders_yalidine",
    id: "total_delivered_woo_orders_yalidine",
  },
  {
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered My Companies" column={column} />
    ),
    accessorKey: "total_delivered_woo_orders_my_companies",
    id: "total_delivered_woo_orders_my_companies",
  },
  {
    id: "total_delivered",
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered" column={column} />
    ),
    accessorFn: (row) =>
      row.total_delivered_woo_orders_yalidine +
      row.total_delivered_woo_orders_my_companies,
    cell: ({ row }) =>
      row.original.total_delivered_woo_orders_yalidine +
      row.original.total_delivered_woo_orders_my_companies,
  },
];
