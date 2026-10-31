import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import BulkOperationsDialog from "@/components/feature-specific/orders/bulk-operations-dialog";
import CreateOrderFromScratchDialog from "@/components/feature-specific/orders/create-order-from-scratch-dialog.tsx";
import CreateRandomOrdersDevButton from "@/components/feature-specific/orders/create-random-orders-dev-dialog";
import DeclareExchangeDialog from "@/components/feature-specific/orders/declare-exchange-dialog";
import DeletedParcelReconciliationDialog from "@/components/feature-specific/orders/deleted-parcel-reconciliation-dialog";
import ImportOrdersCSVDialog from "@/components/feature-specific/orders/import-orders-csv-dialog";
import ManagerStatusCards from "@/components/feature-specific/orders/manager-status-cards";
import OrderActions from "@/components/feature-specific/orders/order-actions";
import OrderDetailsDialog from "@/components/feature-specific/orders/order-details-dialog";
import OrderHistoryDialog from "@/components/feature-specific/orders/order-history-dialog";
import OrderLineItemsAccordion, {
  ConfirmedOrderItemsAccordion,
} from "@/components/feature-specific/orders/order-line-items-accordion";
import YalidineDuplicateParcelsDialog from "@/components/feature-specific/orders/yalidine-duplicate-parcels-dialog";
import YalidineLabelsDrawer from "@/components/feature-specific/orders/yalidine-labels-drawer";
import YalidineReconciliationDialog from "@/components/feature-specific/orders/yalidine-reconciliation-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrdersWithRealtime } from "@/hooks/use-orders-with-realtime";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { User } from "@/models/data/user.model";
import { hasReferralCode, WooOrder, YALIDINE_STATUSES } from "@/models/data/woo-order.model";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { getCompanyInventory } from "@/services/inventory-service";
import { assignOrders, shuffleOrders } from "@/services/order-service";
import { getUsersByCompany } from "@/services/user-service";
import {
  dispatchWooCommerceOrders,
  exportWooCommerceOrders,
  getOrderStatusCount,
  getNoestStatuses,
  getWooCommerceOrders,
  refreshNoestStatuses,
  refreshWooCommerceStatus,
  syncDispatchingOrders,
} from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { carrierChipClass, carrierLabel, carrierStatusLabel } from "@/utils/shipping-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Hand,
  Layers,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCcw,
  Repeat,
  Scale,
  Rocket,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  Truck,
  Undo2,
  Upload,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AssignOrdersDialog from "./AssignOrdersDialog";
import ShuffleOrdersDialog from "./ShuffleOrdersDialog";

const STAGES: {
  value: string;
  label: string;
  icon: typeof Package;
  iconClass: string;
  surfaceClass: string;
  selectedClass: string;
}[] = [
  {
    value: "unconfirmed",
    label: "Unconfirmed",
    icon: Package,
    iconClass: "bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100",
    surfaceClass:
      "border-indigo-200/80 bg-indigo-100/80 text-indigo-950 hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50 dark:hover:bg-indigo-500/30",
    selectedClass: "bg-indigo-200 ring-2 ring-indigo-400/80 dark:bg-indigo-500/40 dark:ring-indigo-300/60",
  },
  {
    value: "packing",
    label: "Packing",
    icon: Package,
    iconClass: "bg-blue-200/80 text-blue-800 dark:bg-blue-400/20 dark:text-blue-100",
    surfaceClass:
      "border-blue-200/80 bg-blue-100/80 text-blue-950 hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-50 dark:hover:bg-blue-500/30",
    selectedClass: "bg-blue-200 ring-2 ring-blue-400/80 dark:bg-blue-500/40 dark:ring-blue-300/60",
  },
  {
    value: "dispaching",
    label: "Dispatching",
    icon: Truck,
    iconClass: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
    surfaceClass:
      "border-violet-200/80 bg-violet-100/80 text-violet-950 hover:bg-violet-100 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50 dark:hover:bg-violet-500/30",
    selectedClass: "bg-violet-200 ring-2 ring-violet-400/80 dark:bg-violet-500/40 dark:ring-violet-300/60",
  },
  {
    value: "deliviring",
    label: "Delivering",
    icon: Send,
    iconClass: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
    surfaceClass:
      "border-amber-200/80 bg-amber-100/85 text-amber-950 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50 dark:hover:bg-amber-500/30",
    selectedClass: "bg-amber-200 ring-2 ring-amber-400/80 dark:bg-amber-500/40 dark:ring-amber-300/60",
  },
  {
    value: "orphaned",
    label: "Orphaned",
    icon: AlertTriangle,
    iconClass: "bg-yellow-200/90 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-100",
    surfaceClass:
      "border-yellow-200/80 bg-yellow-100/90 text-yellow-950 hover:bg-yellow-100 dark:border-yellow-400/30 dark:bg-yellow-500/20 dark:text-yellow-50 dark:hover:bg-yellow-500/30",
    selectedClass: "bg-yellow-200 ring-2 ring-yellow-400/80 dark:bg-yellow-500/40 dark:ring-yellow-300/60",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    iconClass: "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100",
    surfaceClass:
      "border-emerald-200/80 bg-emerald-100/80 text-emerald-950 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50 dark:hover:bg-emerald-500/30",
    selectedClass: "bg-emerald-200 ring-2 ring-emerald-400/80 dark:bg-emerald-500/40 dark:ring-emerald-300/60",
  },
  {
    value: "returning",
    label: "Returning",
    icon: RotateCcw,
    iconClass: "bg-orange-200/80 text-orange-900 dark:bg-orange-400/20 dark:text-orange-100",
    surfaceClass:
      "border-orange-200/80 bg-orange-100/85 text-orange-950 hover:bg-orange-100 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-50 dark:hover:bg-orange-500/30",
    selectedClass: "bg-orange-200 ring-2 ring-orange-400/80 dark:bg-orange-500/40 dark:ring-orange-300/60",
  },
  {
    value: "returned",
    label: "Returned",
    icon: Undo2,
    iconClass: "bg-rose-200/80 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100",
    surfaceClass:
      "border-rose-200/80 bg-rose-100/80 text-rose-950 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-50 dark:hover:bg-rose-500/30",
    selectedClass: "bg-rose-200 ring-2 ring-rose-400/80 dark:bg-rose-500/40 dark:ring-rose-300/60",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    iconClass: "bg-fuchsia-200/80 text-fuchsia-900 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
    surfaceClass:
      "border-fuchsia-200/80 bg-fuchsia-100/80 text-fuchsia-950 hover:bg-fuchsia-100 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-50 dark:hover:bg-fuchsia-500/30",
    selectedClass: "bg-fuchsia-200 ring-2 ring-fuchsia-400/80 dark:bg-fuchsia-500/40 dark:ring-fuchsia-300/60",
  },
  {
    value: "relaunched",
    label: "Relaunched",
    icon: Rocket,
    iconClass: "bg-sky-200/80 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100",
    surfaceClass:
      "border-sky-200/80 bg-sky-100/80 text-sky-950 hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-50 dark:hover:bg-sky-500/30",
    selectedClass: "bg-sky-200 ring-2 ring-sky-400/80 dark:bg-sky-500/40 dark:ring-sky-300/60",
  },
];

