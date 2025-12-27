import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DailyDelivery, OrderDeliveryInfo, CustomerDeliveryInfo } from "@/models/data/customer.model";
import { getDailyDeliveries, getCustomer } from "@/services/customer-service";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard, Calendar, ChevronLeft, ChevronRight, LayoutGrid, List, Table2, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import OrderReviewDialog from "@/components/feature-specific/deliveries/order-review-dialog";

export default function DailyDeliveriesPage() {
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  const { toast } = useToast();
  const [date, setDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [viewMode, setViewMode] = useState<"cards" | "table" | "list">("cards");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | undefined>();
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<"waiting" | "done">("waiting");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["daily-deliveries", companyId, date, page, limit, activeTab],
    queryFn: () => getDailyDeliveries(date, companyId, page, limit, activeTab),
    enabled: !!companyId,
  });

  if (isError) {
    toast({
      title: "Error",
      description: (error as Error)?.message || "Failed to load deliveries",
      variant: "destructive",
    });
  }

  const deliveryData: DailyDelivery | undefined = data?.data;

  // Reset to page 1 when date or activeTab changes
  useEffect(() => {
    setPage(1);
  }, [date, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none border-x"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      {deliveryData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{deliveryData.total_orders}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {deliveryData.unique_customers}
                </div>
                <div className="text-sm text-muted-foreground">Unique Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{deliveryData.date}</div>
                <div className="text-sm text-muted-foreground">Date</div>
              </div>
            </div>
            <div className="mt-4 text-lg font-semibold">
              {deliveryData.total_orders} orders reached {deliveryData.unique_customers}{" "}
              clients today
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliveries by Customer */}
      {isLoading ? (
        <div className="text-center py-8">Loading deliveries...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "waiting" | "done")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waiting" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Waiting</span>
            </TabsTrigger>
            <TabsTrigger value="done" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Done</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="waiting" className="space-y-4">
            {viewMode === "cards" && (
              <CardsView
                deliveries={deliveryData?.deliveries || []}
                expandedOrders={expandedOrders}
                setExpandedOrders={setExpandedOrders}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
            {viewMode === "table" && (
              <TableView
                deliveries={deliveryData?.deliveries || []}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
            {viewMode === "list" && (
              <ListView
                deliveries={deliveryData?.deliveries || []}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
          </TabsContent>
          <TabsContent value="done" className="space-y-4">
            {viewMode === "cards" && (
              <CardsView
                deliveries={deliveryData?.deliveries || []}
                expandedOrders={expandedOrders}
                setExpandedOrders={setExpandedOrders}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
            {viewMode === "table" && (
              <TableView
                deliveries={deliveryData?.deliveries || []}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
            {viewMode === "list" && (
              <ListView
                deliveries={deliveryData?.deliveries || []}
                onReview={(phone, orderId) => {
                  setSelectedCustomerPhone(phone);
                  setSelectedOrderId(orderId);
                  setReviewDialogOpen(true);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination */}
      {deliveryData?.pagination && deliveryData.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!deliveryData.pagination.has_prev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {deliveryData.pagination.page} of {deliveryData.pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!deliveryData.pagination.has_next || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {selectedCustomerPhone && selectedOrderId && (
        <OrderReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          customerPhone={selectedCustomerPhone}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}

// Cards View Component
function CardsView({
  deliveries,
  expandedOrders,
  setExpandedOrders,
  onReview,
}: {
  deliveries: CustomerDeliveryInfo[];
  expandedOrders: Set<number>;
  setExpandedOrders: (set: Set<number>) => void;
  onReview: (phone: string, orderId: number) => void;
}) {
  return (
    <div className="space-y-4">
      {deliveries.map((delivery, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {delivery.customer_name || delivery.customer_phone}
              </div>
              {delivery.orders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReview(delivery.customer_phone, delivery.orders[0].id);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Review
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Phone: {delivery.customer_phone}
              </div>
              <div className="text-sm font-semibold">
                Orders: {delivery.orders.length}
              </div>
              <div className="space-y-2">
                {delivery.orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <div
                      key={order.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex justify-between items-center p-3 bg-muted">
                        <div className="flex-1">
                          <div className="font-medium">Order #{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.delivered_at), "PPp")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold">{order.amount} DZD</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newExpanded = new Set(expandedOrders);
                              if (isExpanded) {
                                newExpanded.delete(order.id);
                              } else {
                                newExpanded.add(order.id);
                              }
                              setExpandedOrders(newExpanded);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {isExpanded && (
                        <OrderDetails
                          order={order}
                          customerPhone={delivery.customer_phone}
                          onRecordReview={onReview}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Table View Component
function TableView({
  deliveries,
  onReview,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery, idx) => {
              const totalAmount = delivery.orders.reduce(
                (sum, order) => sum + order.amount,
                0
              );
              return (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {delivery.customer_name || "-"}
                  </TableCell>
                  <TableCell>{delivery.customer_phone}</TableCell>
                  <TableCell>{delivery.orders.length}</TableCell>
                  <TableCell>{totalAmount} DZD</TableCell>
                  <TableCell>
                    {delivery.orders.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onReview(delivery.customer_phone, delivery.orders[0].id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// List View Component
function ListView({
  deliveries,
  onReview,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
}) {
  return (
    <div className="space-y-2">
      {deliveries.map((delivery, idx) => {
        const totalAmount = delivery.orders.reduce(
          (sum, order) => sum + order.amount,
          0
        );
        return (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">
                    {delivery.customer_name || delivery.customer_phone}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {delivery.customer_phone} • {delivery.orders.length} orders • {totalAmount} DZD
                  </div>
                </div>
                {delivery.orders.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onReview(delivery.customer_phone, delivery.orders[0].id);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OrderDetails({ 
  order, 
  customerPhone, 
  onRecordReview 
}: { 
  order: OrderDeliveryInfo; 
  customerPhone: string; 
  onRecordReview: (phone: string, orderId: number) => void;
}) {
  return (
    <div className="p-4 space-y-3 border-t bg-background">
      {/* Order Items */}
      {order.line_items && order.line_items.length > 0 && (
        <div>
          <div className="font-semibold mb-2">Items ({order.line_items.length})</div>
          <div className="space-y-1">
            {order.line_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.sku && <div className="text-muted-foreground text-xs">SKU: {item.sku}</div>}
                </div>
                <div className="text-right">
                  <div>{item.quantity} × {item.price} DZD</div>
                  <div className="text-muted-foreground text-xs">Total: {item.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {(order.shipping_address || order.shipping_city) && (
        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Shipping Address
          </div>
          <div className="text-sm text-muted-foreground">
            {order.shipping_address}
            {order.shipping_city && `, ${order.shipping_city}`}
          </div>
        </div>
      )}

      {/* Billing Address */}
      {(order.billing_address || order.billing_city) && (
        <div>
          <div className="font-semibold mb-1">Billing Address</div>
          <div className="text-sm text-muted-foreground">
            {order.billing_address}
            {order.billing_city && `, ${order.billing_city}`}
          </div>
        </div>
      )}

      {/* Payment Method */}
      {order.payment_method_title && (
        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Method
          </div>
          <div className="text-sm text-muted-foreground">{order.payment_method_title}</div>
        </div>
      )}

      {/* Order Date */}
      {order.date_created && (
        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Order Created
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(order.date_created), "PPp")}
          </div>
        </div>
      )}

      {/* Record Review Button */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            onRecordReview(customerPhone, order.id);
          }}
        >
          Record Review
        </Button>
      </div>
    </div>
  );
}

