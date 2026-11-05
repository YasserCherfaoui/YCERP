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
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      header: "Variants",
      accessorKey: "variants",
      enableSorting: false,
      cell: ({ row }) => {
        const variants = row.original.variants || [];
        if (variants.length === 0) {
          return <span className="text-xs text-muted-foreground">No variants</span>;
        }
        return (
          <Accordion type="single" collapsible>
            <AccordionItem
              value={row.original.product_id.toString()}
              className="border-none"
            >
              <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                {variants.length} variant{variants.length === 1 ? "" : "s"}
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg border bg-background/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Bill Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.product_variant_id}>
                          <TableCell className="font-medium">{variant.color}</TableCell>
                          <TableCell>{variant.size}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {(variant.bill_quantity || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">
          {(row.original.total_bill_quantity || 0).toLocaleString()}
        </span>
      ),
    },
  ];
