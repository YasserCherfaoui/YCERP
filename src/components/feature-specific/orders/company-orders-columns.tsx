import OrderActions from "@/components/feature-specific/orders/order-actions";
import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import OrderLineItemsAccordion from "@/components/feature-specific/orders/order-line-items-accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import { cities } from "@/utils/algeria-cities";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import ClientStatusDetailsDialog from "./client-status-details-dialog";
import { ConfirmedOrderItemsAccordion } from "./order-line-items-accordion";
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
    header: "Customer Phone",
    id: "phone",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <div
        className="text-center"
        style={{
          border:
            row.original.customer_phone_count &&
            row.original.customer_phone_count > 1
              ? "1px solid red"
              : "none",
          padding:
            row.original.customer_phone_count &&
            row.original.customer_phone_count > 1
              ? "6px"
              : "0px",
          borderRadius: "4px",
        }}
      >
        {row.original.customer_phone}{" "}
        {row.original.customer_phone_count &&
          row.original.customer_phone_count > 1 &&
          `(${row.original.customer_phone_count})`}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }: { row: { original: WooOrder } }) =>
      new Date(row.original.updated_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
  },
  {
    accessorKey: "client_statuses",
    header: "Client Status",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [open, setOpen] = useState(false);
      const [setStatusOpen, setSetStatusOpen] = useState(false);
      const statuses = row.original.client_statuses;
      const sortedStatuses = [...statuses].sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
      const lastStatus = sortedStatuses[0];
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
                    backgroundColor: lastStatus?.sub_qualification
                      ? lastStatus?.sub_qualification?.color
                      : lastStatus?.qualification?.color?.startsWith("#")
                      ? lastStatus?.qualification?.color
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
                  {lastStatus?.qualification?.name}
                </span>
                <span>{lastStatus?.sub_qualification?.name}</span>
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
    header: "Wilaya",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const wilaya = row.original.shipping_city;
      const wilayaName = cities.find((city) => city.key == wilaya)?.label;
      // if wilayaName is empty insert shipping_address_1
      if (!wilayaName) {
        return (
          <div className="text-center">{row.original.shipping_address_1}</div>
        );
      }
      return <div className="text-center">{wilayaName}</div>;
    },
  },
  {
    header: "Order History",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const [open, setOpen] = useState(false);
      const order = row.original;
      const statuses = order.yalidine_order_histories || [];
      const lastStatus = statuses[statuses.length - 1];
      const isHidden = ["unconfirmed", "packing", "dispatching"].includes(
        order.order_status || ""
      );

      if (isHidden) {
        return null;
      }

      return (
        <>
          <div
            className="flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-accent"
            onClick={() => setOpen(true)}
          >
            {statuses.length === 0 ? "No status" : <>{lastStatus.status}</>}
          </div>
          <OrderHistoryDialog order={order} open={open} setOpen={setOpen} />
        </>
      );
    },
  },
  {
    header: "Latest Status",
    cell: ({ row }: { row: { original: WooOrder } }) => {
      const order = row.original;
      const statuses = order.order_histories || [];
      const lastStatus = statuses[statuses.length - 1];

      return (
        <div className="flex flex-col justify-between items-center text-sm p-2 rounded bg-accent">
          <span>{!lastStatus && "No status"}</span>
          {lastStatus?.qualification && (
            <span
              style={{
                color: "black",
                backgroundColor: lastStatus.qualification.color || "gray",
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              {lastStatus.qualification.name}{" "}
              <span>{lastStatus.status && "(" + lastStatus.status + ")"}</span>
            </span>
          )}
          {lastStatus && (
            <span className="text-xs text-muted-foreground">
              {typeof lastStatus.date === "string"
                ? new Date(lastStatus.date).toLocaleString()
                : lastStatus.date.toLocaleString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "tracking_number",
    header: "Tracking Number",
    cell: ({ row }: { row: { original: WooOrder } }) => (
      <div className="text-center">
        {row.original.tracking_number?.toUpperCase()}
      </div>
    ),
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
      <OrderActions order={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
