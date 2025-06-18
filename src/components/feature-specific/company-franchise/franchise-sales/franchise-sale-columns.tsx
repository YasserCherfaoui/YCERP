import FranchiseSalesActionsDropdown from "@/components/feature-specific/company-franchise/franchise-sales/franchise-sales-actions-dropdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const franchiseSalesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "ID",
    id: "sale_id",
    header: "ID",
    cell: ({ row }) => <div className="text-sm">S-{row.original.ID}</div>,
    filterFn: (row, _id, value) => {
      return row.original.ID.toString().toLowerCase().includes(value.toLowerCase());
    },
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
    header: "Status",
    cell: ({ row }) => {
      const data = row.original;
      const label = !!data.return
        ? !!data.return.exchange
          ? "Exchange"
          : "Return"
        : "Sale";
      const color = !!data.return
        ? !!data.return.exchange
          ? "red-500"
          : "blue-500"
        : "black";
      return (
        <Badge
          variant={!!data.return ? "default" : "outline"}
          className={`text-${color}`}
        >
          {label}
        </Badge>
      );
    },
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
                {row.original.sale_items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_variant?.qr_code}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    header: "Return Items",
    cell: ({ row }) => (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {row.original.return?.items?.length} Items
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
              </TableHeader>
              <TableBody>
                {row.original?.return?.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_variant?.qr_code}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{row.original.return?.total}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    header: "Exchange Items",
    cell: ({ row }) => (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {row.original.return?.exchange?.exchange_items?.length} Items
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
              </TableHeader>
              <TableBody>
                {row.original?.return?.exchange?.exchange_items.map(
                  (item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product_variant?.qr_code}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{row.original.return?.exchange?.total}</TableCell>
                </TableRow>
              </TableFooter>
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
    cell: ({ row }) => <FranchiseSalesActionsDropdown sale={row.original} />,
  },
];
