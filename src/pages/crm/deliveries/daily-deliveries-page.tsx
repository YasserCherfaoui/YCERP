import { RootState } from "@/app/store";
import { avatarTone, liquidGlass, tile, tone } from "@/components/feature-specific/crm/crm-theme";
import CustomerPhoneCell from "@/components/feature-specific/crm/customer-phone-cell";
import CustomerOrderHistoryDrawer from "@/components/feature-specific/deliveries/customer-order-history-drawer";
import OrderReviewDialog from "@/components/feature-specific/deliveries/order-review-dialog";
import DeclareExchangeDialog from "@/components/feature-specific/orders/declare-exchange-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CustomerDeliveryInfo, DailyDelivery, OrderDeliveryInfo } from "@/models/data/customer.model";
import { getDailyDeliveries, updateOrderDeliveryStatus } from "@/services/customer-service";
import { createIssueTicket } from "@/services/issue-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  History,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  RefreshCcw,
  Repeat,
  Search,
  Star,
  Table2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";

type Provider = NonNullable<OrderDeliveryInfo["shipping_provider"]>;

const PROVIDERS: Record<Provider, { label: string; chip: string; dot: string; selected: string; idle: string }> = {
  yalidine: {
    label: "Yalidine",
    chip: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
    dot: "bg-rose-500",
    selected: "bg-rose-500 text-white shadow-sm",
    idle: "text-rose-800 hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-500/20",
  },
  noest: {
    label: "NOEST",
    chip: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
    dot: "bg-sky-500",
    selected: "bg-sky-500 text-white shadow-sm",
    idle: "text-sky-800 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-500/20",
  },
  my_companies: {
    label: "My Companies",
    chip: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
    dot: "bg-violet-500",
    selected: "bg-violet-500 text-white shadow-sm",
    idle: "text-violet-800 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-violet-500/20",
  },
};

