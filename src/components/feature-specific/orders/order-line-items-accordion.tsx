import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConfirmedOrderItem, WooOrder } from "@/models/data/woo-order.model";

function OrderLineItemsAccordion({
  lineItems,
}: {
  lineItems: WooOrder["line_items"];
  orderNumber: string;
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="line-items">
        <AccordionTrigger>
          {lineItems?.length || 0} item{lineItems?.length === 1 ? "" : "s"}
        </AccordionTrigger>
        <AccordionContent>
          {!lineItems || lineItems.length === 0 ? (
            <div className="text-muted-foreground">No items</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {lineItems.map((item, idx) => (
                <li key={item.id ?? idx} className="flex flex-col gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span>
                    (SKU: <b>{item.sku}</b>) - Qty: <b>{item.quantity}</b>, Price:{" "}
                    <b>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "DZD",
                      }).format(item.price)}
                    </b>
                    , Total:{" "}
                    <b>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "DZD",
                      }).format(Number(item.total) ?? 0)}
                    </b>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default OrderLineItemsAccordion;

// New: ConfirmedOrderItemsAccordion
export function ConfirmedOrderItemsAccordion({
  confirmedOrderItems,
}: {
  confirmedOrderItems: ConfirmedOrderItem[];
  orderNumber: string;
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="confirmed-order-items">
        <AccordionTrigger>
          {confirmedOrderItems?.length || 0} confirmed item{confirmedOrderItems?.length === 1 ? "" : "s"}
        </AccordionTrigger>
        <AccordionContent>
          {!confirmedOrderItems || confirmedOrderItems.length === 0 ? (
            <div className="text-muted-foreground">No confirmed items</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {confirmedOrderItems.map((item, idx) => (
                <li key={item.id ?? idx} className="flex flex-col gap-2">
                  <span className="font-medium">
                    {item.product?.name || "Unnamed Product"}
                    {item.product_variant ? (
                      <span className="ml-2 text-xs text-gray-500">
                        (Variant: {item.product_variant.color}, Size: {item.product_variant.size})
                      </span>
                    ) : null}
                  </span>
                  <span>
                    Qty: <b>{item.quantity}</b>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
