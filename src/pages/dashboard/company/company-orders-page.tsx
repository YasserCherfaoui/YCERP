import OrderActions from "@/components/feature-specific/orders/order-actions";
import OrderLineItemsAccordion from "@/components/feature-specific/orders/order-line-items-accordion";
import { DataTable } from "@/components/ui/data-table";
import { WooOrder } from "@/models/data/woo-order.model";
import { getWooCommerceOrders } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<WooOrder>[] = [
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
  { accessorKey: "customer_phone", header: "Customer Phone" },
  {
    accessorKey: "date_created",
    header: "Date Created",
    cell: ({ row }: { row: { original: WooOrder } }) => new Date(row.original.date_created).toLocaleDateString(),
  },
  {
    accessorKey: "taken_by.full_name",
    header: "Taken By",
    cell: ({ row }: { row: { original: WooOrder } }) => row.original.taken_by?.full_name || "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: WooOrder } }) => <OrderActions order={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];


export default function CompanyOrdersPage() {
  // Mock data for demonstration
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getWooCommerceOrders(),
  });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">WooCommerce Orders</h1>
      <DataTable
        columns={columns}
        data={orders?.data || []}
        searchColumn="number"
      />
    </div>
  );
}
