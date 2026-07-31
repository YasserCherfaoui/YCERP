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
import { ProductSupplierBillResponse } from "@/models/responses/company-stats.model";
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

export const companyPurchasesColumns: ColumnDef<ProductSupplierBillResponse>[] =
  [
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
      header: ({ column }) => (
        <SortHeader label="Total Bill Quantity" column={column} />
      ),
      accessorKey: "total_bill_quantity",
      id: "total_bill_quantity",
    },
  ];
