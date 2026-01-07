import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import { CreateReviewRequest } from "@/models/data/review.model";
import { createReview } from "@/services/review-service";
import { createReviewSchema } from "@/schemas/review";
import { getCustomer, updateCustomer } from "@/services/customer-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
  User,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface OrderReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  customerPhone: string;
}

export default function OrderReviewDialog({
  open,
  onOpenChange,
  orderId,
  customerPhone,
}: OrderReviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [followUpCallDate, setFollowUpCallDate] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  // Fetch order details
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["woo-order", orderId],
    queryFn: () => getWooCommerceOrder(orderId),
    enabled: open && !!orderId,
  });

  const order: WooOrder | undefined = orderData?.data;

  // Fetch customer data to get birthday
  const { data: customerData } = useQuery({
    queryKey: ["customer", customerPhone, companyId],
    queryFn: () => getCustomer(customerPhone, companyId),
    enabled: !!customerPhone && open,
  });

  // Pre-fill birthday when customer data is loaded
  useEffect(() => {
    if (customerData?.data?.customer?.birthday && open) {
      const customerBirthday = customerData.data.customer.birthday;
      if (customerBirthday) {
        const dateStr =
          typeof customerBirthday === "string"
            ? customerBirthday.split("T")[0]
            : new Date(customerBirthday).toISOString().split("T")[0];
        setBirthday(dateStr);
      }
    }
  }, [customerData, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setRating(5);
      setComment("");
      setFollowUpCallDate("");
      setBirthday("");
    }
  }, [open]);

  const createMut = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: async () => {
      // Update customer birthday if it was changed
      const currentBirthday = customerData?.data?.customer?.birthday;
      const currentBirthdayStr = currentBirthday
        ? typeof currentBirthday === "string"
          ? currentBirthday.split("T")[0]
          : new Date(currentBirthday).toISOString().split("T")[0]
        : null;

      if (birthday && birthday !== currentBirthdayStr) {
        try {
          await updateCustomer(
            customerPhone,
            { birthday: birthday || null },
            companyId
          );
        } catch (error) {
          console.error("Failed to update customer birthday:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["customer", customerPhone] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["woo-order", orderId] });
      toast({
        title: "Success",
        description: "Review created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!customerPhone) {
      toast({
        title: "Error",
        description: "Customer phone is required",
        variant: "destructive",
      });
      return;
    }

    const data: CreateReviewRequest = {
      customer_phone: customerPhone,
      woo_order_id: orderId || null,
      rating,
      comment,
      follow_up_call_date: followUpCallDate || null,
    };

    const validation = createReviewSchema.safeParse(data);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    createMut.mutate(data);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("delivered") || statusLower.includes("livre"))
      return "bg-green-100 text-green-800";
    if (statusLower.includes("shipped") || statusLower.includes("expedie"))
      return "bg-blue-100 text-blue-800";
    if (statusLower.includes("pending") || statusLower.includes("en attente"))
      return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("failed") || statusLower.includes("echouee"))
      return "bg-red-100 text-red-800";
    if (
      statusLower.includes("processing") ||
      statusLower.includes("preparation")
    )
      return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details & Review - #{order?.number || orderId}
          </DialogTitle>
          <DialogDescription>
            View order information and submit a customer review
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[calc(95vh-140px)] overflow-hidden">
          {/* Left Side - Order Details */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 border-r">
            {orderLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading order details...</div>
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Order Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Order Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className={getStatusColor(order.order_status)}
                        variant="secondary"
                      >
                        {order.order_status}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {order.final_price || order.total} {order.currency}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="font-mono">
                        {order.tracking_number || "N/A"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Created
                      </CardTitle>
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
                        <div className="text-muted-foreground">Payment Method</div>
                        <div className="font-medium">
                          {order.payment_method_title || order.payment_method || "-"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Modified</div>
                        <div className="text-muted-foreground">
                          {formatDate(order.date_modified)}
                        </div>
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
                          <div className="text-sm text-muted-foreground mb-1">
                            Customer ID
                          </div>
                          <Badge variant="outline">{order.customer_id}</Badge>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Email</div>
                          <div className="font-medium">
                            {order.customer_email || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Primary Phone
                          </div>
                          <div className="font-medium">{order.customer_phone}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Secondary Phone
                          </div>
                          <div className="font-medium">
                            {order.customer_phone_2 || "-"}
                          </div>
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
                        <div className="text-center text-muted-foreground py-4">
                          No items
                        </div>
                      ) : (
                        order.line_items.map((item, idx) => (
                          <div
                            key={item.id ?? idx}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.sku || "N/A"} • Qty: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.price}</div>
                              <div className="text-sm text-muted-foreground">
                                Total: {item.total}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Order not found</div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-border" />

          {/* Right Side - Review Form */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Record Review</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Customer Phone</Label>
                  <Input value={customerPhone} disabled />
                </div>
                {orderId && (
                  <div>
                    <Label>Order ID</Label>
                    <Input value={orderId} disabled />
                  </div>
                )}
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Comment</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Follow-up Call Date (Optional)</Label>
                  <Input
                    type="date"
                    value={followUpCallDate}
                    onChange={(e) => setFollowUpCallDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Customer Birthday (Optional)</Label>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMut.isPending || orderLoading}
          >
            {createMut.isPending ? "Saving..." : "Save Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




