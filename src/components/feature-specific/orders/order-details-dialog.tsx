import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { WooOrder } from "@/models/data/woo-order.model";

interface OrderDetailsDialogProps {
  order: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function OrderDetailsDialog({ order, open, setOpen }: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details (#{order.number})</DialogTitle>
          <DialogDescription>All information for this WooCommerce order.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Order Info */}
          <section>
            <h3 className="font-semibold mb-2">Order Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {order.id}</div>
              <div><strong>Woo ID:</strong> {order.woo_id}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div><strong>Total:</strong> {order.total} {order.currency}</div>
              <div><strong>Order Key:</strong> {order.order_key}</div>
              <div><strong>Date Created:</strong> {order.date_created}</div>
              <div><strong>Date Modified:</strong> {order.date_modified}</div>
              <div><strong>Payment Method:</strong> {order.payment_method_title} ({order.payment_method})</div>
              <div><strong>Taken By:</strong> {order.taken_by?.full_name || "-"}</div>
              <div><strong>Taken At:</strong> {order.taken_at || "-"}</div>
            </div>
          </section>
          <Separator />
          {/* Customer Info */}
          <section>
            <h3 className="font-semibold mb-2">Customer Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Customer ID:</strong> {order.customer_id}</div>
              <div><strong>Customer Email:</strong> {order.customer_email}</div>
              <div><strong>Customer Phone:</strong> {order.customer_phone}</div>
            </div>
          </section>
          <Separator />
          {/* Billing Info */}
          <section>
            <h3 className="font-semibold mb-2">Billing Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Name:</strong> {order.billing_name}</div>
              <div><strong>Address:</strong> {order.billing_address_1}, {order.billing_city}</div>
            </div>
          </section>
          <Separator />
          {/* Shipping Info */}
          <section>
            <h3 className="font-semibold mb-2">Shipping Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Name:</strong> {order.shipping_name}</div>
              <div><strong>Address:</strong> {order.shipping_address_1}, {order.shipping_city}</div>
            </div>
          </section>
          <Separator />
          {/* Line Items */}
          <section>
            <h3 className="font-semibold mb-2">Line Items</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {(order.line_items ?? []).length === 0 && <li>No items</li>}
              {(order.line_items ?? []).map((item, idx) => (
                <li key={item.ID ?? idx}>
                  <span className="font-medium">{item.name}</span> (SKU: {item.sku}) - Qty: {item.quantity}, Price: {item.price}, Total: {item.total}
                </li>
              ))}
            </ul>
          </section>
          <Separator />
          {/* Shipping Lines */}
          <section>
            <h3 className="font-semibold mb-2">Shipping Lines</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {(order.shipping_lines ?? []).length === 0 && <li>No shipping lines</li>}
              {(order.shipping_lines ?? []).map((line, idx) => (
                <li key={line.ID ?? idx}>
                  {line.method_title} (ID: {line.method_id}) - Total: {line.total}
                </li>
              ))}
            </ul>
          </section>
          <Separator />
          {/* Meta Data */}
          <section>
            <h3 className="font-semibold mb-2">Meta Data</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {(order.meta_data ?? []).length === 0 && <li>No meta data</li>}
              {(order.meta_data ?? []).map((meta, idx) => (
                <li key={meta.ID ?? idx}>
                  <span className="font-medium">{meta.key}</span>: {meta.value}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
} 