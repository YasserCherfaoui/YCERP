import DeliveryOrdersActions from "@/components/feature-specific/delivery/delivery-orders-actions";
import { ConfirmedOrderItemsAccordion } from "@/components/feature-specific/orders/order-line-items-accordion";
import { WooOrder } from "@/models/data/woo-order.model";
import { ColumnDef } from "@tanstack/react-table";

export const deliveryOrdersColumns: ColumnDef<WooOrder, { id: number }>[] = [
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
    id: "confirmed_order_items",
    header: "Confirmed Items",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <ConfirmedOrderItemsAccordion
        confirmedOrderItems={row.original.confirmed_order_items || []}
        orderNumber={row.original.number}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customer_phone",
    header: "Customer Phone",
    id: "customer_phone",
  },
  {
    accessorKey: "date_created",
    header: "Date Created",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Date(row.original.date_created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
  },
  {
    header: "Commune",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const communeName = row.original.woo_shipping?.commune_name;
      return <div className="text-center">{communeName}</div>;
    },
  },
  {
    header: "Price",
    accessorKey: "final_price",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Intl.NumberFormat("en-DZ", {
        style: "currency",
        currency: "DZD",
      }).format(Number(row.original.final_price)),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <DeliveryOrdersActions order={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
