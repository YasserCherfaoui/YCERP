import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { WooOrder } from "@/models/data/woo-order.model";
import {
  getFranchiseWooOrderShippingLabelUrl,
  updateFranchiseOrderStatus,
} from "@/services/franchise-service";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  Package,
  Phone,
  Printer,
  ShoppingCart,
  User,
} from "lucide-react";
import { useState } from "react";

interface Props {
  order: WooOrder | null;
  remainingCount: number;
  onAcknowledged: (orderId: number) => void;
}

export default function FranchisePendingOrderAlertDialog({
  order,
  remainingCount,
  onAcknowledged,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const open = !!order;
  const [labelLoading, setLabelLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (status: "packed" | "not_available") => {
      if (!order) throw new Error("No order selected");
      return updateFranchiseOrderStatus(order.id, status);
    },
    onSuccess: (_data, status) => {
      if (!order) return;
      toast({
        title: "Status updated",
        description: `Order #${order.number || order.id} marked as ${
          status === "packed" ? "Packed" : "Not available"
        }.`,
      });
      queryClient.invalidateQueries({ queryKey: ["franchise-woo-orders"] });
      onAcknowledged(order.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update status.",
        variant: "destructive",
      });
    },
  });

  const handlePrintLabel = async () => {
    if (!order) return;
    setLabelLoading(true);
    try {
      const response = await getFranchiseWooOrderShippingLabelUrl(order.id);
      const url = response.data?.signed_url;
      if (!url) {
        throw new Error("No download URL returned.");
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Could not open label",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch shipping label.",
        variant: "destructive",
      });
    } finally {
      setLabelLoading(false);
    }
  };

  const items = order?.confirmed_order_items ?? [];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
            "max-h-[90vh] overflow-hidden"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {order && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  New ship-from-store order #{order.number || order.id}
                </DialogTitle>
                <DialogDescription>
                  Update the franchise status to continue. This alert stays open
                  until the order is marked packed or not available.
                  {remainingCount > 1
                    ? ` (${remainingCount} pending orders)`
                    : null}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{order.order_status}</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">
                        Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="font-semibold">
                      {order.final_price || order.total} {order.currency || "DZD"}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">
                        Franchise status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Name</div>
                      <div className="font-medium">
                        {order.shipping_name || order.billing_name || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </div>
                      <div className="font-medium">
                        {order.customer_phone || "-"}
                        {order.customer_phone_2
                          ? ` / ${order.customer_phone_2}`
                          : ""}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Address
                      </div>
                      <div className="font-medium">
                        {[
                          order.shipping_address_1 || order.billing_address_1,
                          order.shipping_city || order.billing_city,
                          order.woo_shipping?.selected_commune,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </div>
                    </div>
                    {order.woo_shipping && (
                      <div>
                        <div className="text-muted-foreground">Delivery</div>
                        <div className="font-medium capitalize">
                          {order.woo_shipping.delivery_type || "-"}
                          {order.woo_shipping.shipping_provider
                            ? ` · ${order.woo_shipping.shipping_provider}`
                            : ""}
                        </div>
                      </div>
                    )}
                    {order.comments ? (
                      <div className="sm:col-span-2">
                        <div className="text-muted-foreground">Comments</div>
                        <div className="font-medium">{order.comments}</div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShoppingCart className="h-4 w-4" />
                      Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No confirmed line items.
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {items.map((item) => (
                          <li
                            key={item.ID}
                            className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                          >
                            <span>
                              {item.product?.name ||
                                `Product #${item.product_id}`}
                              {item.product_variant
                                ? ` — ${
                                    item.product_variant.qr_code ||
                                    item.product_variant.color ||
                                    `#${item.product_variant_id}`
                                  }`
                                : ""}
                            </span>
                            <Badge variant="outline">×{item.quantity}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  disabled={!order.has_shipping_label || labelLoading || mutation.isPending}
                  onClick={() => void handlePrintLabel()}
                >
                  {labelLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="mr-2 h-4 w-4" />
                  )}
                  Print label
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                  <Button
                    variant="destructive"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate("not_available")}
                  >
                    Not available
                  </Button>
                  <Button
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate("packed")}
                  >
                    Mark as packed
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
