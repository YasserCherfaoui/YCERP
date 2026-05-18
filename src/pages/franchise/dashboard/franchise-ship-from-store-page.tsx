import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { franchiseCommissionsColumns } from "@/components/feature-specific/ship-from-store/franchise-commissions-columns";
import { franchiseShipFromOrdersColumns } from "@/components/feature-specific/ship-from-store/franchise-ship-from-orders-columns";
import { franchiseShipFromStoreColumns } from "@/components/feature-specific/ship-from-store/franchise-ship-from-store-columns";
import { ShipFromStoreDialog } from "@/components/feature-specific/ship-from-store/ship-from-store-dialog";
import { CompanyFranchiseWooRefundDetailDialog } from "@/components/feature-specific/woo-refund/company-franchise-woo-refund-detail-dialog";
import { createFranchiseWooRefundsColumns } from "@/components/feature-specific/woo-refund/franchise-woo-refunds-columns";
import {
  effectiveReimbursementStatus,
  totalOutstandingReimbursement,
} from "@/components/feature-specific/woo-refund/woo-refund-reimbursement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FranchiseCommissionsResponse } from "@/models/data/franchise-commission.model";
import { FranchiseWooRefund } from "@/models/data/franchise-woo-refund.model";
import { WooOrder } from "@/models/data/woo-order.model";
import {
  listFranchiseCommissions,
  listFranchiseWooOrders,
} from "@/services/franchise-service";
import { listShipFromStoreFranchise } from "@/services/ship-from-store-service";
import { listFranchiseWooRefunds } from "@/services/woo-refund-service";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Coins,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const TAB_VALUES = ["shipments", "orders", "commissions", "refunds"] as const;
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

export default function FranchiseShipFromStorePage() {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = isTabValue(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabValue)
    : "shipments";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailRefund, setDetailRefund] = useState<FranchiseWooRefund | null>(
    null
  );
  const [reimbursementFilter, setReimbursementFilter] = useState<string>("all");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (isTabValue(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    if (!isTabValue(value)) return;
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const shipmentsQuery = useQuery({
    queryKey: ["franchise-ship-from-store"],
    queryFn: listShipFromStoreFranchise,
    enabled: !!franchise,
  });

  const ordersQuery = useQuery({
    queryKey: ["franchise-woo-orders"],
    queryFn: listFranchiseWooOrders,
    enabled: !!franchise,
  });

  const commissionsQuery = useQuery({
    queryKey: ["franchise-commissions"],
    queryFn: listFranchiseCommissions,
    enabled: !!franchise,
  });

  const refundsQuery = useQuery({
    queryKey: ["franchise-woo-refunds", reimbursementFilter],
    queryFn: () =>
      listFranchiseWooRefunds({
        reimbursement_status:
          reimbursementFilter === "all" ? undefined : reimbursementFilter,
        limit: 200,
      }),
    enabled: !!franchise,
  });

  const allRefundsForOutstandingQuery = useQuery({
    queryKey: ["franchise-woo-refunds-outstanding"],
    queryFn: () => listFranchiseWooRefunds({ limit: 500 }),
    enabled: !!franchise,
  });

  const shipments = shipmentsQuery.data?.data ?? [];
  const orders: WooOrder[] = ordersQuery.data?.data ?? [];
  const commissionsData: FranchiseCommissionsResponse | undefined =
    commissionsQuery.data?.data;
  const commissions = commissionsData?.commissions ?? [];
  const totals = commissionsData?.totals;
  const refunds = refundsQuery.data?.data ?? [];

  const refundColumns = useMemo(
    () => createFranchiseWooRefundsColumns(setDetailRefund),
    []
  );

  const pendingPaybackTotal = useMemo(
    () =>
      totalOutstandingReimbursement(
        allRefundsForOutstandingQuery.data?.data ?? []
      ),
    [allRefundsForOutstandingQuery.data]
  );

  const orderStats = useMemo(() => {
    const open = orders.filter((order) => {
      const status = (order.order_status ?? "").toLowerCase();
      return !["delivered", "cancelled", "returned"].includes(status);
    }).length;
    return {
      total: orders.length,
      open,
    };
  }, [orders]);

  if (!franchise) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AppBarBackButton destination="Menu" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{franchise.name}</span>
            <span className="text-xs text-muted-foreground">
              Ship-from store hub
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="../woo-refund">
              <RotateCcw className="mr-2 h-4 w-4" />
              Web order refund
            </Link>
          </Button>
          {activeTab === "shipments" && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New shipment
            </Button>
          )}
        </div>
      </div>

      {activeTab === "refunds" && (
        <Select
          value={reimbursementFilter}
          onValueChange={setReimbursementFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Company payback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All refunds</SelectItem>
            <SelectItem value="pending">Awaiting company payment</SelectItem>
            <SelectItem value="paid">Paid by company</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="My shipments"
          value={shipments.length.toString()}
          hint="Records you submitted"
        />
        <SummaryCard
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          label="Assigned orders"
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
          <TabsTrigger value="refunds">
            <RotateCcw className="mr-2 h-4 w-4" />
            Refunds
            <Badge variant="secondary" className="ml-2">
              {refunds.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipments from my store</CardTitle>
            </CardHeader>
            <CardContent>
              {shipmentsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading shipments...</p>
              ) : shipmentsQuery.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load shipments.
                </p>
              ) : shipments.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title="No shipments yet"
                  description="Record shipments you send directly from your store."
                  actionLabel="New shipment"
                  onAction={() => setCreateDialogOpen(true)}
                />
              ) : (
                <DataTable
                  data={shipments}
                  searchColumn="tracking_number"
                  columns={franchiseShipFromStoreColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Orders shipping from my store
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              ) : ordersQuery.isError ? (
                <p className="text-sm text-destructive">Failed to load orders.</p>
              ) : orders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="h-6 w-6" />}
                  title="No assigned orders"
                  description="Orders flagged to ship from your store will appear here."
                />
              ) : (
                <DataTable
                  data={orders}
                  searchColumn="number"
                  columns={franchiseShipFromOrdersColumns}
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
                <p className="text-sm text-muted-foreground">
                  Loading commissions...
                </p>
              ) : commissionsQuery.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load commissions.
                </p>
              ) : commissions.length === 0 ? (
                <EmptyState
                  icon={<Receipt className="h-6 w-6" />}
                  title="No commissions yet"
                  description="You will earn a commission for each item delivered from an order you fulfilled."
                />
              ) : (
                <DataTable
                  data={commissions}
                  columns={franchiseCommissionsColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="mt-4 space-y-3">
          {pendingPaybackTotal > 0 && reimbursementFilter !== "paid" && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Company still owes you (cash you paid to customers)
                </p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(pendingPaybackTotal)}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Refunds at my store</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns processed here. Company payback status is updated by
                  headquarters.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="../woo-refund">
                  <Plus className="mr-2 h-4 w-4" />
                  New refund
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {refundsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading refunds...</p>
              ) : refundsQuery.isError ? (
                <p className="text-sm text-destructive">Failed to load refunds.</p>
              ) : refunds.length === 0 ? (
                <EmptyState
                  icon={<RotateCcw className="h-6 w-6" />}
                  title="No refunds yet"
                  description="Web order returns recorded at your store will appear here."
                />
              ) : (
                <DataTable
                  data={refunds}
                  searchColumn="order"
                  columns={refundColumns}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompanyFranchiseWooRefundDetailDialog
        refund={detailRefund}
        open={!!detailRefund}
        onOpenChange={(open) => !open && setDetailRefund(null)}
      />

      <ShipFromStoreDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
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
