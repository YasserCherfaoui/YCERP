import CustomerOrderHistoryDrawer from "@/components/feature-specific/deliveries/customer-order-history-drawer";
import OrderReviewDialog from "@/components/feature-specific/deliveries/order-review-dialog";
import DeclareExchangeDialog from "@/components/feature-specific/orders/declare-exchange-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CustomerDeliveryInfo, DailyDelivery, OrderDeliveryInfo } from "@/models/data/customer.model";
import { getDailyDeliveries } from "@/services/customer-service";
import { createIssueTicket } from "@/services/issue-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, CreditCard, History, LayoutGrid, List, MapPin, MessageSquare, Package, RefreshCw, Table2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  
  // Order history drawer state
  const [orderHistoryDrawerOpen, setOrderHistoryDrawerOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<{
    phone: string;
    name?: string;
  } | null>(null);
  
  // Exchange dialog state
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<number | undefined>();
  const { data: orderForExchange } = useQuery({
    queryKey: ["woo-order-for-exchange", selectedOrderForExchange],
    queryFn: () => selectedOrderForExchange ? getWooCommerceOrder(selectedOrderForExchange) : null,
    enabled: !!selectedOrderForExchange && exchangeDialogOpen,
  });
  
  // Issue ticket confirmation dialog state
  const [issueTicketDialogOpen, setIssueTicketDialogOpen] = useState(false);
  const [pendingIssueTicket, setPendingIssueTicket] = useState<{
    order: OrderDeliveryInfo;
    customerPhone: string;
    customerName?: string;
  } | null>(null);
  const [issueTicketComment, setIssueTicketComment] = useState<string>("");

  // Issue ticket creation
  const queryClient = useQueryClient();
  const createIssueMutation = useMutation({
    mutationFn: createIssueTicket,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Issue ticket created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      setIssueTicketDialogOpen(false);
      setPendingIssueTicket(null);
      setIssueTicketComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create issue ticket",
        variant: "destructive",
      });
    },
  });

  const handleCreateIssueTicket = () => {
    if (!pendingIssueTicket) return;

    const { customerPhone, customerName } = pendingIssueTicket;

    createIssueMutation.mutate({
      full_name: customerName || customerPhone,
      phone: customerPhone,
      comment: issueTicketComment || "Remboursement",
      company_id: companyId,
    });
  };

  // Generate default comment when dialog opens
  useEffect(() => {
    if (pendingIssueTicket && issueTicketDialogOpen) {
      const { order } = pendingIssueTicket;
      const orderDetails = `Commande #${order.order_number}\nDate: ${format(new Date(order.delivered_at || order.date_created || new Date()), "PPp")}\nMontant: ${order.amount} DZD\nArticles: ${order.line_items?.map(item => `${item.quantity}x ${item.name}`).join(", ") || "N/A"}`;
      const defaultComment = `Remboursement\n\n${orderDetails}`;
      setIssueTicketComment(defaultComment);
    } else if (!issueTicketDialogOpen) {
      setIssueTicketComment("");
    }
  }, [pendingIssueTicket, issueTicketDialogOpen]);

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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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
                onViewHistory={(phone, name) => {
                  setSelectedCustomerForHistory({ phone, name });
                  setOrderHistoryDrawerOpen(true);
                }}
                onCreateExchange={(orderId) => {
                  setSelectedOrderForExchange(orderId);
                  setExchangeDialogOpen(true);
                }}
                onCreateIssue={(order, customerPhone, customerName) => {
                  setPendingIssueTicket({ order, customerPhone, customerName });
                  setIssueTicketDialogOpen(true);
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

      {/* Order History Drawer */}
      {selectedCustomerForHistory && (
        <CustomerOrderHistoryDrawer
          open={orderHistoryDrawerOpen}
          onOpenChange={setOrderHistoryDrawerOpen}
          customerPhone={selectedCustomerForHistory.phone}
          customerName={selectedCustomerForHistory.name}
        />
      )}

      {/* Exchange Dialog */}
      {orderForExchange?.data && (
        <DeclareExchangeDialog
          open={exchangeDialogOpen}
          onOpenChange={(open) => {
            setExchangeDialogOpen(open);
            if (!open) {
              setSelectedOrderForExchange(undefined);
            }
          }}
          order={orderForExchange.data}
        />
      )}

      {/* Issue Ticket Confirmation Dialog */}
      {pendingIssueTicket && (
        <Dialog open={issueTicketDialogOpen} onOpenChange={setIssueTicketDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Create Issue Ticket for Refund?
              </DialogTitle>
              <DialogDescription>
                An issue ticket will be created for this order with refund details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer</div>
                  <div className="text-base font-semibold">
                    {pendingIssueTicket.customerName || pendingIssueTicket.customerPhone}
                  </div>
                  <div className="text-sm text-muted-foreground">{pendingIssueTicket.customerPhone}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                  <div className="text-base font-semibold">#{pendingIssueTicket.order.order_number}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(pendingIssueTicket.order.delivered_at || pendingIssueTicket.order.date_created || new Date()), "PPp")}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Order Details</div>
                <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{pendingIssueTicket.order.amount} DZD</span>
                  </div>
                  {pendingIssueTicket.order.line_items && pendingIssueTicket.order.line_items.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <div className="mt-1 space-y-1">
                        {pendingIssueTicket.order.line_items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="issue-comment" className="text-sm font-medium text-muted-foreground mb-2">
                  Issue Ticket Comment
                </Label>
                <Textarea
                  id="issue-comment"
                  value={issueTicketComment}
                  onChange={(e) => setIssueTicketComment(e.target.value)}
                  placeholder="Enter the issue ticket comment..."
                  className="min-h-[120px] mt-2"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can edit the comment before creating the issue ticket.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIssueTicketDialogOpen(false);
                  setPendingIssueTicket(null);
                  setIssueTicketComment("");
                }}
                disabled={createIssueMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateIssueTicket}
                disabled={createIssueMutation.isPending}
                variant="default"
              >
                {createIssueMutation.isPending ? "Creating..." : "Create Issue Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  onViewHistory,
  onCreateExchange,
  onCreateIssue,
}: {
  deliveries: CustomerDeliveryInfo[];
  expandedOrders: Set<number>;
  setExpandedOrders: (set: Set<number>) => void;
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;
  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onViewHistory(delivery.customer_phone, delivery.customer_name);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  Order History
                </Button>
                {delivery.orders.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onCreateExchange(delivery.orders[0].id);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Exchange
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onCreateIssue(delivery.orders[0], delivery.customer_phone, delivery.customer_name);
                      }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Issue Ticket
                    </Button>
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
                  </>
                )}
              </div>
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
  onViewHistory,
  onCreateExchange,
  onCreateIssue,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;
  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
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
              <TableHead className="w-[400px]">Actions</TableHead>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onViewHistory(delivery.customer_phone, delivery.customer_name);
                        }}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      {delivery.orders.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onCreateExchange(delivery.orders[0].id);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Exchange
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onCreateIssue(delivery.orders[0], delivery.customer_phone, delivery.customer_name);
                            }}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Issue
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onReview(delivery.customer_phone, delivery.orders[0].id);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </>
                      )}
                    </div>
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
  onViewHistory,
  onCreateExchange,
  onCreateIssue,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;
  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onViewHistory(delivery.customer_phone, delivery.customer_name);
                    }}
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  {delivery.orders.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onCreateExchange(delivery.orders[0].id);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Exchange
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onCreateIssue(delivery.orders[0], delivery.customer_phone, delivery.customer_name);
                        }}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Issue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onReview(delivery.customer_phone, delivery.orders[0].id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </>
                  )}
                </div>
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

