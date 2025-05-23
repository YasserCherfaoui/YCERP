import OrderActions from "@/components/feature-specific/orders/order-actions";
import OrderLineItemsAccordion from "@/components/feature-specific/orders/order-line-items-accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import ClientStatusDetailsDialog from "./client-status-details-dialog";
export const companyOrdersColumns: ColumnDef<WooOrder, { id: number }>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(Number(row.original.total)),
  },
  {
    id: "line_items",
    header: "Line Items",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <OrderLineItemsAccordion
        lineItems={row.original.line_items}
        orderNumber={row.original.number}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "customer_phone", header: "Customer Phone", id: "phone" },
  {
    accessorKey: "date_created",
    header: "Date Created",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Date(row.original.date_created).toLocaleDateString(),
  },
  {
    accessorKey: "client_statuses",
    header: "Client Status",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [open, setOpen] = useState(false);
      const [setStatusOpen, setSetStatusOpen] = useState(false);
      const statuses = row.original.client_statuses;
      return (
        <>
          <div
            className={cn(
              "cursor-pointer",
              statuses.length === 0
                ? "bg-gray-500 p-2 rounded-md text-white text-center"
                : "p-2 rounded-md text-black text-center flex flex-col gap-2"
            )}
            style={
              statuses.length > 0
                ? {
                    backgroundColor: statuses[statuses.length - 1]?.sub_qualification
                      ? statuses[statuses.length - 1]?.sub_qualification?.color
                      : statuses[statuses.length - 1]?.qualification?.color?.startsWith("#")
                      ? statuses[statuses.length - 1]?.qualification?.color
                      : "gray",
                  }
                : {}
            }
            onClick={() => setOpen(true)}
          >
            {statuses.length === 0 ? (
              "No status"
            ) : (
              <>
                <span className="font-bold">
                  {statuses[statuses.length - 1]?.qualification?.name}
                </span>
                <span>{statuses[statuses.length - 1]?.sub_qualification?.name}</span>
              </>
            )}
          </div>
          <ClientStatusDetailsDialog
            open={open}
            onClose={() => setOpen(false)}
            statuses={statuses}
            onSetStatus={() => {
              setOpen(false);
              setSetStatusOpen(true);
            }}
            setStatusOpen={setStatusOpen}
            setSetStatusOpen={setSetStatusOpen}
            orderID={row.original.id}
          />
        </>
      );
    },
  },
  {
    accessorKey: "taken_by.full_name",
    header: "Taken By",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            {row.original.taken_by?.full_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.taken_by?.full_name || "-"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <OrderActions order={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 