import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WooOrder } from "@/models/data/woo-order.model";

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
                <li key={item.ID ?? idx} className="flex flex-col gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span>
                    (SKU: <b>{item.sku}</b>) - Qty: <b>{item.quantity}</b>, Price:{" "}
                    <b>{item.price}</b>, Total: <b>{item.total}</b>
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
