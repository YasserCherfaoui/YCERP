import { RootState } from "@/app/store";
import ExpenseForm from "@/components/feature-specific/expenses/expense-form";
import ExpensesAppBar from "@/components/feature-specific/expenses/expenses-app-bar";
import DeliveryFeeCorrectionDialog from "@/components/feature-specific/expenses/delivery-fee-correction-dialog";
import DeliveredProductsSoldDialog from "@/components/feature-specific/expenses/delivered-products-sold-dialog";
import DeliveryEmployeePaymentsDialog from "@/components/feature-specific/expenses/delivery-employee-payments-dialog";
import MissingLivreReconciliationDialog from "@/components/feature-specific/expenses/missing-livre-reconciliation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Expense, ExpensesListResponseData } from "@/models/data/expenses/expense.model";
import ExpensesCategoriesPage from "@/pages/dashboard/company/expenses-categories-page";
import { getEmployeePaymentsSum } from "@/services/delivery-payments-service";
import { countReturnedOrders, downloadDeliveredOrdersCsv, downloadDeliveredProductsCsv, getDeliveredAggregates, sumExpenses } from "@/services/expense-reports-service";
import { approveExpense, createExpense, deleteExpense, listExpenses, markExpensePaid, updateExpense } from "@/services/expenses-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Banknote,
  BarChart3,
  Calculator,
  CircleDollarSign,
  Coins,
  Download,
  HandCoins,
  Package,
  PackageCheck,
  Receipt,
  RefreshCw,
  Send,
  Store,
  Tags,
  Truck,
  Undo2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const liquidGlass =
  "border border-white/40 bg-white/45 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.16)]";

const dzd = new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" });

function deliveryRateLabel(delivered: number, total: number): string {
  if (total <= 0) return "0/0 · 0%";
  const pct = Math.round(((delivered / total) * 100) * 10) / 10;
  const pctLabel = `${pct}%`;
  return `${delivered}/${total} · ${pctLabel}`;
}

function CreatedRangeRate({ ready, delivered, total }: { ready: boolean; delivered: number; total: number }) {
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{ready ? deliveryRateLabel(delivered, total) : "-"}</span>
      <span className="block">Delivered / orders created in range</span>
    </div>
  );
}

function GlassMetricCard({
  title,
  value,
  icon: Icon,
  iconClass,
  glowClass,
  children,
}: {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  iconClass: string;
  glowClass: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn("relative overflow-hidden", liquidGlass)}>
      <div aria-hidden className={cn("pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl", glowClass)} />
      <CardHeader className="relative flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium leading-snug">{title}</CardTitle>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm", iconClass)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="relative p-4 pt-0">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {children}
      </CardContent>
    </Card>
  );
}

function expenseStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100";
    case "approved":
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-100";
    case "cancelled":
      return "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-100";
    default:
      return "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100";
  }
}

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "categories" || tabParam === "analytics" ? tabParam : "expenses";
  const [tab, setTab] = useState<string>(initialTab);
  type StatusFilter = "recorded" | "approved" | "paid" | "cancelled" | "";
  const [status, setStatus] = useState<StatusFilter>("");
  const [vendor, setVendor] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [sort, setSort] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">(
    (localStorage.getItem("expenses.sort") as any) || "date_desc"
  );

  // Date range default: current month start to end
  const computeCurrentMonthRange = (): DateRange => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(computeCurrentMonthRange);
  const [analyticsRange, setAnalyticsRange] = useState<DateRange | undefined>(computeCurrentMonthRange);

  // Local calendar day as YYYY-MM-DD (never use toISOString — timezone shifts the day)
  const toYmd = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : undefined);
  /** Inclusive local-day bounds for APIs that take YYYY-MM-DD start/end */
  const computeYmdBounds = (range?: DateRange) => {
    if (!range?.from) return { start: undefined as string | undefined, end: undefined as string | undefined };
    const start = toYmd(range.from)!;
    const end = toYmd(range.to ?? range.from)!;
    return { start, end };
  };
  const date_from = toYmd(dateRange?.from);
  const date_to = toYmd(dateRange?.to ?? dateRange?.from);

  const companyId = company?.ID ?? 0;

  const filters = useMemo(() => ({
    company_id: companyId,
    status: (status ? status : undefined) as "recorded" | "approved" | "paid" | "cancelled" | undefined,
    vendor: vendor || undefined,
    date_from,
    date_to,
    sort,
    page,
    limit,
  }), [companyId, status, vendor, date_from, date_to, page, limit, sort]);

  useEffect(() => {
    localStorage.setItem("expenses.sort", sort);
  }, [sort]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (tab === "expenses") next.delete("tab"); else next.set("tab", tab);
    setSearchParams(next);
  }, [tab]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses", filters],
    queryFn: async () => (await listExpenses(filters)).data as ExpensesListResponseData,
    enabled: Boolean(companyId),
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => approveExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
  const paidMut = useMutation({
    mutationFn: (id: number) => markExpensePaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [missingLivreOpen, setMissingLivreOpen] = useState(false);
  const [deliveryFeeOpen, setDeliveryFeeOpen] = useState(false);
  const [productsSoldOpen, setProductsSoldOpen] = useState(false);
  const [employeePaymentsOpen, setEmployeePaymentsOpen] = useState(false);
  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense Created", description: "The expense was created successfully." });
      setCreateOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create expense",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  // Summary queries
  const { data: sumRes } = useQuery({
    queryKey: ["expenses-sum", companyId, date_from, date_to],
    queryFn: async () => (await sumExpenses({ company_id: companyId, start: date_from, end: date_to })).data,
    enabled: Boolean(companyId),
  });

  const { data: returnedOrdersCountRes } = useQuery({
    queryKey: ["returned-orders-count", companyId, date_from, date_to],
    queryFn: async () =>
      (await countReturnedOrders({
        company_id: companyId,
        start: date_from!,
        end: date_to!,
      })).data,
    enabled: Boolean(companyId && date_from && date_to),
  });

  // Analytics Tab Queries
  const analyticsYmdBounds = computeYmdBounds(analyticsRange);
  const analyticsEnabled = Boolean(companyId && analyticsYmdBounds.start && analyticsYmdBounds.end);

  // Delivered aggregates (amounts, counts, benefits — same delivery-date logic)
  const { data: deliveredAgg } = useQuery({
    queryKey: ["delivered-aggregates", companyId, analyticsYmdBounds.start, analyticsYmdBounds.end],
    queryFn: async () =>
      (await getDeliveredAggregates({
        company_id: companyId,
        start: analyticsYmdBounds.start,
        end: analyticsYmdBounds.end,
      })).data,
    enabled: analyticsEnabled,
  });
  const yalidineDeliveredAmount: number = deliveredAgg?.total_delivered_orders_amount_yalidine ?? 0;
  const myCompaniesDeliveredAmount: number = deliveredAgg?.total_delivered_orders_amount_my_companies ?? 0;
  const noestDeliveredAmount: number = deliveredAgg?.total_delivered_orders_amount_noest ?? 0;
  const totalDeliveredAmount: number = deliveredAgg?.total_delivered_orders_amount ?? (yalidineDeliveredAmount + myCompaniesDeliveredAmount + noestDeliveredAmount);
  const yalidineDeliveredCount: number = deliveredAgg?.total_delivered_orders_count_yalidine ?? 0;
  const myCompaniesDeliveredCount: number = deliveredAgg?.total_delivered_orders_count_my_companies ?? 0;
  const noestDeliveredCount: number = deliveredAgg?.total_delivered_orders_count_noest ?? 0;
  const totalDeliveredCount: number = deliveredAgg?.total_delivered_orders_count ?? (yalidineDeliveredCount + myCompaniesDeliveredCount + noestDeliveredCount);
  const benefitsYalidine: number = deliveredAgg?.total_benefits_yalidine ?? 0;
  const benefitsMyCompanies: number = deliveredAgg?.total_benefits_my_companies ?? 0;
  const benefitsNoest: number = deliveredAgg?.total_benefits_noest ?? 0;
  const benefitsTotal: number = deliveredAgg?.total_benefits ?? (benefitsYalidine + benefitsMyCompanies + benefitsNoest);
  const yalidineTotalOrders: number = deliveredAgg?.total_orders_yalidine ?? 0;
  const myCompaniesTotalOrders: number = deliveredAgg?.total_orders_my_companies ?? 0;
  const noestTotalOrders: number = deliveredAgg?.total_orders_noest ?? 0;
  const totalOrders: number = deliveredAgg?.total_orders ?? (yalidineTotalOrders + myCompaniesTotalOrders + noestTotalOrders);
  const yalidineCreatedDelivered: number = deliveredAgg?.created_delivered_orders_yalidine ?? 0;
  const myCompaniesCreatedDelivered: number = deliveredAgg?.created_delivered_orders_my_companies ?? 0;
  const noestCreatedDelivered: number = deliveredAgg?.created_delivered_orders_noest ?? 0;
  const totalCreatedDelivered: number = deliveredAgg?.created_delivered_orders ?? (yalidineCreatedDelivered + myCompaniesCreatedDelivered + noestCreatedDelivered);

  const exportDeliveredCsvMut = useMutation({
    mutationFn: downloadDeliveredOrdersCsv,
    onSuccess: () => {
      toast({ title: "CSV exported", description: "Delivered orders details downloaded." });
    },
    onError: (err: Error) => {
      toast({
        title: "Export failed",
        description: err?.message || "Could not export delivered orders CSV.",
        variant: "destructive",
      });
    },
  });

  const exportProductsCsvMut = useMutation({
    mutationFn: downloadDeliveredProductsCsv,
    onSuccess: () => {
      toast({ title: "CSV exported", description: "Confirmed products quantities downloaded." });
    },
    onError: (err: Error) => {
      toast({
        title: "Export failed",
        description: err?.message || "Could not export delivered products CSV.",
        variant: "destructive",
      });
    },
  });

  // Analytics: Expenses and Returns (same logic as above but using analytics range)
  const { data: sumResAnalytics } = useQuery({
    queryKey: ["expenses-sum-analytics", companyId, analyticsYmdBounds.start, analyticsYmdBounds.end],
    queryFn: async () =>
      (await sumExpenses({
        company_id: companyId,
        start: analyticsYmdBounds.start,
        end: analyticsYmdBounds.end,
      })).data,
    enabled: analyticsEnabled,
  });
  const { data: returnedOrdersAnalytics } = useQuery({
    queryKey: ["returned-orders-count-analytics", companyId, analyticsYmdBounds.start, analyticsYmdBounds.end],
    queryFn: async () =>
      (await countReturnedOrders({
        company_id: companyId,
        start: analyticsYmdBounds.start!,
        end: analyticsYmdBounds.end!,
      })).data,
    enabled: analyticsEnabled,
  });
  const { data: employeePaymentsSumRes } = useQuery({
    queryKey: ["employee-payments-sum", companyId, analyticsYmdBounds.start, analyticsYmdBounds.end],
    queryFn: async () =>
      (await getEmployeePaymentsSum({
        company_id: companyId,
        start: analyticsYmdBounds.start!,
        end: analyticsYmdBounds.end!,
      })).data,
    enabled: analyticsEnabled,
  });

  const expensesSumAnalytics = (sumResAnalytics as any)?.total ?? 0;
  const returnedCountAnalytics = returnedOrdersAnalytics?.count ?? 0;
  const returnedCostAnalytics = returnedOrdersAnalytics?.cost ?? returnedCountAnalytics * 100;
  const totalExpensesAnalytics = expensesSumAnalytics + returnedCostAnalytics;
  const employeePaymentsTotal = employeePaymentsSumRes?.total_amount ?? 0;
  const employeePaymentsCount = employeePaymentsSumRes?.count ?? 0;

  const returnedCount = returnedOrdersCountRes?.count ?? 0;
  const returnedCost = returnedOrdersCountRes?.cost ?? returnedCount * 100;
  const expensesSum = (sumRes as any)?.total ?? 0;
  const totalWithReturns = expensesSum + returnedCost;
  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: any }) => updateExpense(payload.id, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-rose-400/25 blur-3xl dark:bg-rose-500/15" />
        <div className="absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15" />
        <div className="absolute bottom-32 right-1/4 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />
      </div>
      <div className="relative space-y-4 p-4 sm:p-6">
      <ExpensesAppBar onOpenCreateExpense={() => { const el = document.getElementById('open-create-expense'); el?.click(); }} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className={cn(liquidGlass, "h-auto gap-1 p-1")}>
          <TabsTrigger value="expenses" className="gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/15">
            <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/15">
            <Tags className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/15">
            <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-300" />
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="space-y-4">
      <Card className={cn(liquidGlass, "flex flex-wrap items-end gap-3 p-4")}>
        <div className="w-48">
          <label className="text-sm">Status</label>
          <Select value={status || "__all__"} onValueChange={(v) => setStatus((v === "__all__" ? "" : (v as StatusFilter)))}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              <SelectItem value="recorded">Recorded</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <label className="text-sm">Vendor</label>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor" />
        </div>
        <div className="w-[320px]">
          <label className="text-sm block mb-1">Date Range</label>
          <DatePickerWithRange
            date={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              setPage(1);
            }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassMetricCard
          title="Total Expenses"
          value={dzd.format(expensesSum)}
          icon={Receipt}
          iconClass="border-amber-200/80 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-100"
          glowClass="bg-amber-400/40"
        />
        <GlassMetricCard
          title="Returned Orders Cost"
          value={dzd.format(returnedCost)}
          icon={Undo2}
          iconClass="border-rose-200/80 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-100"
          glowClass="bg-rose-400/40"
        >
          <div className="mt-1 text-xs text-muted-foreground">{returnedCount} Yalidine return parcels × 100 DZD</div>
        </GlassMetricCard>
        <GlassMetricCard
          title="Total + Returns"
          value={dzd.format(totalWithReturns / 100)}
          icon={Calculator}
          iconClass="border-violet-200/80 bg-violet-100 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-100"
          glowClass="bg-violet-400/40"
        />
      </div>

      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button id="open-create-expense" className="hidden">Create Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              mode="create"
              defaultValues={{ company_id: companyId, created_by: user?.ID || 1 }}
              submitting={createMut.isPending}
              onSubmit={async (values) => {
                await createMut.mutateAsync(values as any);
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={createMut.isPending} onClick={() => setCreateOpen(false)}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div>Loading expenses…</div>}
      {isError && <div className="text-red-500">{(error as Error)?.message || "Failed to load."}</div>}
      {!isLoading && data && (
        <Card className={cn(liquidGlass, "overflow-x-auto p-0")}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2 cursor-pointer" onClick={() => setSort(sort === 'amount_desc' ? 'amount_asc' : 'amount_desc')}>Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Vendor</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.expenses || []).map((e: Expense) => (
                <tr key={e.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
                   <td className="p-2 underline cursor-pointer" onClick={() => alert(JSON.stringify(e, null, 2))}>{e.title}</td>
                  <td className="p-2">{e.category}</td>
                  <td className="p-2">{(e.amount/100).toFixed(2)} {e.currency}</td>
                  <td className="p-2">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", expenseStatusClass(e.status))}>{e.status}</span>
                  </td>
                  <td className="p-2">{e.vendor}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => approveMut.mutate(e.id)} disabled={e.status !== 'recorded'}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => paidMut.mutate(e.id)} disabled={!(e.status === 'approved' || e.status === 'recorded')}>Mark Paid</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(e.id)}>Delete</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Expense</DialogTitle>
                        </DialogHeader>
                         <ExpenseForm
                          mode="edit"
                          defaultValues={{
                            company_id: companyId,
                            title: e.title,
                            description: e.description,
                            category: e.category,
                            amount: e.amount,
                            currency: e.currency,
                            date: e.date.split('T')[0],
                            payment_method: e.payment_method,
                            vendor: e.vendor,
                             updated_by: user?.ID || 1,
                          }}
                          submitting={updateMut.isPending}
                          onSubmit={async (values) => {
                            await updateMut.mutateAsync({ id: e.id, data: values as any });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-2">
            <div className="text-sm">Page {data.meta.current_page} / {data.meta.total_pages} • {data.meta.total_items} items</div>
            <div className="flex gap-2 items-center">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button size="sm" variant="outline" disabled={page >= data.meta.total_pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
        </TabsContent>
        <TabsContent value="categories">
          <ExpensesCategoriesPage />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className={cn(liquidGlass, "flex flex-wrap items-end gap-3 p-4")}>
            <div className="w-[320px]">
              <label className="text-sm block mb-1">Date</label>
              <DatePickerWithRange
                date={analyticsRange}
                onSelect={setAnalyticsRange}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/70 dark:text-red-100 dark:hover:bg-red-950"
              disabled={!analyticsEnabled || exportDeliveredCsvMut.isPending}
              onClick={() => {
                if (!analyticsYmdBounds.start || !analyticsYmdBounds.end) return;
                exportDeliveredCsvMut.mutate({
                  company_id: companyId,
                  start: analyticsYmdBounds.start,
                  end: analyticsYmdBounds.end,
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportDeliveredCsvMut.isPending ? "Exporting…" : "Export delivered CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100 dark:hover:bg-amber-950"
              disabled={!analyticsEnabled || exportProductsCsvMut.isPending}
              onClick={() => {
                if (!analyticsYmdBounds.start || !analyticsYmdBounds.end) return;
                exportProductsCsvMut.mutate({
                  company_id: companyId,
                  start: analyticsYmdBounds.start,
                  end: analyticsYmdBounds.end,
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportProductsCsvMut.isPending ? "Exporting…" : "Export products CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-100 dark:hover:bg-sky-950"
              disabled={!analyticsEnabled}
              onClick={() => setMissingLivreOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconcile missing Livré
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100 dark:hover:bg-emerald-950"
              disabled={!analyticsEnabled}
              onClick={() => setDeliveryFeeOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Correct delivery fees
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/70 dark:text-violet-100 dark:hover:bg-violet-950"
              disabled={!analyticsEnabled}
              onClick={() => setProductsSoldOpen(true)}
            >
              <Package className="mr-2 h-4 w-4" />
              Products sold
            </Button>
          </Card>
          {analyticsYmdBounds.start && analyticsYmdBounds.end && (
            <>
              <MissingLivreReconciliationDialog
                open={missingLivreOpen}
                setOpen={setMissingLivreOpen}
                companyId={companyId}
                start={analyticsYmdBounds.start}
                end={analyticsYmdBounds.end}
              />
              <DeliveryFeeCorrectionDialog
                open={deliveryFeeOpen}
                setOpen={setDeliveryFeeOpen}
                companyId={companyId}
                start={analyticsYmdBounds.start}
                end={analyticsYmdBounds.end}
              />
              <DeliveredProductsSoldDialog
                open={productsSoldOpen}
                setOpen={setProductsSoldOpen}
                companyId={companyId}
                start={analyticsYmdBounds.start}
                end={analyticsYmdBounds.end}
              />
              <DeliveryEmployeePaymentsDialog
                open={employeePaymentsOpen}
                setOpen={setEmployeePaymentsOpen}
                companyId={companyId}
                start={analyticsYmdBounds.start}
                end={analyticsYmdBounds.end}
              />
            </>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassMetricCard
              title="Total Yalidine's Delivered Orders"
              value={deliveredAgg ? yalidineDeliveredCount : "-"}
              icon={Truck}
              iconClass="border-red-200/80 bg-red-100 text-red-800 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-100"
              glowClass="bg-red-400/40"
            >
              <CreatedRangeRate ready={deliveredAgg?.total_orders_yalidine != null} delivered={yalidineCreatedDelivered} total={yalidineTotalOrders} />
            </GlassMetricCard>
            <GlassMetricCard
              title="Total My Company's Delivered Orders"
              value={deliveredAgg ? myCompaniesDeliveredCount : "-"}
              icon={Store}
              iconClass="border-emerald-200/80 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100"
              glowClass="bg-emerald-400/40"
            >
              <CreatedRangeRate ready={deliveredAgg?.total_orders_my_companies != null} delivered={myCompaniesCreatedDelivered} total={myCompaniesTotalOrders} />
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Noest's Delivered Orders"
              value={deliveredAgg ? noestDeliveredCount : "-"}
              icon={Send}
              iconClass="border-sky-200/80 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-100"
              glowClass="bg-sky-400/40"
            >
              <CreatedRangeRate ready={deliveredAgg?.total_orders_noest != null} delivered={noestCreatedDelivered} total={noestTotalOrders} />
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Delivered Orders"
              value={deliveredAgg ? totalDeliveredCount : "-"}
              icon={PackageCheck}
              iconClass="border-violet-200/80 bg-violet-100 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-100"
              glowClass="bg-violet-400/40"
            >
              <CreatedRangeRate ready={deliveredAgg?.total_orders != null} delivered={totalCreatedDelivered} total={totalOrders} />
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Yalidine's Delivered Orders Amount"
              value={dzd.format(yalidineDeliveredAmount)}
              icon={Banknote}
              iconClass="border-red-200/80 bg-red-100 text-red-800 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-100"
              glowClass="bg-red-400/35"
            >
              <div className="mt-1 text-xs text-muted-foreground">{yalidineDeliveredCount} orders</div>
              <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Benefit: {dzd.format(benefitsYalidine)}</div>
            </GlassMetricCard>
            <GlassMetricCard
              title="Total My Company's Delivered Orders Amount"
              value={dzd.format(myCompaniesDeliveredAmount)}
              icon={Coins}
              iconClass="border-emerald-200/80 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100"
              glowClass="bg-emerald-400/35"
            >
              <div className="mt-1 text-xs text-muted-foreground">{myCompaniesDeliveredCount} orders</div>
              <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Benefit: {dzd.format(benefitsMyCompanies)}</div>
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Noest's Delivered Orders Amount"
              value={dzd.format(noestDeliveredAmount)}
              icon={CircleDollarSign}
              iconClass="border-sky-200/80 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-100"
              glowClass="bg-sky-400/35"
            >
              <div className="mt-1 text-xs text-muted-foreground">{noestDeliveredCount} orders</div>
              <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Benefit: {dzd.format(benefitsNoest)}</div>
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Delivered Orders Amount"
              value={dzd.format(totalDeliveredAmount)}
              icon={Wallet}
              iconClass="border-indigo-200/80 bg-indigo-100 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-100"
              glowClass="bg-indigo-400/40"
            >
              <div className="mt-1 text-xs text-muted-foreground">{totalDeliveredCount} orders</div>
              <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Benefit: {dzd.format(benefitsTotal)}</div>
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Expenses Amount"
              value={dzd.format(expensesSumAnalytics)}
              icon={Receipt}
              iconClass="border-amber-200/80 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-100"
              glowClass="bg-amber-400/40"
            />
            <GlassMetricCard
              title="Total Returned Cost"
              value={dzd.format(returnedCostAnalytics)}
              icon={Undo2}
              iconClass="border-rose-200/80 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-100"
              glowClass="bg-rose-400/40"
            >
              <div className="mt-1 text-xs text-muted-foreground">{returnedCountAnalytics} Yalidine return parcels × 100 DZD</div>
            </GlassMetricCard>
            <GlassMetricCard
              title="Total Expenses"
              value={dzd.format(totalExpensesAnalytics)}
              icon={Calculator}
              iconClass="border-fuchsia-200/80 bg-fuchsia-100 text-fuchsia-800 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/20 dark:text-fuchsia-100"
              glowClass="bg-fuchsia-400/40"
            />
            <GlassMetricCard
              title="Total Collected from Delivery Employees"
              value={(
                <button
                  type="button"
                  className="text-left underline-offset-4 hover:underline disabled:cursor-default disabled:no-underline"
                  disabled={!analyticsEnabled}
                  onClick={() => setEmployeePaymentsOpen(true)}
                >
                  {dzd.format(employeePaymentsTotal)}
                </button>
              )}
              icon={HandCoins}
              iconClass="border-teal-200/80 bg-teal-100 text-teal-800 dark:border-teal-400/30 dark:bg-teal-500/20 dark:text-teal-100"
              glowClass="bg-teal-400/40"
            >
              <div className="mt-1 text-xs text-muted-foreground">{employeePaymentsCount} payment{employeePaymentsCount === 1 ? "" : "s"}</div>
            </GlassMetricCard>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}


