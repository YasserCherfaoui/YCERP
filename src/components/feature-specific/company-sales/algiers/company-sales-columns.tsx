import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import CompanySalesActionsDropdown from "./company-sales-actions-dropdown";

export const companySalesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "ID",
    id: "sale_id",
    header: "ID",
    cell: ({ row }) => <span>S-{row.original.ID}</span>,
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.CreatedAt).toUTCString(),
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {row.original.sale_items.length} Items
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
              </TableHeader>
              <TableBody>
                {row.original.sale_items.map((item,index)=> <TableRow key={index}>
                    <TableCell>{item.product_variant?.qr_code}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.amount),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.discount),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.total),
  },
  {
    header: "Actions",
    cell: ({ row }) => <CompanySalesActionsDropdown sale={row.original} />,
  },
];
