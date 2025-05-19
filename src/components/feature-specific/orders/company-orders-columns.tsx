import OrderActions from "@/components/feature-specific/orders/order-actions";
import OrderLineItemsAccordion from "@/components/feature-specific/orders/order-line-items-accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import { ColumnDef } from "@tanstack/react-table";

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
      if (row.original.client_statuses.length === 0) {
        return (
          <div className="bg-gray-500 p-2 rounded-md text-white text-center">
            No status
          </div>
        );
      }
      const lastStatus =
        row.original.client_statuses[row.original.client_statuses.length - 1];
      return (
        <div
          className={cn(
            "p-2 rounded-md text-black text-center flex flex-col gap-2"
          )}
          style={{
            backgroundColor: lastStatus?.sub_qualification
              ? lastStatus?.sub_qualification?.color
              : lastStatus?.qualification?.color?.startsWith("#")
              ? lastStatus?.qualification?.color
              : "gray",
          }}
        >
          <span className="font-bold">{lastStatus?.qualification?.name}</span>
          <span>{lastStatus?.sub_qualification?.name}</span>
        </div>
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