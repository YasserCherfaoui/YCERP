import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WooOrder } from "@/models/data/woo-order.model";
import CarrierTimeline from "@/components/feature-specific/orders/carrier-timeline";
import { carrierLabel } from "@/utils/shipping-provider";
import { CheckCircle, Clock, MapPin, MessageSquare, ShoppingCart, Truck, User } from "lucide-react";
import type { ReactNode } from "react";

const liquidGlass =
  "border border-white/40 bg-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]";

function formatDate(dateString: string | Date | undefined) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function Section({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl p-4", liquidGlass, className)}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function OrderDetailsContent({ order }: { order: WooOrder }) {
  const shipping = order.woo_shipping;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Customer" icon={<User className="size-4 text-sky-600 dark:text-sky-300" />}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">{order.shipping_name || order.billing_name || "—"}</Field>
            <Field label="Phone">{order.customer_phone || "—"}</Field>
            <Field label="Second phone">{order.customer_phone_2 || "—"}</Field>
            <Field label="Email">{order.customer_email || "—"}</Field>
            <Field label="Billing">{[order.billing_name, order.billing_address_1, order.billing_city].filter(Boolean).join(", ") || "—"}</Field>
            <Field label="Shipping address">{[order.shipping_address_1, order.shipping_city].filter(Boolean).join(", ") || "—"}</Field>
          </div>
        </Section>

        <Section title="Delivery" icon={<Truck className="size-4 text-emerald-600 dark:text-emerald-300" />}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Carrier">
              <Badge variant="outline">{shipping ? carrierLabel(shipping.shipping_provider) : "—"}</Badge>
            </Field>
            <Field label="Tracking"><span className="font-mono">{order.tracking_number || "—"}</span></Field>
            <Field label="Type">{shipping?.delivery_type || "—"}</Field>
            <Field label="Wilaya">{shipping?.wilaya_name || "—"}</Field>
            <Field label="Commune">{shipping?.commune_name || shipping?.selected_commune || "—"}</Field>
            <Field label="Center">{shipping?.selected_center || "—"}</Field>
            <Field label="First delivery cost">{shipping?.first_delivery_cost ?? "—"}</Field>
            <Field label="Second delivery cost">{shipping?.second_delivery_cost ?? "—"}</Field>
          </div>
        </Section>
      </div>

      <Section title="Order" icon={<MapPin className="size-4 text-violet-600 dark:text-violet-300" />}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Order ID">{order.id}</Field>
          <Field label="Woo ID">{order.woo_id || "—"}</Field>
          <Field label="Amount">{order.amount ?? "—"}</Field>
          <Field label="Discount">{order.discount || 0}</Field>
          <Field label="Payment">{order.payment_method_title || order.payment_method || "—"}</Field>
          <Field label="Exchange">{order.is_exchange ? "Yes" : "No"}</Field>
          <Field label="Created">{formatDate(order.date_created)}</Field>
          <Field label="Modified">{formatDate(order.date_modified)}</Field>
        </div>
        {order.comments && (
          <p className="mt-3 rounded-lg bg-white/50 px-3 py-2 text-sm dark:bg-white/5">{order.comments}</p>
        )}
      </Section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title={`Items (${order.line_items?.length || 0})`} icon={<ShoppingCart className="size-4 text-amber-600 dark:text-amber-300" />}>
          {(order.line_items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No items</p>
          ) : (
            <ul className="space-y-2">
              {order.line_items.map((item, idx) => (
                <li key={item.id ?? idx} className="flex items-start justify-between gap-3 rounded-lg bg-white/50 px-3 py-2 dark:bg-white/5">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">SKU {item.sku || "—"} · Qty {item.quantity}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{item.price}</div>
                    <div className="text-xs text-muted-foreground">{item.total}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={`Confirmed (${order.confirmed_order_items?.length || 0})`} icon={<CheckCircle className="size-4 text-emerald-600 dark:text-emerald-300" />}>
          {!order.confirmed_order_items?.length ? (
            <p className="text-sm text-muted-foreground">No confirmed items</p>
          ) : (
            <ul className="space-y-2">
              {order.confirmed_order_items.map((item, idx) => (
                <li key={item.ID ?? idx} className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50/80 px-3 py-2 dark:bg-emerald-500/10">
                  <div>
                    <div className="text-sm font-medium">{item.product?.name || "Unknown product"}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.product_variant?.color || "—"} · {item.product_variant?.size || "—"}
                    </div>
                  </div>
                  <Badge variant="secondary">Qty {item.quantity}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {!!order.client_statuses?.length && (
        <Section title={`Client notes (${order.client_statuses.length})`} icon={<MessageSquare className="size-4 text-sky-600 dark:text-sky-300" />}>
          <ul className="space-y-2">
            {order.client_statuses.map((status, idx) => (
              <li key={status.ID ?? idx} className="rounded-lg bg-white/50 px-3 py-2 dark:bg-white/5">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge style={{ backgroundColor: status.qualification?.color || "#6b7280" }} className="text-white">
                    {status.qualification?.name || "Unknown"}
                  </Badge>
                  {status.sub_qualification && <Badge variant="outline">{status.sub_qualification.name}</Badge>}
                </div>
                {status.comment && <p className="text-sm text-muted-foreground">{status.comment}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(status.date || "")}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!order.yalidine_order_histories?.length && (
        <Section
          title={`${carrierLabel(order.woo_shipping?.shipping_provider)} updates (${order.yalidine_order_histories.length})`}
          icon={<Truck className="size-4 text-rose-600 dark:text-rose-300" />}
        >
          <CarrierTimeline histories={order.yalidine_order_histories} provider={order.woo_shipping?.shipping_provider} />
        </Section>
      )}

      {!!order.order_histories?.length && (
        <Section title={`History (${order.order_histories.length})`} icon={<Clock className="size-4 text-fuchsia-600 dark:text-fuchsia-300" />}>
          <ul className="space-y-2">
            {order.order_histories.map((history, idx) => (
              <li key={history.ID ?? idx} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/50 px-3 py-2 dark:bg-white/5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{history.status}</Badge>
                  {history.qualification?.name && (
                    <Badge style={{ backgroundColor: history.qualification.color || "#6b7280" }} className="text-white">
                      {history.qualification.name}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(history.date)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
