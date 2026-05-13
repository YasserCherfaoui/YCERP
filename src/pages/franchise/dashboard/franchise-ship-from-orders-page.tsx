import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WooOrder } from "@/models/data/woo-order.model";
import { listFranchiseWooOrders } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";

export default function FranchiseShipFromOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["franchise-woo-orders"],
    queryFn: listFranchiseWooOrders,
  });
  const orders: WooOrder[] = data?.data ?? [];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Orders shipping from my store</h1>
      {isLoading ? (
        <p>Loading orders...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>From wilaya</TableHead>
              <TableHead>Tracking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">{order.order_status}</Badge>
                </TableCell>
                <TableCell>{order.billing_name}</TableCell>
                <TableCell>{order.woo_shipping?.from_wilaya_name ?? "-"}</TableCell>
                <TableCell>{order.tracking_number ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