const PROVIDERS = [
  { value: "all", label: "All" },
  { value: "yalidine", label: "Yalidine" },
  { value: "noest", label: "NOEST" },
  { value: "my_companies", label: "My delivery" },
] as const;

const liquidGlass =
  "border border-white/40 bg-white/45 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.16)]";

const actionTone = {
  refresh:
    "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100 dark:hover:bg-emerald-950",
  noest:
    "border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-100 dark:hover:bg-sky-950",
  yalidine:
    "border-red-300 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-800 dark:bg-red-950/70 dark:text-red-100 dark:hover:bg-red-950",
  deleted:
    "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100 dark:hover:bg-rose-950",
  assign:
    "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/70 dark:text-violet-100 dark:hover:bg-violet-950",
  bulk:
    "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-100 dark:hover:bg-indigo-950",
  duplicate:
    "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100 dark:hover:bg-amber-950",
  labels:
    "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/70 dark:text-violet-100 dark:hover:bg-violet-950",
};

function providerChipClass(value: string, selected: boolean) {
  const ring = selected ? "ring-2 ring-offset-1 ring-offset-background" : "";
  if (value === "yalidine") return cn(carrierChipClass("yalidine"), ring, selected && "ring-red-400");
  if (value === "noest") return cn(carrierChipClass("noest"), ring, selected && "ring-sky-400");
  if (value === "my_companies") return cn(carrierChipClass("my_companies"), ring, selected && "ring-emerald-400");
  return cn(
    selected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
  );
}

const money = new Intl.NumberFormat("en-DZ", {
  style: "currency",
  currency: "DZD",
  maximumFractionDigits: 0,
});

function formatWhen(value: string | Date | undefined) {
  const parts = formatParts(value);
  return parts.time ? `${parts.day}, ${parts.time}` : parts.day;
}

function formatParts(value: string | Date | undefined) {
  if (!value) return { day: "—", time: "" };
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "—", time: "" };
  return { day: format(date, "d MMM yyyy"), time: format(date, "HH:mm") };
}

function wilayaLabel(key?: string) {
  if (!key) return "—";
  return cities.find((city) => city.key == key)?.label || key;
}

