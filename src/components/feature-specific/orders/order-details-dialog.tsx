import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WooOrder } from "@/models/data/woo-order.model";
import { getYalidineCenter } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Info,
  MapPin,
  MessageSquare,
  Package,
  ShoppingCart,
  Truck,
  User
} from "lucide-react";
import { useState } from "react";

interface OrderDetailsDialogProps {
  order: WooOrder;
  open: boolean;
  setOpen: (open: boolean) => void;
  ordersQueryKey?: any[];
}

export default function OrderDetailsDialog({
  order,
  open,
  setOpen,
}: OrderDetailsDialogProps) {
  const { data: center } = useQuery({
    queryKey: ["yalidine-center", order.woo_shipping?.selected_center],
    queryFn: () => getYalidineCenter(order.woo_shipping?.selected_center ?? ""),
    enabled: false,
  });
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('livre')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('shipped') || statusLower.includes('expedie')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('pending') || statusLower.includes('en attente')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('failed') || statusLower.includes('echouee')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('processing') || statusLower.includes('preparation')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details #{order.number || order.id}
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for this WooCommerce order
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(order.order_status)} variant="secondary">
                  {order.order_status}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {order.final_price || order.total} {order.currency}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="font-mono">
                  {order.tracking_number || "N/A"}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {formatDate(order.date_created)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Order ID</div>
                  <div className="font-medium">{order.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Woo ID</div>
                  <div className="font-medium">{order.woo_id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Status</div>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">{order.amount}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Discount</div>
                  <div className="font-medium">{order.discount || 0}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Exchange</div>
                  <Badge variant={order.is_exchange ? "default" : "secondary"}>
                    {order.is_exchange ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Payment Method</div>
                  <div className="font-medium">{order.payment_method_title || order.payment_method || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Order Key</div>
                  <div className="font-mono text-xs">{order.order_key || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Modified</div>
                  <div className="text-muted-foreground">{formatDate(order.date_modified)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Customer ID</div>
                    <Badge variant="outline">{order.customer_id}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div className="font-medium">{order.customer_email || "-"}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Primary Phone</div>
                    <div className="font-medium">{order.customer_phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Secondary Phone</div>
                    <div className="font-medium">{order.customer_phone_2 || "-"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.billing_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.billing_address_1}, {order.billing_city}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.shipping_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.shipping_address_1}, {order.shipping_city}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Details */}
          {order.woo_shipping && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <Badge variant="outline">{order.woo_shipping.shipping_provider}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Type</div>
                    <Badge variant="outline">{order.woo_shipping.delivery_type}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Wilaya</div>
                    <div className="font-medium">{order.woo_shipping.wilaya_name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Commune</div>
                    <div className="font-medium">{order.woo_shipping.commune_name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">First Delivery</div>
                    <div className="font-medium">{order.woo_shipping.first_delivery_cost}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Second Delivery</div>
                    <div className="font-medium">{order.woo_shipping.second_delivery_cost}</div>
                  </div>
                </div>
                {center?.data?.data?.[0]?.name && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Selected Center</div>
                    <div className="font-medium">{center.data.data[0].name}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Items ({order.line_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(order.line_items ?? []).length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No items</div>
                ) : (
                  order.line_items.map((item, idx) => (
                    <div key={item.id ?? idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.sku || "N/A"} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.price}</div>
                        <div className="text-sm text-muted-foreground">Total: {item.total}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Confirmed Order Items */}
          {order.confirmed_order_items && order.confirmed_order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirmed Items ({order.confirmed_order_items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                                     {order.confirmed_order_items.map((item, idx) => (
                     <div key={item.ID ?? idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                       <div className="flex-1">
                         <div className="font-medium text-black">{item.product?.name || "Unknown Product"}</div>
                         <div className="text-sm text-gray-700">
                           Color: {item.product_variant?.color || "N/A"} • Size: {item.product_variant?.size || "N/A"}
                         </div>
                       </div>
                       <div className="text-right">
                         <Badge variant="secondary">Qty: {item.quantity}</Badge>
                       </div>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Statuses */}
          {order.client_statuses && order.client_statuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Client Statuses ({order.client_statuses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.client_statuses.map((status, idx) => (
                    <div key={status.ID ?? idx} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          style={{ backgroundColor: status.qualification?.color || '#6b7280' }}
                          className="text-white"
                        >
                          {status.qualification?.name || "Unknown"}
                        </Badge>
                        {status.sub_qualification && (
                          <Badge variant="outline">
                            {status.sub_qualification.name}
                          </Badge>
                        )}
                      </div>
                      {status.comment && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {status.comment}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(status.date || "")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Yalidine Order Histories */}
          {order.yalidine_order_histories && order.yalidine_order_histories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Updates ({order.yalidine_order_histories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.yalidine_order_histories.map((history, idx) => (
                    <div key={history.ID ?? idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(history.status)}>
                          {history.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(history.date)}
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><span className="font-medium">Center:</span> {history.center_name}</div>
                        <div><span className="font-medium">Location:</span> {history.commune_name}, {history.wilaya_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Histories */}
          {order.order_histories && order.order_histories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order History ({order.order_histories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_histories.map((history, idx) => (
                    <div key={history.ID ?? idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{history.status}</Badge>
                          {history.qualification?.name && (
                            <Badge 
                              style={{ backgroundColor: history.qualification.color || '#6b7280' }}
                              className="text-white"
                            >
                              {history.qualification.name}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(history.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          {order.comments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg">
                  {order.comments}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setOrderHistoryOpen(true)}>
            Order History
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
        
        <OrderHistoryDialog order={order} open={orderHistoryOpen} setOpen={setOrderHistoryOpen} />
      </DialogContent>
    </Dialog>
  );
}
