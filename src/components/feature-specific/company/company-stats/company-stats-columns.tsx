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
import { FranchiseSoldCell, totalDelivered } from "./franchise-sold-dialog";

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
                      <TableHead>Sold Franchises</TableHead>
                      <TableHead>Delivered Yalidine</TableHead>
                      <TableHead>Delivered My Companies</TableHead>
                      <TableHead>Delivered NOEST</TableHead>
                      <TableHead>Total Delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.product_variant_id}>
                        <TableCell className="font-medium">{variant.color}</TableCell>
                        <TableCell>{variant.size}</TableCell>
                        <TableCell>
                          <FranchiseSoldCell
                            total={variant.sold_franchises || 0}
                            breakdown={variant.franchise_sales}
                            title={`${row.original.name} · ${variant.color} ${variant.size}`}
                          />
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {(variant.total_delivered_woo_orders_yalidine || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {(variant.total_delivered_woo_orders_my_companies || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {(variant.total_delivered_woo_orders_noest || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold">
                          {totalDelivered(variant).toLocaleString()}
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
      <SortHeader label="Total Sold Franchises" column={column} />
    ),
    accessorKey: "total_sold_franchises",
    id: "total_sold_franchises",
    cell: ({ row }) => (
      <FranchiseSoldCell
        total={row.original.total_sold_franchises || 0}
        breakdown={row.original.franchise_sales}
        title={row.original.name}
      />
    ),
  },
  {
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered Yalidine" column={column} />
    ),
    accessorKey: "total_delivered_woo_orders_yalidine",
    id: "total_delivered_woo_orders_yalidine",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.original.total_delivered_woo_orders_yalidine || 0).toLocaleString()}
      </span>
    ),
  },
  {
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered My Companies" column={column} />
    ),
    accessorKey: "total_delivered_woo_orders_my_companies",
    id: "total_delivered_woo_orders_my_companies",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.original.total_delivered_woo_orders_my_companies || 0).toLocaleString()}
      </span>
    ),
  },
  {
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered NOEST" column={column} />
    ),
    accessorKey: "total_delivered_woo_orders_noest",
    id: "total_delivered_woo_orders_noest",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.original.total_delivered_woo_orders_noest || 0).toLocaleString()}
      </span>
    ),
  },
  {
    id: "total_delivered",
    header: ({ column }) => (
      <SortHeader label="✅ Total Delivered" column={column} />
    ),
    accessorFn: (row) => totalDelivered(row),
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold">
        {totalDelivered(row.original).toLocaleString()}
      </span>
    ),
  },
];