const deskColumns: ColumnDef<WooOrder>[] = [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold tracking-tight tabular-nums">#{order.id}</span>
          <div className="flex flex-wrap gap-1">
            {order.is_exchange && <Badge variant="destructive">Exchange</Badge>}
            {order.confirmed_by_id && <Badge variant="secondary">Confirmed</Badge>}
            {hasReferralCode(order) && <Badge variant="outline">Affiliate</Badge>}
          </div>
        </div>
      );
    },
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original;
      const statuses = [...(order.client_statuses || [])].sort(
        (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
      const last = statuses[0];
      const qualification = last?.sub_qualification?.name || last?.qualification?.name;
      const dot = last?.sub_qualification?.color || last?.qualification?.color;
      return (
        <div className="min-w-[11rem] space-y-1">
          <div className="text-sm font-semibold leading-5">{order.shipping_name || order.billing_name || "—"}</div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm tabular-nums text-foreground/80">
            <span>{order.customer_phone || "—"}</span>
            {order.customer_phone_count && order.customer_phone_count > 1 && (
              <Badge variant="outline">×{order.customer_phone_count}</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{wilayaLabel(order.shipping_city)}</div>
          {qualification && (
            <Badge variant="outline" className="gap-1.5 font-normal">
              <span
                className="size-2 rounded-full bg-muted-foreground"
                style={dot?.startsWith("#") ? { backgroundColor: dot } : undefined}
                aria-hidden
              />
              {qualification}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => <ItemsSummary order={row.original} />,
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold tabular-nums">
        {money.format(Number(row.original.final_price || 0))}
      </span>
    ),
  },
  {
    id: "carrier",
    header: "Carrier",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="space-y-1.5">
          <Badge
            variant="outline"
            className={carrierChipClass(order.woo_shipping?.shipping_provider)}
          >
            {carrierLabel(order.woo_shipping?.shipping_provider)}
          </Badge>
          <div className="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-foreground/80">
            {order.tracking_number?.toUpperCase() || "No tracking"}
          </div>
        </div>
      );
    },
  },
  {
    id: "carrier_event",
    header: "Last carrier event",
    cell: ({ row }) => <CarrierEventCell order={row.original} />,
  },
  {
    id: "assignee",
    header: "Assignee",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {row.original.taken_by?.full_name?.charAt(0) || "—"}
          </AvatarFallback>
        </Avatar>
        <span className={cn("text-sm", !row.original.taken_by?.full_name && "text-muted-foreground")}>
          {row.original.taken_by?.full_name || "Unassigned"}
        </span>
      </div>
    ),
  },
  {
    id: "updated",
    header: "Updated",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-left">
              <span className="block text-sm font-medium">{formatParts(row.original.updated_at).day}</span>
              <span className="block text-xs text-muted-foreground">{formatParts(row.original.updated_at).time}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>Created {formatWhen(row.original.date_created)}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => <RowActions order={row.original} />,
  },
];

function ItemsSummary({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  const items = order.line_items || [];
  const first = items[0]?.name;
  return (
    <div className="min-w-[10rem] space-y-2">
      <button
        type="button"
        className="flex cursor-pointer items-start gap-2 text-left text-sm motion-safe:transition-colors hover:text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground motion-safe:transition-transform", open && "rotate-180")} />
        <span>
          <span className="font-medium">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
          {first && <span className="block max-w-[16rem] truncate text-muted-foreground">{first}</span>}
        </span>
      </button>
      {open && (
        <div className="space-y-2">
          <OrderLineItemsAccordion lineItems={items} orderNumber={order.number} />
          <ConfirmedOrderItemsAccordion
            confirmedOrderItems={order.confirmed_order_items || []}
            orderNumber={order.number}
          />
        </div>
      )}
    </div>
  );
}

function CarrierEventCell({ order }: { order: WooOrder }) {
  const [open, setOpen] = useState(false);
  const histories = [...(order.yalidine_order_histories || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last = histories[0];
  return (
    <>
      <button
        type="button"
        className={cn(
          "max-w-[14rem] cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm leading-5 motion-safe:transition-colors",
          last ? "bg-muted hover:bg-accent" : "text-muted-foreground hover:bg-accent"
        )}
        onClick={() => setOpen(true)}
      >
        {last
          ? carrierStatusLabel(order.woo_shipping?.shipping_provider, last.status)
          : "No carrier update"}
      </button>
      <OrderHistoryDialog order={order} open={open} setOpen={setOpen} />
    </>
  );
}

function RowActions({ order }: { order: WooOrder }) {
  const [exchangeOpen, setExchangeOpen] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <OrderActions order={order} />
      {order.order_status === "delivered" && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100 dark:hover:bg-amber-950"
            onClick={() => setExchangeOpen(true)}
          >
            <Repeat />
            Declare exchange
          </Button>
          {exchangeOpen && (
            <DeclareExchangeDialog open={exchangeOpen} onOpenChange={setExchangeOpen} order={order} />
          )}
        </>
      )}
    </div>
  );
}

