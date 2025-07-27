import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export const companyStatsColumns: ColumnDef<ProductSalesResponse>[] = [
  {
    header: "Product",
    accessorKey: "name",
    id: "name",
  },

  {
    header: "Variants",
    accessorKey: "variants",
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
                      <TableCell>{variant.total_delivered_woo_orders_yalidine}</TableCell>
                      <TableCell>{variant.total_delivered_woo_orders_my_companies}</TableCell>
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
    header: "Total Sold Warehouse",
    accessorKey: "total_sold_warehouse",
  },
  {
    header: "Total Sold Algiers",
    accessorKey: "total_sold_algiers",
  },
  {
    header: "Total Sold Quantity",
    accessorKey: "total_sold_quantity",
  },
  {
    header: "✅ Total Delivered Yalidine",
    accessorKey: "total_delivered_woo_orders_yalidine",
  },
  {
    header: "✅ Total Delivered My Companies",
    accessorKey: "total_delivered_woo_orders_my_companies",
  },
  {
    header: "✅ Total Delivered",
    cell: ({ row }) => {
      return row.original.total_delivered_woo_orders_yalidine + row.original.total_delivered_woo_orders_my_companies;
    },
  },
];
