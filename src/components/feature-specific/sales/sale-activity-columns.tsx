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
import { ReactNode } from "react";

export type SaleReturnRow = { sale: Sale | null; return: Return };
export type SaleExchangeRow = { sale: Sale | null; return: Return; exchange: Exchange };

export function mapReturnsToRows(returns: Return[] | undefined): SaleReturnRow[] {
  return (returns ?? [])
    .map((r) => ({ sale: r.sale ?? null, return: r }))
    .sort(
      (a, b) =>
        new Date(b.return.CreatedAt).getTime() -
        new Date(a.return.CreatedAt).getTime()
    );
}

export function mapExchangesToRows(
  exchanges: Exchange[] | undefined
): SaleExchangeRow[] {
  return (exchanges ?? [])
    .filter((e): e is Exchange & { return: Return } => !!e.return)
    .map((e) => ({
      sale: e.return.sale ?? null,
      return: e.return,
      exchange: e,
    }))
    .sort(
      (a, b) =>
        new Date(b.exchange.CreatedAt).getTime() -
        new Date(a.exchange.CreatedAt).getTime()
    );
}

export function createSaleReturnColumns(
  renderActions: (sale: Sale | null) => ReactNode
): ColumnDef<SaleReturnRow>[] {
  return [
    {
      accessorKey: "sale.ID",
      id: "sale_id",
      header: "Sale ID",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.sale ? `S-${row.original.sale.ID}` : "—"}
        </div>
      ),
      filterFn: (row, _id, value) =>
        (row.original.sale?.ID.toString() ?? "")
          .toLowerCase()
          .includes(value.toLowerCase()),
    },
    {
      id: "return_date",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center hover:opacity-80"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Return Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      accessorFn: (row) => row.return.CreatedAt,
      cell: ({ row }) =>
        new Date(row.original.return.CreatedAt).toLocaleString(),
    },
    {
      accessorKey: "return.type",
      header: "Type",
      cell: ({ row }) => row.original.return.type || "—",
    },
    {
      accessorKey: "return.reason",
      header: "Reason",
      cell: ({ row }) => row.original.return.reason || "—",
    },
    {
      header: "Items",
      cell: ({ row }) => (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              {row.original.return.items?.length ?? 0} Items
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                </TableHeader>
                <TableBody>
                  {(row.original.return.items ?? []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.product_variant?.qr_code ?? "—"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell>{row.original.return.total}</TableCell>
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
        }).format(row.original.return.total ?? 0),
    },
    {
      header: "Actions",
      cell: ({ row }) => renderActions(row.original.sale),
    },
  ];
}

export function createSaleExchangeColumns(
  renderActions: (sale: Sale | null) => ReactNode
): ColumnDef<SaleExchangeRow>[] {
  return [
    {
      accessorKey: "sale.ID",
      id: "sale_id",
      header: "Sale ID",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.sale ? `S-${row.original.sale.ID}` : "—"}
        </div>
      ),
      filterFn: (row, _id, value) =>
        (row.original.sale?.ID.toString() ?? "")
          .toLowerCase()
          .includes(value.toLowerCase()),
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
      cell: ({ row }) =>
        new Date(row.original.exchange.CreatedAt).toLocaleString(),
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
                  {(row.original.exchange.exchange_items ?? []).map(
                    (item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.product_variant?.qr_code ?? "—"}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    )
                  )}
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
      cell: ({ row }) => renderActions(row.original.sale),
    },
  ];
}
