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
import { ProductSupplierBillResponse } from "@/models/responses/company-stats.model";
import { ColumnDef } from "@tanstack/react-table";

export const companyPurchasesColumns: ColumnDef<ProductSupplierBillResponse>[] =
  [
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
                    <TableHead>Bill Quantity</TableHead>
                  </TableHeader>
                  <TableBody>
                    {row.original.variants.map((variant) => (
                      <TableRow key={variant.product_variant_id}>
                        <TableCell>{variant.color}</TableCell>
                        <TableCell>{variant.size}</TableCell>
                        <TableCell>{variant.bill_quantity}</TableCell>
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
      header: "Total Bill Quantity",
      accessorKey: "total_bill_quantity",
    },
  ];