export default function CompanyOrdersDeskPage() {
  const isMobile = useIsMobile();
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const isAdministrator = useSelector((state: RootState) => state.auth.isAuthenticated);
  const company = isModerator ? userCompany : companyFromStore;
  const companyId = company?.ID ?? 0;

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("unconfirmed");
  const [selectedUser, setSelectedUser] = useState<number | undefined>();
  const [selectedWilaya, setSelectedWilaya] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [debouncedPhoneNumber, setDebouncedPhoneNumber] = useState("");
  const [selectedCarrierStatus, setSelectedCarrierStatus] = useState<string | undefined>();
  const [selectedConfirmedVariant, setSelectedConfirmedVariant] = useState<number | undefined>();
  const [selectedFranchise, setSelectedFranchise] = useState<number | undefined>();
  const [selectedShippingProvider, setSelectedShippingProvider] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [importCSVOpen, setImportCSVOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [yalidineReconciliationOpen, setYalidineReconciliationOpen] = useState(false);
  const [duplicateParcelsOpen, setDuplicateParcelsOpen] = useState(false);
  const [deletedParcelReconciliationOpen, setDeletedParcelReconciliationOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [phonePaletteOpen, setPhonePaletteOpen] = useState(false);
  const [phoneHighlight, setPhoneHighlight] = useState(0);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [detailsOrder, setDetailsOrder] = useState<WooOrder | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setPhoneQuery(phoneNumber.trim()), 700);
    return () => clearTimeout(handler);
  }, [phoneNumber]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedStatus, selectedUser, selectedWilaya, selectedShippingProvider, pageSize]);

  const { orders, meta, isLoading } = useOrdersWithRealtime(
    currentPage,
    pageSize,
    selectedStatus,
    selectedUser,
    selectedWilaya,
    debouncedPhoneNumber,
    selectedCarrierStatus,
    undefined,
    undefined,
    selectedConfirmedVariant,
    companyId || undefined,
    selectedFranchise,
    selectedShippingProvider
  );

  const { data: usersData } = useQuery({
    queryKey: ["users", companyId],
    queryFn: () => getUsersByCompany(companyId),
    enabled: companyId > 0,
  });
  const users = usersData?.data || [];

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: companyId > 0,
  });
  const franchises = franchisesData?.data ?? [];

  const { data: noestStatusesData } = useQuery({
    queryKey: ["noest-statuses", companyId],
    queryFn: () => getNoestStatuses(companyId),
    enabled: companyId > 0 && selectedShippingProvider === "noest",
  });
  const noestStatuses = noestStatusesData?.data ?? [];

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", companyId],
    queryFn: () => getCompanyInventory(companyId),
    enabled: companyId > 0,
  });
  const allVariants =
    inventoryData?.data?.items
      .map((item) => item.product_variant)
      .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant)) || [];

  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
  const { data: statusCountData, isLoading: countsLoading } = useQuery({
    queryKey: ["order-status-count", dateFrom, dateTo, selectedWilaya, selectedShippingProvider, companyId],
    queryFn: () =>
      getOrderStatusCount({
        date_from: dateFrom,
        date_to: dateTo,
        wilaya: selectedWilaya,
        shipping_provider: selectedShippingProvider,
        company_id: companyId,
      }),
    enabled: companyId > 0,
    refetchInterval: 30000,
  });
  const counts = new Map(
    (statusCountData?.data?.status_counts || []).map((item) => [item.status, item.count])
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: shuffleOrdersMutation } = useMutation({
    mutationFn: shuffleOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Orders shuffled successfully" });
      setShuffleOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to shuffle orders", variant: "destructive" });
    },
  });
  const { mutate: assignOrdersMutation } = useMutation({
    mutationFn: assignOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Orders assigned successfully" });
      setAssignOpen(false);
      setSelectedRows([]);
    },
    onError: () => {
      toast({ title: "Failed to assign orders", variant: "destructive" });
    },
  });
  const { mutate: dispatchOrders, isPending: dispatchLoading } = useMutation({
    mutationFn: dispatchWooCommerceOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Orders dispatched successfully" });
      setBulkDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to dispatch orders", variant: "destructive" });
    },
  });
  const { mutate: exportOrders, isPending: exportLoading } = useMutation({
    mutationFn: exportWooCommerceOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["yalidine-parcel-labels-pending"] });
      queryClient.invalidateQueries({ queryKey: ["yalidine-parcel-labels-downloaded"] });
      toast({ title: "Orders exported successfully" });
      setBulkDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to export orders", variant: "destructive" });
    },
  });
  const { mutate: refreshWooStatus, isPending: refreshWooLoading } = useMutation({
    mutationFn: refreshWooCommerceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "WooCommerce status refreshed" });
    },
    onError: () => {
      toast({ title: "Failed to refresh WooCommerce status", variant: "destructive" });
    },
  });
  const { mutate: refreshNoest, isPending: refreshNoestLoading } = useMutation({
    mutationFn: () => refreshNoestStatuses(companyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["noest-statuses"] });
      toast({
        title: "NOEST statuses refreshed",
        description: `Checked ${data.data?.checked || 0} orders, ${data.data?.with_activity || 0} with activity, updated ${data.data?.updated || 0}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to refresh NOEST statuses",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const { mutate: syncDispatching, isPending: syncLoading } = useMutation({
    mutationFn: syncDispatchingOrders,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Dispatching orders synced",
        description: `Updated ${data.data?.updated_to_deliviring || 0} orders to delivering`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to sync dispatching orders",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const phoneSearchProvider =
    selectedShippingProvider === undefined ? "all" : selectedShippingProvider;
  const phoneSearchEnabled = phonePaletteOpen && phoneQuery.length >= 3 && companyId > 0;
  const { data: phoneMatchesRes, isFetching: phoneMatchesLoading, isPending: phoneMatchesPending } = useQuery({
    queryKey: ["orders-phone-matches", companyId, phoneQuery, phoneSearchProvider],
    queryFn: () =>
      getWooCommerceOrders({
        _page: 0,
        limit: 30,
        phone_number: phoneQuery,
        company_id: companyId,
        shipping_provider: phoneSearchProvider,
      }),
    enabled: phoneSearchEnabled,
    placeholderData: (previous) => previous,
  });
  const phoneMatches = phoneMatchesRes?.data?.orders ?? [];
  const phoneMatchTotal = phoneMatchesRes?.data?.meta?.total_items ?? phoneMatches.length;
  const groupedPhoneMatches = useMemo(() => {
    const groups = new Map<string, WooOrder[]>();
    for (const order of phoneMatches) {
      const key = order.order_status || "unknown";
      const list = groups.get(key) ?? [];
      list.push(order);
      groups.set(key, list);
    }
    const ordered = STAGES.map((stage) => stage.value).filter((value) => groups.has(value));
    for (const key of groups.keys()) {
      if (!ordered.includes(key)) ordered.push(key);
    }
    return ordered.map((value) => ({
      stage: STAGES.find((stage) => stage.value === value),
      orders: groups.get(value) ?? [],
    }));
  }, [phoneMatches]);
  const flatPhoneMatches = groupedPhoneMatches.flatMap((group) => group.orders);

  useEffect(() => {
    setPhoneHighlight(0);
  }, [phoneQuery, phoneMatches.length]);

  const pickPhoneMatch = (order: WooOrder) => {
    setPhonePaletteOpen(false);
    setDetailsOrder(order);
  };

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.label.localeCompare(b.label)),
    []
  );
  const showYalidineTools = selectedShippingProvider !== "noest";
  const showNoestTools = selectedShippingProvider === "noest" || selectedShippingProvider === undefined;
  const showCarrierStatus = selectedShippingProvider !== "my_companies";
  const selectedUserName = users.find((user: User) => user.ID === selectedUser)?.full_name;
  const selectedFranchiseName = franchises.find((franchise) => franchise.ID === selectedFranchise)?.name;
  const selectedVariant = allVariants.find((variant) => variant.ID === selectedConfirmedVariant);
  const carrierStatusLabelText = selectedCarrierStatus;

  const chips = [
    selectedUserName && { key: "user", label: selectedUserName, clear: () => setSelectedUser(undefined) },
    selectedWilaya && { key: "wilaya", label: wilayaLabel(selectedWilaya), clear: () => setSelectedWilaya(undefined) },
    carrierStatusLabelText && {
      key: "carrier-status",
      label: carrierStatusLabelText,
      clear: () => setSelectedCarrierStatus(undefined),
    },
    selectedVariant && {
      key: "variant",
      label: [selectedVariant.product?.name, selectedVariant.color, selectedVariant.size].filter(Boolean).join(" "),
      clear: () => setSelectedConfirmedVariant(undefined),
    },
    selectedFranchiseName && {
      key: "franchise",
      label: selectedFranchiseName,
      clear: () => setSelectedFranchise(undefined),
    },
    debouncedPhoneNumber && {
      key: "phone",
      label: debouncedPhoneNumber,
      clear: () => {
        setPhoneNumber("");
        setDebouncedPhoneNumber("");
      },
    },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => Boolean(chip));

  const yalidineReconciliationFilters = useMemo(
    () => ({
      status: selectedStatus,
      company_id: String(companyId),
      taken_by_id: selectedUser !== undefined ? String(selectedUser) : "",
      wilaya: selectedWilaya ?? "",
      phone_number: debouncedPhoneNumber,
      shipping_provider:
        selectedShippingProvider === "my_companies" || selectedShippingProvider === "noest"
          ? selectedShippingProvider
          : "",
      yalidine_status: selectedCarrierStatus ?? "",
      product_variant_id:
        selectedConfirmedVariant !== undefined ? String(selectedConfirmedVariant) : "",
    }),
    [
      selectedStatus,
      companyId,
      selectedUser,
      selectedWilaya,
      debouncedPhoneNumber,
      selectedShippingProvider,
      selectedCarrierStatus,
      selectedConfirmedVariant,
    ]
  );

  if (!company) {
    return <div className="p-6 text-sm text-muted-foreground">No company selected</div>;
  }

  const filterFields = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <FilterSelect
        label="User"
        value={selectedUser !== undefined ? String(selectedUser) : "all"}
        onChange={(value) => setSelectedUser(value === "all" ? undefined : Number(value))}
        options={[{ value: "all", label: "All users" }, ...users.map((user: User) => ({ value: String(user.ID), label: user.full_name }))]}
      />
      <FilterSelect
        label="Wilaya"
        value={selectedWilaya || "all"}
        onChange={(value) => setSelectedWilaya(value === "all" ? undefined : value)}
        options={[{ value: "all", label: "All wilayas" }, ...sortedCities.map((city) => ({ value: city.key, label: city.label }))]}
      />
      <FilterSelect
        label="Ship-from franchise"
        value={selectedFranchise ? String(selectedFranchise) : "all"}
        onChange={(value) => setSelectedFranchise(value === "all" ? undefined : Number(value))}
        options={[
          { value: "all", label: "All franchises" },
          ...franchises.map((franchise) => ({ value: String(franchise.ID), label: franchise.name })),
        ]}
      />
      <div className="flex flex-col gap-2">
        <Label>Confirmed item</Label>
        <ProductVariantCombobox
          variants={allVariants}
          value={selectedConfirmedVariant}
          onChange={setSelectedConfirmedVariant}
          placeholder="Any item"
          extraText={inventoryData?.data?.items
            .find((item) => item.product_variant_id === selectedConfirmedVariant)
            ?.quantity.toString()}
        />
      </div>
      {showCarrierStatus && (
        <FilterSelect
          label={selectedShippingProvider === "noest" ? "NOEST status" : "Yalidine status"}
          value={selectedCarrierStatus || "all"}
          onChange={(value) => setSelectedCarrierStatus(value === "all" ? undefined : value)}
          options={
            selectedShippingProvider === "noest"
              ? [
                  { value: "all", label: "All NOEST statuses" },
                  ...noestStatuses.map((option) => ({ value: option.status, label: `${option.status} (${option.count})` })),
                ]
              : [
                  { value: "all", label: "All Yalidine statuses" },
                  ...Object.values(YALIDINE_STATUSES).map((status) => ({ value: status, label: status })),
                ]
          }
        />
      )}
    </div>
  );

  const activeStage = STAGES.find((stage) => stage.value === selectedStatus);

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/25" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-rose-400/30 blur-3xl dark:bg-rose-500/20" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
      </div>
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <AppBarBackButton destination="Menu" />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{company.company_name}</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{activeStage?.label ?? "orders"}</span>
              {statusCountData?.data?.total_orders != null && (
                <>
                  {" "}
                  · {statusCountData.data.total_orders.toLocaleString()} in this range
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" type="button" className="bg-background">
                <MoreHorizontal />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem disabled={isModerator} onSelect={() => setShuffleOpen(true)}>
                Shuffle orders
              </DropdownMenuItem>
              {!isModerator && (
                <DropdownMenuItem onSelect={() => setImportCSVOpen(true)}>
                  <Upload />
                  Import CSV
                </DropdownMenuItem>
              )}
              <div className="px-2 py-1.5">
                <CreateRandomOrdersDevButton companyId={company.ID} />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" onClick={() => setCreateOrderOpen(true)}>
            <Plus />
            Create order
          </Button>
        </div>
      </header>

      <Card className={liquidGlass} aria-label="Order pipeline">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Pipeline</CardTitle>
            <CardDescription>Choose a stage to load that queue.</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className={cn("w-full justify-start bg-background sm:w-auto", !dateRange && "text-muted-foreground")}
              >
                <CalendarDays />
                {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "d MMM yyyy")} – ${format(dateRange.to, "d MMM yyyy")}`
                    : format(dateRange.from, "d MMM yyyy")
                  : "Last 30 days"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={isMobile ? 1 : 2}
              />
              <div className="flex justify-end border-t p-2">
                <Button size="sm" variant="ghost" type="button" onClick={() => setDateRange(undefined)}>
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label="Order stage">
          {countsLoading
            ? STAGES.map((stage) => <Skeleton key={stage.value} className="h-[5.5rem] rounded-xl" />)
            : STAGES.map((stage) => {
                const Icon = stage.icon;
                const selected = selectedStatus === stage.value;
                return (
                  <button
                    key={stage.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setSelectedStatus(stage.value)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left shadow-sm backdrop-blur-md",
                      "motion-safe:transition motion-safe:duration-200 hover:shadow-md active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      stage.surfaceClass,
                      selected && stage.selectedClass
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", stage.iconClass)}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xl font-semibold leading-none tabular-nums tracking-tight">
                        {(counts.get(stage.value) ?? 0).toLocaleString()}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-current/70">
                        {stage.label}
                      </span>
                    </span>
                  </button>
                );
              })}
        </div>
        </CardContent>
        {(isAdministrator || isModerator) && (
          <Accordion type="single" collapsible className="space-y-2 px-6 pb-4">
            <AccordionItem value="manager-statistics" className="rounded-xl border border-indigo-200/70 bg-indigo-50/50 px-3 dark:border-indigo-400/20 dark:bg-indigo-500/10">
              <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
                <span className="flex items-center gap-2.5 text-left">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100">
                    <ClipboardCheck className="size-4" />
                  </span>
                  <span>
                    <span className="block font-semibold">Manager statistics</span>
                    <span className="block text-xs font-normal text-muted-foreground">Orders each manager confirmed, by current status</span>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <ManagerStatusCards
                  wilaya={selectedWilaya}
                  shippingProvider={selectedShippingProvider}
                  companyId={company.ID}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="taken-by-statistics" className="rounded-xl border border-violet-200/70 bg-violet-50/50 px-3 dark:border-violet-400/20 dark:bg-violet-500/10">
              <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
                <span className="flex items-center gap-2.5 text-left">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100">
                    <Hand className="size-4" />
                  </span>
                  <span>
                    <span className="block font-semibold">Taken-by statistics</span>
                    <span className="block text-xs font-normal text-muted-foreground">Orders each user took, by current status</span>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <ManagerStatusCards
                  groupBy="taken_by"
                  wilaya={selectedWilaya}
                  shippingProvider={selectedShippingProvider}
                  companyId={company.ID}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </Card>

      <Card className={liquidGlass} aria-label="Filters">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find orders</CardTitle>
          <CardDescription>Phone search lists every match and its status. Other filters narrow the current stage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="space-y-2">
              <Label>Carrier</Label>
              <div role="group" aria-label="Shipping provider" className="inline-flex flex-wrap rounded-xl bg-muted p-1">
                {PROVIDERS.map((provider) => {
                  const selected =
                    (provider.value === "all" && selectedShippingProvider === undefined) ||
                    selectedShippingProvider === provider.value;
                  return (
                    <button
                      key={provider.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedShippingProvider(provider.value === "all" ? undefined : provider.value);
                        setSelectedCarrierStatus(undefined);
                      }}
                      className={cn(
                        "min-h-9 cursor-pointer rounded-lg border border-transparent px-3 text-sm font-medium motion-safe:transition-colors",
                        providerChipClass(provider.value, selected)
                      )}
                    >
                      {provider.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex min-w-[16rem] flex-1 flex-col gap-2">
              <Label htmlFor="orders-phone">Phone</Label>
              <Button
                id="orders-phone"
                type="button"
                variant="outline"
                onClick={() => setPhonePaletteOpen(true)}
                className={cn(
                  "justify-start bg-white/70 font-normal backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15",
                  debouncedPhoneNumber ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Search />
                {debouncedPhoneNumber || "Search every status"}
              </Button>
              <Dialog open={phonePaletteOpen} onOpenChange={setPhonePaletteOpen}>
                <DialogContent className={cn("max-w-xl gap-0 overflow-hidden p-0 sm:p-0", liquidGlass)}>
                  <DialogHeader className="space-y-1 border-b border-white/40 px-4 py-4 pr-10 text-left dark:border-white/10">
                    <DialogTitle>Find an order by phone</DialogTitle>
                    <DialogDescription>Matches from every status, in one list.</DialogDescription>
                  </DialogHeader>
                  <div className="border-b border-white/40 px-4 py-3 dark:border-white/10">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoFocus
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={phonePaletteOpen}
                        aria-controls="orders-phone-matches"
                        aria-autocomplete="list"
                        placeholder="Type a phone number, then pause"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        onKeyDown={(event) => {
                          if (!flatPhoneMatches.length) return;
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            setPhoneHighlight((index) => (index + 1) % flatPhoneMatches.length);
                          } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            setPhoneHighlight((index) => (index - 1 + flatPhoneMatches.length) % flatPhoneMatches.length);
                          } else if (event.key === "Enter") {
                            event.preventDefault();
                            const match = flatPhoneMatches[phoneHighlight];
                            if (match) pickPhoneMatch(match);
                          }
                        }}
                        className="bg-white/70 pl-9 backdrop-blur-md dark:bg-white/10"
                      />
                    </div>
                  </div>
                  <div id="orders-phone-matches" role="listbox" aria-label="Phone matches" className="max-h-80 overflow-y-auto p-2">
                    {phoneNumber.trim().length < 3 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">Type at least 3 digits to search every status.</p>
                    ) : phoneMatchesPending && phoneMatchesLoading ? (
                      <div className="space-y-2 p-2" aria-busy="true">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </div>
                    ) : flatPhoneMatches.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">No orders match this phone.</p>
                    ) : (
                      <>
                        <p className="px-2 py-1.5 text-xs text-muted-foreground">
                          {phoneMatchesLoading ? "Searching…" : `${phoneMatchTotal.toLocaleString()} match${phoneMatchTotal === 1 ? "" : "es"} across all statuses`}
                          {!phoneMatchesLoading && phoneMatchTotal > flatPhoneMatches.length ? ` · showing ${flatPhoneMatches.length}` : ""}
                        </p>
                        {groupedPhoneMatches.map((group) => {
                          const StageIcon = group.stage?.icon ?? Package;
                          return (
                            <div key={group.stage?.value ?? group.orders[0]?.order_status} className="mb-1">
                              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                                <StageIcon className="size-3.5" />
                                {group.stage?.label ?? group.orders[0]?.order_status}
                                <span>{group.orders.length}</span>
                              </div>
                              {group.orders.map((order) => {
                                const index = flatPhoneMatches.findIndex((item) => item.id === order.id);
                                const selected = index === phoneHighlight;
                                return (
                                  <button
                                    key={order.id}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onMouseEnter={() => setPhoneHighlight(index)}
                                    onClick={() => pickPhoneMatch(order)}
                                    className={cn(
                                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left",
                                      selected && "bg-white/70 dark:bg-white/10"
                                    )}
                                  >
                                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", group.stage?.iconClass)}>
                                      <StageIcon className="size-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-medium">
                                        {order.shipping_name || order.billing_name || "No name"}
                                      </span>
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {order.customer_phone}
                                        {order.customer_phone_2 ? ` · ${order.customer_phone_2}` : ""}
                                        {" · #"}
                                        {order.id}
                                        {order.tracking_number ? ` · ${order.tracking_number}` : ""}
                                      </span>
                                    </span>
                                    <Badge variant="outline" className={cn("shrink-0", group.stage?.surfaceClass)}>
                                      {group.stage?.label ?? order.order_status}
                                    </Badge>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {detailsOrder && (
                <OrderDetailsDialog
                  order={detailsOrder}
                  open
                  setOpen={(open) => {
                    if (!open) setDetailsOrder(null);
                  }}
                />
              )}
            </div>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" className="bg-background lg:hidden">
                  <SlidersHorizontal />
                  Filters
                  {chips.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {chips.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{filterFields}</div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:block">{filterFields}</div>
        </div>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium motion-safe:transition-colors hover:bg-accent"
              >
                {chip.label}
                <X className="size-3" />
                <span className="sr-only">Remove {chip.label}</span>
              </button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(undefined);
                setSelectedWilaya(undefined);
                setSelectedCarrierStatus(undefined);
                setSelectedConfirmedVariant(undefined);
                setSelectedFranchise(undefined);
                setPhoneNumber("");
                setDebouncedPhoneNumber("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
        </CardContent>
      </Card>

      <section
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5",
          liquidGlass,
          selectedRows.length > 0 && "ring-2 ring-white/40 dark:ring-white/20"
        )}
        aria-label={selectedRows.length > 0 ? "Selected orders" : "Carrier tools"}
      >
        {selectedRows.length > 0 ? (
          <>
            <span className="px-1 text-sm font-medium">{selectedRows.length} selected</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={actionTone.assign}
              disabled={isModerator}
              onClick={() => setAssignOpen(true)}
            >
              <UserRound />
              Assign
            </Button>
            <Button type="button" size="sm" variant="outline" className={actionTone.bulk} onClick={() => setBulkDialogOpen(true)}>
              <Layers />
              Bulk
            </Button>
            {showYalidineTools && (
              <Button type="button" size="sm" variant="outline" className={actionTone.duplicate} onClick={() => setDuplicateParcelsOpen(true)}>
                <Copy />
                Duplicate parcels
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedRows([])}>
              <X />
              Clear
            </Button>
          </>
        ) : (
          <>
            <Button type="button" size="sm" variant="outline" className={actionTone.refresh} disabled={refreshWooLoading} onClick={() => refreshWooStatus()}>
              {refreshWooLoading ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              Refresh status
            </Button>
            {showNoestTools && (
              <Button type="button" size="sm" variant="outline" className={actionTone.noest} disabled={refreshNoestLoading} onClick={() => refreshNoest()}>
                {refreshNoestLoading ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
                Refresh NOEST
              </Button>
            )}
            {showYalidineTools && selectedStatus === "dispaching" && (
              <Button type="button" size="sm" variant="outline" className={actionTone.yalidine} disabled={syncLoading} onClick={() => syncDispatching()}>
                {syncLoading ? <Loader2 className="animate-spin" /> : <Truck />}
                Sync with Yalidine
              </Button>
            )}
            {showYalidineTools && (
              <Button type="button" size="sm" variant="outline" className={actionTone.yalidine} onClick={() => setYalidineReconciliationOpen(true)}>
                <Scale />
                Reconcile Yalidine
              </Button>
            )}
            {showYalidineTools && (
              <Button type="button" size="sm" variant="outline" className={actionTone.deleted} onClick={() => setDeletedParcelReconciliationOpen(true)}>
                <Trash2 />
                Deleted Yalidine parcel
              </Button>
            )}
            <YalidineLabelsDrawer companyId={company.ID} triggerClassName={actionTone.labels} />
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page size</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[5.5rem]" aria-label="Page size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card className={cn("overflow-hidden", liquidGlass)}>
        <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{activeStage?.label ?? "Orders"}</CardTitle>
            <CardDescription>
              {meta?.total_items != null
                ? `${meta.total_items.toLocaleString()} orders`
                : "Loading the queue"}
            </CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-3 sm:p-4">
      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={deskColumns}
          data={orders}
          searchColumn="phone"
          searchBar={false}
          getRowId={(row) => String(row.id)}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          paginationMeta={meta}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          emptyState="No orders in this stage."
          showSelectionSummary={false}
        />
      )}
        </CardContent>
      </Card>

      {!isModerator && (
        <>
          <ShuffleOrdersDialog
            open={shuffleOpen}
            onClose={() => setShuffleOpen(false)}
            users={users}
            orders={orders || []}
            onSubmit={(data) => shuffleOrdersMutation(data)}
          />
          <AssignOrdersDialog
            open={assignOpen}
            onClose={() => setAssignOpen(false)}
            users={users}
            orderIds={selectedRows.map(Number)}
            onSubmit={(data) => assignOrdersMutation(data)}
          />
        </>
      )}
      <BulkOperationsDialog
        open={bulkDialogOpen}
        setOpen={setBulkDialogOpen}
        selectedCount={selectedRows.length}
        onDispatch={() => {
          dispatchOrders(selectedRows.map(Number));
          setSelectedRows([]);
        }}
        onExport={() => {
          exportOrders(selectedRows.map(Number));
          setSelectedRows([]);
        }}
        dispatchLoading={dispatchLoading}
        exportLoading={exportLoading}
      />
      {!isModerator && <ImportOrdersCSVDialog open={importCSVOpen} setOpen={setImportCSVOpen} />}
      <CreateOrderFromScratchDialog open={createOrderOpen} setOpen={setCreateOrderOpen} />
      <YalidineReconciliationDialog
        open={yalidineReconciliationOpen}
        setOpen={setYalidineReconciliationOpen}
        filters={yalidineReconciliationFilters}
      />
      <YalidineDuplicateParcelsDialog
        open={duplicateParcelsOpen}
        setOpen={setDuplicateParcelsOpen}
        orderIds={selectedRows.map(Number)}
      />
      <DeletedParcelReconciliationDialog
        open={deletedParcelReconciliationOpen}
        setOpen={setDeletedParcelReconciliationOpen}
        filters={yalidineReconciliationFilters}
      />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
