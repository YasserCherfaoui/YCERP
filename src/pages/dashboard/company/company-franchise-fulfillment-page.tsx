import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { CompanyShipFromStoreCreateDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-create-dialog";
import { CompanyShipFromStoreEditDialog } from "@/components/feature-specific/ship-from-store/company-ship-from-store-edit-dialog";
import { createCompanyShipFromStoreColumns } from "@/components/feature-specific/ship-from-store/company-ship-from-store-columns";
import { companyFranchiseCommissionsColumns } from "@/components/feature-specific/ship-from-store/company-franchise-commissions-columns";
import { companyFranchiseFulfillmentOrdersColumns } from "@/components/feature-specific/ship-from-store/company-franchise-fulfillment-orders-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FranchiseCommissionsResponse } from "@/models/data/franchise-commission.model";
import {
  FRANCHISE_ORDER_STATUSES,
  FranchiseOrderStatus,
} from "@/models/data/woo-order.model";
import { ShipFromStore } from "@/models/data/ship-from-store.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import {
  FranchiseFulfillmentListParams,
  listCompanyFranchiseFulfillmentCommissions,
  listCompanyFranchiseFulfillmentOrders,
  listCompanyFranchiseFulfillmentShipments,
} from "@/services/franchise-fulfillment-service";
import {
  deleteShipFromStoreAdmin,
} from "@/services/ship-from-store-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  Coins,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";

const TAB_VALUES = ["shipments", "orders", "commissions"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value != null && (TAB_VALUES as readonly string[]).includes(value);
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);

const COMMISSION_STATUSES = ["pending", "approved", "cancelled"] as const;

const FRANCHISE_STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  dispatched: "Dispatched",
};

