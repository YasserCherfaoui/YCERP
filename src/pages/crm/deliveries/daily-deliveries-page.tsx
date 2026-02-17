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
import { getDailyDeliveries, updateOrderDeliveryStatus } from "@/services/customer-service";
import { createIssueTicket } from "@/services/issue-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, CreditCard, Filter, History, LayoutGrid, List, MapPin, MessageSquare, Package, Phone, RefreshCw, Table2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "@/app/store";

export default function DailyDeliveriesPage() {
  const { companyID } = useParams<{ companyID: string }>();
  const companyFromUrl = companyID ? parseInt(companyID, 10) : undefined;
  const companyFromRedux = useSelector((state: RootState) => state.company.companyID ?? state.company.company?.ID);
  const companyId = companyFromUrl ?? companyFromRedux;
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const date = searchParams.get("deliveries_date") || format(new Date(), "yyyy-MM-dd");
  const page = parseInt(searchParams.get("deliveries_page") || "1");
  const limit = parseInt(searchParams.get("deliveries_limit") || "20");
  const viewMode = (searchParams.get("deliveries_view") as "cards" | "table" | "list") || "cards";
  const shippingProvider = searchParams.get("shipping_provider") || "all";
  const wilaya = searchParams.get("wilaya") || "all";
  const contactStatusFilter = searchParams.get("contact_status") || "all";
  const activeTab = (searchParams.get("deliveries_tab") as "waiting" | "done") || "waiting";
  const phoneSearch = searchParams.get("phone") || "";

  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | undefined>();
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  
  // Helper to update params
  const updateParams = (updates: Record<string, string | number | undefined | null>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      return newParams;
    });
  };

  const setDate = (d: string) => updateParams({ deliveries_date: d, deliveries_page: 1 });
  const setPage = (p: number) => updateParams({ deliveries_page: p });
  const setLimit = (l: number) => updateParams({ deliveries_limit: l, deliveries_page: 1 });
  const setViewMode = (v: string) => updateParams({ deliveries_view: v });
  const setShippingProvider = (p: string) => updateParams({ shipping_provider: p, deliveries_page: 1 });
  const setWilaya = (w: string) => updateParams({ wilaya: w, deliveries_page: 1 });
  const setContactStatusFilter = (s: string) => updateParams({ contact_status: s, deliveries_page: 1 });
  const setActiveTab = (t: string) => updateParams({ deliveries_tab: t, deliveries_page: 1 });
  const setPhoneSearch = (v: string) => updateParams({ phone: v || undefined, deliveries_page: 1 });
  
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
    if (companyId == null) {
      toast({
        title: "Company required",
        description: "Company context is required to create an issue ticket. Open daily deliveries from a company (e.g. Company → CRM → Deliveries) or ensure a company is selected.",
        variant: "destructive",
      });
      return;
    }

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
  
  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => 
      updateOrderDeliveryStatus(orderId, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["daily-deliveries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["daily-deliveries", companyId, date, page, limit, activeTab, shippingProvider, wilaya, contactStatusFilter, phoneSearch],
    queryFn: () => getDailyDeliveries(
      date, 
      companyId, 
      page, 
      limit, 
      activeTab, 
      shippingProvider === "all" ? undefined : shippingProvider, 
      wilaya === "all" ? undefined : wilaya,
      contactStatusFilter === "all" ? undefined : contactStatusFilter,
      phoneSearch.trim() || undefined
    ),
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



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filters
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View</span>
              <div className="flex border rounded-md bg-muted/30">
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
              <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveries-date" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date
              </Label>
              <Input
                id="deliveries-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveries-phone" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </Label>
              <Input
                id="deliveries-phone"
                type="text"
                placeholder="Search by phone number"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveries-provider" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Shipping provider
              </Label>
              <Select value={shippingProvider} onValueChange={(value) => setShippingProvider(value)}>
                <SelectTrigger id="deliveries-provider" className="w-full">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="yalidine">Yalidine</SelectItem>
                  <SelectItem value="my_companies">My Companies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveries-wilaya" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Wilaya
              </Label>
              <Select value={wilaya} onValueChange={(value) => setWilaya(value)}>
                <SelectTrigger id="deliveries-wilaya" className="w-full">
                  <SelectValue placeholder="Wilaya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wilayas</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.key} value={city.label}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveries-contact" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Contact status
              </Label>
              <Select value={contactStatusFilter} onValueChange={(value) => setContactStatusFilter(value)}>
                <SelectTrigger id="deliveries-contact" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="no_answer_1">No Answer 1</SelectItem>
                  <SelectItem value="no_answer_2">No Answer 2</SelectItem>
                  <SelectItem value="no_answer_3">No Answer 3</SelectItem>
                  <SelectItem value="no_answer_4">No Answer 4</SelectItem>
                  <SelectItem value="no_answer_5">No Answer 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                onUpdateStatus={handleStatusUpdate}
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
                onUpdateStatus={handleStatusUpdate}
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
                onUpdateStatus={handleStatusUpdate}
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
                onUpdateStatus={handleStatusUpdate}
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
                onUpdateStatus={handleStatusUpdate}
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
                onUpdateStatus={handleStatusUpdate}
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
              onClick={() => setPage(Math.max(1, page - 1))}
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
              onClick={() => setPage(page + 1)}
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
                {companyId == null && (
                  <span className="block mt-2 text-amber-600 dark:text-amber-500">
                    Company context is required. Open this page from a company (Company → CRM → Deliveries) to create an issue ticket.
                  </span>
                )}
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
                disabled={createIssueMutation.isPending || companyId == null}
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
  onUpdateStatus,
}: {
  deliveries: CustomerDeliveryInfo[];
  expandedOrders: Set<number>;
  setExpandedOrders: (set: Set<number>) => void;
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;
  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
}) {
  return (
    <div className="space-y-4">
      {deliveries.map((delivery, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {delivery.customer_name || delivery.customer_phone}
                {delivery.orders.length > 0 && (
                   <StatusSelector 
                     status={delivery.orders[0].delivery_contact_status} 
                     onChange={(newStatus) => onUpdateStatus(delivery.orders[0].id, newStatus)}
                   />
                )}
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
                          onUpdateStatus={onUpdateStatus}
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
  onUpdateStatus,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;

  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
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
              <TableHead>Status</TableHead>
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
                    {delivery.orders.length > 0 && (
                        <StatusSelector 
                          status={delivery.orders[0].delivery_contact_status} 
                          onChange={(newStatus) => onUpdateStatus(delivery.orders[0].id, newStatus)}
                        />
                    )}
                  </TableCell>
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
  onUpdateStatus,
}: {
  deliveries: CustomerDeliveryInfo[];
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;

  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
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
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium">
                      {delivery.customer_name || delivery.customer_phone}
                    </div>
                    {delivery.orders.length > 0 && (
                      <StatusBadge status={delivery.orders[0].delivery_contact_status} />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {delivery.customer_phone} • {delivery.orders.length} orders • {totalAmount} DZD
                  </div>
                  {delivery.orders.length > 0 && (
                    <div className="w-[200px]">
                       <StatusSelector 
                          status={delivery.orders[0].delivery_contact_status} 
                          onChange={(newStatus) => onUpdateStatus(delivery.orders[0].id, newStatus)}
                        />
                    </div>
                  )}
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
  onRecordReview,
  onUpdateStatus,
}: { 
  order: OrderDeliveryInfo; 
  customerPhone: string; 
  onRecordReview: (phone: string, orderId: number) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
}) {
  return (
    <div className="p-4 space-y-3 border-t bg-background">
      {/* Contact Status */}
      <div>
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contact Status
        </div>
        <div className="w-full max-w-xs">
           <StatusSelector 
              status={order.delivery_contact_status} 
              onChange={(newStatus) => onUpdateStatus(order.id, newStatus)}
            />
        </div>
      </div>
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


function StatusBadge({ status }: { status?: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "contacted": return "bg-green-100 text-green-800 border-green-200";
      case "no_answer_1": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "no_answer_2": return "bg-orange-100 text-orange-800 border-orange-200";
      case "no_answer_3": return "bg-red-100 text-red-800 border-red-200";
      case "no_answer_4": return "bg-purple-100 text-purple-800 border-purple-200";
      case "no_answer_5": return "bg-red-900 text-red-100 border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "contacted": return "Contacted";
      case "no_answer_1": return "No Answer 1";
      case "no_answer_2": return "No Answer 2";
      case "no_answer_3": return "No Answer 3";
      case "no_answer_4": return "No Answer 4";
      case "no_answer_5": return "No Answer 5";
      default: return "Pending";
    }
  };

  const currentStatus = status || "pending";

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(currentStatus)}`}>
      {getStatusLabel(currentStatus)}
    </span>
  );
}

function StatusSelector({ status, onChange }: { status?: string; onChange: (status: string) => void }) {
  return (
    <Select value={status || "pending"} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Pending</span>
          </div>
        </SelectItem>
        <SelectItem value="contacted">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Contacted</span>
          </div>
        </SelectItem>
        <SelectItem value="no_answer_1">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>No Answer 1</span>
          </div>
        </SelectItem>
        <SelectItem value="no_answer_2">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>No Answer 2</span>
          </div>
        </SelectItem>
        <SelectItem value="no_answer_3">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>No Answer 3</span>
          </div>
        </SelectItem>
        <SelectItem value="no_answer_4">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>No Answer 4</span>
          </div>
        </SelectItem>
        <SelectItem value="no_answer_5">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-900" />
            <span>No Answer 5</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