const CONTACT_STATUSES: { value: string; label: string; dot: string; chip: string }[] = [
  { value: "pending", label: "Pending", dot: "bg-slate-400", chip: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" },
  { value: "contacted", label: "Contacted", dot: "bg-emerald-500", chip: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  { value: "no_answer_1", label: "No Answer 1", dot: "bg-yellow-500", chip: "border-yellow-300 bg-yellow-100 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200" },
  { value: "no_answer_2", label: "No Answer 2", dot: "bg-orange-500", chip: "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200" },
  { value: "no_answer_3", label: "No Answer 3", dot: "bg-red-500", chip: "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200" },
  { value: "no_answer_4", label: "No Answer 4", dot: "bg-purple-500", chip: "border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200" },
  { value: "no_answer_5", label: "No Answer 5", dot: "bg-red-900", chip: "border-red-800 bg-red-900 text-red-50 dark:border-red-700 dark:bg-red-900 dark:text-red-50" },
];

const contactStatus = (status?: string) =>
  CONTACT_STATUSES.find((s) => s.value === (status || "pending")) ?? CONTACT_STATUSES[0];

const TABS = [
  {
    value: "waiting",
    label: "Waiting",
    icon: Clock,
    selected: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
    idle: "text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-500/20",
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
    selected: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
    idle: "text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
  },
] as const;

const VIEW_MODES = [
  { value: "table", label: "Table", icon: Table2 },
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["value"];

type RowActions = {
  detailPath: (phone: string) => string;
  onReview: (phone: string, orderId: number) => void;
  onViewHistory: (phone: string, name?: string) => void;
  onCreateExchange: (orderId: number) => void;
  onCreateIssue: (order: OrderDeliveryInfo, phone: string, name?: string) => void;
  onUpdateStatus: (orderId: number, status: string) => void;
};

const formatDzd = (amount: number) => `${amount.toLocaleString()} DZD`;

function initials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return letters ? letters.toUpperCase() : "#";
}

function formatDateTime(value?: string | Date) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "d MMM, HH:mm");
}

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
  const viewParam = searchParams.get("deliveries_view");
  const viewMode: ViewMode = VIEW_MODES.some((v) => v.value === viewParam) ? (viewParam as ViewMode) : "table";
  const shippingProvider = searchParams.get("shipping_provider") || "all";
  const wilaya = searchParams.get("wilaya") || "all";
  const contactStatusFilter = searchParams.get("contact_status") || "all";
  const activeTab = (searchParams.get("deliveries_tab") as "waiting" | "done") || "waiting";
  const phoneSearch = searchParams.get("phone") || "";

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | undefined>();
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();

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
  const setShippingProvider = (p: string) => updateParams({ shipping_provider: p === "all" ? undefined : p, deliveries_page: 1 });
  const setWilaya = (w: string) => updateParams({ wilaya: w === "all" ? undefined : w, deliveries_page: 1 });
  const setContactStatusFilter = (s: string) => updateParams({ contact_status: s === "all" ? undefined : s, deliveries_page: 1 });
  const setActiveTab = (t: string) => updateParams({ deliveries_tab: t, deliveries_page: 1 });
  const setPhoneSearch = (v: string) => updateParams({ phone: v || undefined, deliveries_page: 1 });

  const [phoneInput, setPhoneInput] = useState(phoneSearch);
  const debouncedPhoneInput = useDebounce(phoneInput, 300);
  useEffect(() => {
    if (debouncedPhoneInput !== phoneSearch) setPhoneSearch(debouncedPhoneInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPhoneInput]);

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

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
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
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to load deliveries",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const deliveryData: DailyDelivery | undefined = data?.data;
  const deliveries = deliveryData?.deliveries ?? [];
  const pagination = deliveryData?.pagination;
  const isToday = date === format(new Date(), "yyyy-MM-dd");
  const hasFilters =
    Boolean(phoneSearch) || shippingProvider !== "all" || wilaya !== "all" || contactStatusFilter !== "all";

  const actions: RowActions = {
    detailPath: (phone) =>
      companyID ? `/company/${companyID}/crm/customers/${phone}` : `/moderator/crm/customers/${phone}`,
    onReview: (phone, orderId) => {
      setSelectedCustomerPhone(phone);
      setSelectedOrderId(orderId);
      setReviewDialogOpen(true);
    },
    onViewHistory: (phone, name) => {
      setSelectedCustomerForHistory({ phone, name });
      setOrderHistoryDrawerOpen(true);
    },
    onCreateExchange: (orderId) => {
      setSelectedOrderForExchange(orderId);
      setExchangeDialogOpen(true);
    },
    onCreateIssue: (order, customerPhone, customerName) => {
      setPendingIssueTicket({ order, customerPhone, customerName });
      setIssueTicketDialogOpen(true);
    },
    onUpdateStatus: (orderId, status) => updateStatusMutation.mutate({ orderId, status }),
  };

  return (
    <>
      <Card className={cn("overflow-hidden", liquidGlass)}>
        <div className="flex flex-col gap-2 p-3 sm:p-4 xl:flex-row xl:items-center" aria-label="Filters">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-44">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-300" />
              <Input
                aria-label="Delivery date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 border-emerald-200/80 bg-white/70 pl-9 backdrop-blur-md focus-visible:ring-emerald-400 dark:border-emerald-400/30 dark:bg-white/10"
              />
            </div>
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-indigo-500 dark:text-indigo-300" />
              <Input
                aria-label="Search by phone"
                placeholder="Search phone number"
                autoComplete="off"
                inputMode="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="h-9 border-indigo-200/80 bg-white/70 pl-9 pr-8 backdrop-blur-md focus-visible:ring-indigo-400 dark:border-indigo-400/30 dark:bg-white/10"
              />
              {phoneInput && (
                <button
                  type="button"
                  aria-label="Clear phone search"
                  onClick={() => setPhoneInput("")}
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Shipping provider" className="inline-flex flex-wrap gap-0.5 rounded-lg bg-white/60 p-0.5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <button
                type="button"
                aria-pressed={shippingProvider === "all"}
                onClick={() => setShippingProvider("all")}
                className={cn(
                  "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium motion-safe:transition-colors",
                  shippingProvider === "all" ? "bg-background text-foreground shadow-sm" : "text-foreground/70 hover:bg-background/70"
                )}
              >
                <Truck className="size-3.5" aria-hidden />
                All
              </button>
              {(Object.keys(PROVIDERS) as Provider[]).map((key) => {
                const provider = PROVIDERS[key];
                const selected = shippingProvider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setShippingProvider(key)}
                    className={cn(
                      "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium motion-safe:transition-colors",
                      selected ? provider.selected : provider.idle
                    )}
                  >
                    <span className={cn("size-2 rounded-full", selected ? "bg-white" : provider.dot)} aria-hidden />
                    {provider.label}
                  </button>
                );
              })}
            </div>
            <Select value={wilaya} onValueChange={setWilaya}>
              <SelectTrigger
                aria-label="Wilaya"
                className={cn("h-9 w-40", wilaya !== "all" ? "border-violet-500 bg-violet-500 text-white" : tone.violet)}
              >
                <MapPin className="size-3.5 shrink-0" />
                <SelectValue placeholder="Wilaya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wilayas</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.key} value={city.label}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={contactStatusFilter} onValueChange={setContactStatusFilter}>
              <SelectTrigger
                aria-label="Contact status"
                className={cn("h-9 w-40", contactStatusFilter !== "all" ? contactStatus(contactStatusFilter).chip : tone.amber)}
              >
                <MessageSquare className="size-3.5 shrink-0" />
                <SelectValue placeholder="Contact status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {CONTACT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => {
                  setPhoneInput("");
                  updateParams({ phone: undefined, shipping_provider: undefined, wilaya: undefined, contact_status: undefined, deliveries_page: 1 });
                }}
              >
                <X />
                Clear
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", tile.emerald.icon)}>
                <Package className="size-4" />
              </span>
              <CardTitle className="text-base">{isToday ? "Today's deliveries" : `Deliveries · ${format(new Date(date), "d MMM yyyy")}`}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                {deliveryData
                  ? `${deliveryData.total_orders.toLocaleString()} orders · ${deliveryData.unique_customers.toLocaleString()} customers`
                  : "Loading…"}
                {isFetching && !isLoading && <Loader2 className="size-3.5 animate-spin text-emerald-500" aria-label="Updating" />}
              </CardDescription>
            </div>
            <div role="tablist" aria-label="Call status" className="inline-flex gap-0.5 rounded-lg bg-white/60 p-0.5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium motion-safe:transition-colors",
                      selected ? tab.selected : tab.idle
                    )}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Layout" className="inline-flex gap-0.5 rounded-lg bg-white/60 p-0.5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const selected = viewMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${mode.label} layout`}
                    title={mode.label}
                    onClick={() => setViewMode(mode.value)}
                    className={cn(
                      "flex size-8 cursor-pointer items-center justify-center rounded-md motion-safe:transition-colors",
                      selected
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                        : "text-indigo-700 hover:bg-indigo-100/70 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn("size-8", tone.emerald)}
              aria-label="Refresh deliveries"
              onClick={() => refetch()}
            >
              <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
            </Button>
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="h-8 w-[4.5rem] bg-background" aria-label="Rows per page">
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
        </CardHeader>
        <Separator />
        <CardContent className={cn("p-2 sm:p-3 motion-safe:transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className={cn("flex size-11 items-center justify-center rounded-xl", activeTab === "waiting" ? tile.amber.icon : tile.emerald.icon)}>
                {activeTab === "waiting" ? <Clock className="size-5" /> : <CheckCircle className="size-5" />}
              </span>
              <p className="text-sm font-medium">
                {hasFilters
                  ? "No deliveries match these filters."
                  : activeTab === "waiting"
                    ? "No customers waiting for a call on this date."
                    : "No calls completed on this date yet."}
              </p>
            </div>
          ) : viewMode === "table" ? (
            <TableView deliveries={deliveries} actions={actions} />
          ) : viewMode === "cards" ? (
            <CardsView deliveries={deliveries} actions={actions} />
          ) : (
            <ListView deliveries={deliveries} actions={actions} />
          )}
        </CardContent>
        {pagination && pagination.total_pages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
              <span className="text-xs text-muted-foreground tabular-nums">
                Page {pagination.page} of {pagination.total_pages} · {pagination.total.toLocaleString()} customers
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={tone.indigo}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={!pagination.has_prev || isFetching}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={tone.indigo}
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.has_next || isFetching}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {selectedCustomerPhone && selectedOrderId && (
        <OrderReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          customerPhone={selectedCustomerPhone}
          orderId={selectedOrderId}
        />
      )}

      {selectedCustomerForHistory && (
        <CustomerOrderHistoryDrawer
          open={orderHistoryDrawerOpen}
          onOpenChange={setOrderHistoryDrawerOpen}
          customerPhone={selectedCustomerForHistory.phone}
          customerName={selectedCustomerForHistory.name}
        />
      )}

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

      {pendingIssueTicket && (
        <Dialog open={issueTicketDialogOpen} onOpenChange={setIssueTicketDialogOpen}>
          <DialogContent className={cn("max-w-2xl gap-0 overflow-hidden p-0", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}>
            <DialogHeader className="space-y-1 bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 text-left text-white">
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="size-5" />
                Create issue ticket for refund?
              </DialogTitle>
              <DialogDescription className="text-white/85">
                An issue ticket will be created for this order with refund details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-6 py-5">
              {companyId == null && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                  Company context is required. Open this page from a company (Company → CRM → Deliveries) to create an issue ticket.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={cn("rounded-xl border p-3", tile.indigo.surface)}>
                  <div className="text-xs font-medium opacity-70">Customer</div>
                  <div className="font-semibold">{pendingIssueTicket.customerName || pendingIssueTicket.customerPhone}</div>
                  <div className="text-sm tabular-nums opacity-80">{pendingIssueTicket.customerPhone}</div>
                </div>
                <div className={cn("rounded-xl border p-3", tile.violet.surface)}>
                  <div className="text-xs font-medium opacity-70">Order</div>
                  <div className="font-semibold">#{pendingIssueTicket.order.order_number}</div>
                  <div className="text-sm opacity-80">
                    {format(new Date(pendingIssueTicket.order.delivered_at || pendingIssueTicket.order.date_created || new Date()), "PPp")}
                  </div>
                </div>
              </div>

              <div className={cn("space-y-2 rounded-xl border p-3 text-sm", tile.emerald.surface)}>
                <div className="flex justify-between">
                  <span className="opacity-70">Amount</span>
                  <span className="font-semibold tabular-nums">{formatDzd(pendingIssueTicket.order.amount)}</span>
                </div>
                {pendingIssueTicket.order.line_items && pendingIssueTicket.order.line_items.length > 0 && (
                  <div className="space-y-1">
                    {pendingIssueTicket.order.line_items.map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}× {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue-comment">Issue ticket comment</Label>
                <Textarea
                  id="issue-comment"
                  value={issueTicketComment}
                  onChange={(e) => setIssueTicketComment(e.target.value)}
                  placeholder="Enter the issue ticket comment..."
                  className="min-h-[120px] bg-white/70 dark:bg-white/10"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">You can edit the comment before creating the issue ticket.</p>
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-3">
              <Button
                type="button"
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
                type="button"
                onClick={handleCreateIssueTicket}
                disabled={createIssueMutation.isPending || companyId == null}
                className="bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md shadow-rose-500/20 hover:from-rose-500 hover:to-orange-400"
              >
                {createIssueMutation.isPending && <Loader2 className="animate-spin" />}
                {createIssueMutation.isPending ? "Creating…" : "Create issue ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function CustomerCell({ delivery, detailPath }: { delivery: CustomerDeliveryInfo; detailPath: (phone: string) => string }) {
  const status = contactStatus(delivery.orders[0]?.delivery_contact_status);
  return (
    <Link to={detailPath(delivery.customer_phone)} className="group flex min-w-[12rem] items-center gap-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-offset-2 ring-offset-background",
          avatarTone(delivery.customer_phone),
          status.value === "contacted" ? "ring-emerald-400" : status.value === "pending" ? "ring-slate-300 dark:ring-slate-600" : "ring-amber-400"
        )}
      >
        {initials(delivery.customer_name)}
      </span>
      <span
        className={cn(
          "truncate text-sm font-semibold group-hover:text-indigo-700 group-hover:underline dark:group-hover:text-indigo-300",
          !delivery.customer_name && "text-muted-foreground"
        )}
      >
        {delivery.customer_name || "Unnamed customer"}
      </span>
    </Link>
  );
}

function ProviderChip({ provider }: { provider?: OrderDeliveryInfo["shipping_provider"] }) {
  if (!provider) return null;
  const config = PROVIDERS[provider];
  return (
    <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium", config.chip)}>
      {config.label}
    </Badge>
  );
}

function StatusSelector({ status, onChange }: { status?: string; onChange: (status: string) => void }) {
  const current = contactStatus(status);
  return (
    <Select value={current.value} onValueChange={onChange}>
      <SelectTrigger aria-label="Contact status" className={cn("h-8 w-[9.5rem] text-xs font-medium", current.chip)}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {CONTACT_STATUSES.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", option.dot)} />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RowButtons({ delivery, actions, compact }: { delivery: CustomerDeliveryInfo; actions: RowActions; compact?: boolean }) {
  const first = delivery.orders[0];
  const labelClass = compact ? "sr-only" : "hidden 2xl:inline";
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("h-8", tone.sky)}
        title="Order history"
        onClick={() => actions.onViewHistory(delivery.customer_phone, delivery.customer_name)}
      >
        <History />
        <span className={labelClass}>History</span>
      </Button>
      {first && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn("h-8", tone.violet)}
            title="Declare exchange"
            onClick={() => actions.onCreateExchange(first.id)}
          >
            <Repeat />
            <span className={labelClass}>Exchange</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn("h-8", tone.rose)}
            title="Create issue ticket"
            onClick={() => actions.onCreateIssue(first, delivery.customer_phone, delivery.customer_name)}
          >
            <AlertCircle />
            <span className={labelClass}>Issue</span>
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-400 hover:to-orange-400"
            title="Record review"
            onClick={() => actions.onReview(delivery.customer_phone, first.id)}
          >
            <Star />
            <span className={compact ? "sr-only" : undefined}>Review</span>
          </Button>
        </>
      )}
    </div>
  );
}

function TableView({ deliveries, actions }: { deliveries: CustomerDeliveryInfo[]; actions: RowActions }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/50 bg-white/50 dark:border-white/10 dark:bg-white/[0.03]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => {
            const total = delivery.orders.reduce((sum, order) => sum + order.amount, 0);
            const first = delivery.orders[0];
            return (
              <TableRow key={delivery.customer_phone} className="hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10">
                <TableCell>
                  <CustomerCell delivery={delivery} detailPath={actions.detailPath} />
                </TableCell>
                <TableCell>
                  <CustomerPhoneCell phone={delivery.customer_phone} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {delivery.orders.map((order) => (
                      <div key={order.id} className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium tabular-nums">#{order.order_number}</span>
                        <ProviderChip provider={order.shipping_provider} />
                        {formatDateTime(order.delivered_at) && (
                          <span className="text-muted-foreground">{formatDateTime(order.delivered_at)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{formatDzd(total)}</span>
                </TableCell>
                <TableCell>
                  {first && (
                    <StatusSelector
                      status={first.delivery_contact_status}
                      onChange={(status) => actions.onUpdateStatus(first.id, status)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <RowButtons delivery={delivery} actions={actions} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CardsView({ deliveries, actions }: { deliveries: CustomerDeliveryInfo[]; actions: RowActions }) {
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {deliveries.map((delivery) => {
        const first = delivery.orders[0];
        const total = delivery.orders.reduce((sum, order) => sum + order.amount, 0);
        return (
          <div
            key={delivery.customer_phone}
            className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <CustomerCell delivery={delivery} detailPath={actions.detailPath} />
                <div className="pl-12">
                  <CustomerPhoneCell phone={delivery.customer_phone} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{formatDzd(total)}</span>
                {first && (
                  <StatusSelector
                    status={first.delivery_contact_status}
                    onChange={(status) => actions.onUpdateStatus(first.id, status)}
                  />
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              {delivery.orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <div key={order.id} className="overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggle(order.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left"
                    >
                      <span className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="font-medium tabular-nums">#{order.order_number}</span>
                        <ProviderChip provider={order.shipping_provider} />
                        {order.has_review && (
                          <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", tone.amber)}>
                            <Star className="mr-0.5 size-3" />
                            Reviewed
                          </Badge>
                        )}
                        {formatDateTime(order.delivered_at) && (
                          <span className="text-xs text-muted-foreground">{formatDateTime(order.delivered_at)}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{formatDzd(order.amount)}</span>
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </span>
                    </button>
                    {isExpanded && <OrderDetails order={order} customerPhone={delivery.customer_phone} actions={actions} />}
                  </div>
                );
              })}
            </div>
            <RowButtons delivery={delivery} actions={actions} />
          </div>
        );
      })}
    </div>
  );
}

function ListView({ deliveries, actions }: { deliveries: CustomerDeliveryInfo[]; actions: RowActions }) {
  return (
    <div className="divide-y divide-black/5 overflow-hidden rounded-xl border border-white/50 bg-white/50 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
      {deliveries.map((delivery) => {
        const first = delivery.orders[0];
        const total = delivery.orders.reduce((sum, order) => sum + order.amount, 0);
        return (
          <div key={delivery.customer_phone} className="flex flex-wrap items-center gap-3 px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10">
            <div className="min-w-0 flex-1">
              <CustomerCell delivery={delivery} detailPath={actions.detailPath} />
            </div>
            <span className="text-sm tabular-nums text-muted-foreground">{delivery.customer_phone}</span>
            <Badge variant="outline" className={cn("tabular-nums", tone.indigo)}>
              {delivery.orders.length} order{delivery.orders.length === 1 ? "" : "s"}
            </Badge>
            <span className="w-28 text-right text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{formatDzd(total)}</span>
            {first && (
              <StatusSelector
                status={first.delivery_contact_status}
                onChange={(status) => actions.onUpdateStatus(first.id, status)}
              />
            )}
            <RowButtons delivery={delivery} actions={actions} compact />
          </div>
        );
      })}
    </div>
  );
}

function OrderDetails({
  order,
  customerPhone,
  actions,
}: {
  order: OrderDeliveryInfo;
  customerPhone: string;
  actions: RowActions;
}) {
  return (
    <div className="space-y-3 border-t border-indigo-100 bg-background/80 p-3 text-sm dark:border-indigo-500/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Contact status for this order</span>
        <StatusSelector status={order.delivery_contact_status} onChange={(status) => actions.onUpdateStatus(order.id, status)} />
      </div>

      {order.line_items && order.line_items.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Items ({order.line_items.length})</div>
          {order.line_items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <div className="min-w-0">
                <div className="truncate font-medium">{item.name}</div>
                {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <div>{item.quantity} × {item.price} DZD</div>
                <div className="text-xs text-muted-foreground">Total: {item.total}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {(order.shipping_address || order.shipping_city) && (
          <div className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span className="text-muted-foreground">
              {order.shipping_address}
              {order.shipping_city && `, ${order.shipping_city}`}
            </span>
          </div>
        )}
        {order.payment_method_title && (
          <div className="flex gap-2">
            <CreditCard className="mt-0.5 size-4 shrink-0 text-sky-500" />
            <span className="text-muted-foreground">{order.payment_method_title}</span>
          </div>
        )}
        {order.date_created && (
          <div className="flex gap-2">
            <Calendar className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span className="text-muted-foreground">Ordered {format(new Date(order.date_created), "PPp")}</span>
          </div>
        )}
        {(order.billing_address || order.billing_city) && (
          <div className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              Billing: {order.billing_address}
              {order.billing_city && `, ${order.billing_city}`}
            </span>
          </div>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("w-full", tone.amber)}
        onClick={() => actions.onReview(customerPhone, order.id)}
      >
        <Star />
        Record review for #{order.order_number}
      </Button>
    </div>
  );
}