export default function CompanyFranchiseFulfillmentPage() {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const isAdmin = !isModerator;

  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const companyId = company?.ID ?? 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = isTabValue(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabValue)
    : "shipments";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const [franchiseFilter, setFranchiseFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [commissionStatus, setCommissionStatus] = useState<string>("all");
  const [franchiseOrderStatus, setFranchiseOrderStatus] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ShipFromStore | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<ShipFromStore | null>(null);

  const handleTabChange = (value: string) => {
    if (!isTabValue(value)) return;
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const listParams = useMemo((): FranchiseFulfillmentListParams => {
    const p: FranchiseFulfillmentListParams = { company_id: companyId };
    if (franchiseFilter) p.franchise_id = franchiseFilter;
    if (dateRange?.from) p.start = format(dateRange.from, "yyyy-MM-dd");
    if (dateRange?.to) p.end = format(dateRange.to, "yyyy-MM-dd");
    if (activeTab === "commissions" && commissionStatus !== "all") {
      p.status = commissionStatus;
    }
    if (activeTab === "orders" && franchiseOrderStatus !== "all") {
      p.franchise_order_status = franchiseOrderStatus;
    }
    return p;
  }, [
    companyId,
    franchiseFilter,
    dateRange,
    commissionStatus,
    franchiseOrderStatus,
    activeTab,
  ]);

  const filterKey = JSON.stringify(listParams);

  const { data: franchisesData } = useQuery({
    queryKey: ["company-franchises", companyId],
    queryFn: () => getMyCompanyFranchises(companyId),
    enabled: !!companyId,
  });
  const franchises = franchisesData?.data ?? [];

  const shipmentsQuery = useQuery({
    queryKey: ["company-franchise-fulfillment-shipments", filterKey],
    queryFn: () => listCompanyFranchiseFulfillmentShipments(listParams),
    enabled: !!companyId,
  });

  const ordersQuery = useQuery({
    queryKey: ["company-franchise-fulfillment-orders", filterKey],
    queryFn: () => listCompanyFranchiseFulfillmentOrders(listParams),
    enabled: !!companyId,
  });

  const commissionsQuery = useQuery({
    queryKey: ["company-franchise-fulfillment-commissions", filterKey],
    queryFn: () => listCompanyFranchiseFulfillmentCommissions(listParams),
    enabled: !!companyId,
  });

  const shipments = shipmentsQuery.data?.data ?? [];
  const orders: WooOrder[] = ordersQuery.data?.data ?? [];
  const commissionsData: FranchiseCommissionsResponse | undefined =
    commissionsQuery.data?.data;
  const commissions = commissionsData?.commissions ?? [];
  const totals = commissionsData?.totals;

  const orderStats = useMemo(() => {
    const open = orders.filter((order) => {
      const status = (order.order_status ?? "").toLowerCase();
      return !["delivered", "cancelled", "returned"].includes(status);
    }).length;
    return { total: orders.length, open };
  }, [orders]);

  const shipmentColumns = useMemo(
    () =>
      isAdmin
        ? createCompanyShipFromStoreColumns(
            (record) => setEditRecord(record),
            (record) => setDeleteRecord(record)
          )
        : createCompanyShipFromStoreColumns(),
    [isAdmin]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    try {
      await deleteShipFromStoreAdmin(deleteRecord.ID);
      toast({ title: "Deleted", description: "Record deleted." });
      queryClient.invalidateQueries({
        queryKey: ["company-franchise-fulfillment-shipments"],
      });
      setDeleteRecord(null);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  if (!company) {
    return <div>No company selected</div>;
  }

  const backLabel = isModerator ? "Menu" : "Control panel";

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AppBarBackButton destination={backLabel} />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{company.company_name}</span>
            <span className="text-xs text-muted-foreground">
              Franchise fulfillment
            </span>
          </div>
        </div>
        {isAdmin && activeTab === "shipments" && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New shipment
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={franchiseFilter?.toString() ?? "all"}
          onValueChange={(v) =>
            setFranchiseFilter(v === "all" ? undefined : parseInt(v, 10))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All franchises" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All franchises</SelectItem>
            {franchises.map((f) => (
              <SelectItem key={f.ID} value={String(f.ID)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} –{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
            <div className="flex justify-end border-t p-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDateRange(undefined)}
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {activeTab === "orders" && (
          <Select
            value={franchiseOrderStatus}
            onValueChange={setFranchiseOrderStatus}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Franchise status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All franchise statuses</SelectItem>
              {FRANCHISE_ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {FRANCHISE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {activeTab === "commissions" && (
          <Select value={commissionStatus} onValueChange={setCommissionStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Commission status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All commission statuses</SelectItem>
              {COMMISSION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="Shipments"
          value={shipments.length.toString()}
          hint="Ship-from-store records"
        />
        <SummaryCard
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          label="Franchise orders"
          value={orderStats.total.toString()}
          hint={`${orderStats.open} still active`}
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          label="Approved commissions"
          value={totals ? formatCurrency(totals.approved_amount) : "—"}
          hint="Delivered orders"
        />
        <SummaryCard
          icon={<Coins className="h-4 w-4 text-amber-500" />}
          label="Pending commissions"
          value={totals ? formatCurrency(totals.pending_amount) : "—"}
          hint="Awaiting delivery"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="shipments">
            <Package className="mr-2 h-4 w-4" />
            Shipments
            <Badge variant="secondary" className="ml-2">
              {shipments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
            <Badge variant="secondary" className="ml-2">
              {orders.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="commissions">
            <Receipt className="mr-2 h-4 w-4" />
            Commissions
            <Badge variant="secondary" className="ml-2">
              {commissions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {shipmentsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : shipmentsQuery.isError ? (
                <p className="text-sm text-destructive">Failed to load shipments.</p>
              ) : shipments.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title="No shipments"
                  description="No ship-from-store records match your filters."
                  actionLabel={isAdmin ? "New shipment" : undefined}
                  onAction={isAdmin ? () => setCreateOpen(true) : undefined}
                />
              ) : (
                <DataTable
                  data={shipments}
                  searchColumn="tracking_number"
                  columns={shipmentColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Franchise fulfillment orders</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : ordersQuery.isError ? (
                <p className="text-sm text-destructive">Failed to load orders.</p>
              ) : orders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="h-6 w-6" />}
                  title="No orders"
                  description="No franchise-assigned orders match your filters."
                />
              ) : (
                <DataTable
                  data={orders}
                  searchColumn="number"
                  columns={companyFranchiseFulfillmentOrdersColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="mt-4 space-y-4">
          <CommissionsTotals totals={totals} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Commissions ledger</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : commissionsQuery.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load commissions.
                </p>
              ) : commissions.length === 0 ? (
                <EmptyState
                  icon={<Receipt className="h-6 w-6" />}
                  title="No commissions"
                  description="No commission rows match your filters."
                />
              ) : (
                <DataTable
                  data={commissions}
                  columns={companyFranchiseCommissionsColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <>
          <CompanyShipFromStoreCreateDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            companyId={companyId}
          />
          <CompanyShipFromStoreEditDialog
            open={!!editRecord}
            onOpenChange={(open) => !open && setEditRecord(null)}
            record={editRecord}
            companyId={companyId}
          />
          <ConfirmDialog
            open={!!deleteRecord}
            onOpenChange={(open) => !open && setDeleteRecord(null)}
            title="Delete ship-from-store record?"
            description={
              deleteRecord
                ? `Tracking: ${deleteRecord.tracking_number}. This cannot be undone.`
                : undefined
            }
            confirmText="Delete"
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

function CommissionsTotals({
  totals,
}: {
  totals: FranchiseCommissionsResponse["totals"] | undefined;
}) {
  if (!totals) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <SummaryCard
        icon={<Coins className="h-4 w-4 text-amber-500" />}
        label="Pending"
        value={formatCurrency(totals.pending_amount)}
      />
      <SummaryCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        label="Approved"
        value={formatCurrency(totals.approved_amount)}
      />
      <SummaryCard
        icon={<XCircle className="h-4 w-4 text-rose-500" />}
        label="Cancelled"
        value={formatCurrency(totals.cancelled_amount)}
      />
      <SummaryCard
        icon={<Receipt className="h-4 w-4 text-primary" />}
        label="Net earnings"
        value={formatCurrency(totals.total_amount)}
        hint="Approved + pending"
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
