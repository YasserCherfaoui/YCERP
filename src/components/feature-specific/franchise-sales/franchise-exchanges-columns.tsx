import FranchiseSalesActionsDropdown from "@/components/feature-specific/franchise-sales/franchise-sales-actions-dropdown";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Exchange } from "@/models/data/exchange.model";
import { Return } from "@/models/data/return.model";
import { Sale } from "@/models/data/sale.model";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type SaleExchangeRow = { sale: Sale; return: Return; exchange: Exchange };

export const franchiseExchangesColumns: ColumnDef<SaleExchangeRow>[] = [
  {
    accessorKey: "sale.ID",
    id: "sale_id",
    header: "Sale ID",
    cell: ({ row }) => <div className="text-sm">S-{row.original.sale.ID}</div>,
    filterFn: (row, _id, value) =>
      row.original.sale.ID.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    id: "exchange_date",
    header: ({ column }) => (
      <button
        type="button"
        className="flex items-center hover:opacity-80"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Exchange Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    ),
    accessorFn: (row) => row.exchange.CreatedAt,
    cell: ({ row }) => new Date(row.original.exchange.CreatedAt).toLocaleString(),
  },
  {
    accessorKey: "exchange.type",
    header: "Type",
    cell: ({ row }) => row.original.exchange.type || "—",
  },
  {
    accessorKey: "exchange.reason",
    header: "Reason",
    cell: ({ row }) => row.original.exchange.reason || "—",
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {row.original.exchange.exchange_items?.length ?? 0} Items
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
              </TableHeader>
              <TableBody>
                {(row.original.exchange.exchange_items ?? []).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_variant?.qr_code ?? "—"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{row.original.exchange.total}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(row.original.exchange.total ?? 0),
  },
  {
    header: "Actions",
    cell: ({ row }) => <FranchiseSalesActionsDropdown sale={row.original.sale} />,
  },
];
