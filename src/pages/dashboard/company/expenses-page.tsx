import { RootState } from "@/app/store";
import ExpenseForm from "@/components/feature-specific/expenses/expense-form";
import ExpensesAppBar from "@/components/feature-specific/expenses/expenses-app-bar";
import DeliveryFeeCorrectionDialog from "@/components/feature-specific/expenses/delivery-fee-correction-dialog";
import DeliveredProductsSoldDialog from "@/components/feature-specific/expenses/delivered-products-sold-dialog";
import MissingLivreReconciliationDialog from "@/components/feature-specific/expenses/missing-livre-reconciliation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Expense, ExpensesListResponseData } from "@/models/data/expenses/expense.model";
import ExpensesCategoriesPage from "@/pages/dashboard/company/expenses-categories-page";
import { countReturnedOrders, downloadDeliveredOrdersCsv, downloadDeliveredProductsCsv, getDeliveredAggregates, sumExpenses } from "@/services/expense-reports-service";
import { approveExpense, createExpense, deleteExpense, listExpenses, markExpensePaid, updateExpense } from "@/services/expenses-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Package, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

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
  const totalDeliveredAmount: number = deliveredAgg?.total_delivered_orders_amount ?? (yalidineDeliveredAmount + myCompaniesDeliveredAmount);
  const yalidineDeliveredCount: number = deliveredAgg?.total_delivered_orders_count_yalidine ?? 0;
  const myCompaniesDeliveredCount: number = deliveredAgg?.total_delivered_orders_count_my_companies ?? 0;
  const totalDeliveredCount: number = deliveredAgg?.total_delivered_orders_count ?? (yalidineDeliveredCount + myCompaniesDeliveredCount);
  const benefitsYalidine: number = deliveredAgg?.total_benefits_yalidine ?? 0;
  const benefitsMyCompanies: number = deliveredAgg?.total_benefits_my_companies ?? 0;
  const benefitsTotal: number = deliveredAgg?.total_benefits ?? (benefitsYalidine + benefitsMyCompanies);

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

  const expensesSumAnalytics = (sumResAnalytics as any)?.total ?? 0;
  const returnedCountAnalytics = returnedOrdersAnalytics?.count ?? 0;
  const returnedCostAnalytics = returnedOrdersAnalytics?.cost ?? returnedCountAnalytics * 100;
  const totalExpensesAnalytics = expensesSumAnalytics + returnedCostAnalytics;

  const returnedCount = returnedOrdersCountRes?.count ?? 0;
  const returnedCost = returnedOrdersCountRes?.cost ?? returnedCount * 100;
  const expensesSum = (sumRes as any)?.total ?? 0;
  const totalWithReturns = expensesSum + returnedCost;
  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: any }) => updateExpense(payload.id, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return (
    <div className="p-4 space-y-4">
      <ExpensesAppBar onOpenCreateExpense={() => { const el = document.getElementById('open-create-expense'); el?.click(); }} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="space-y-4">
      <Card className="p-4 flex gap-3 items-end flex-wrap">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(expensesSum )}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Returned Orders Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(returnedCost )}</div>
            <div className="text-xs text-muted-foreground">{returnedCount} Yalidine return parcels × 100 DZD</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total + Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totalWithReturns / 100)}</div>
          </CardContent>
        </Card>
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
        <Card className="p-0 overflow-x-auto">
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
                  <td className="p-2">{e.status}</td>
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
          <Card className="p-4 flex gap-3 items-end flex-wrap">
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
              disabled={!analyticsEnabled}
              onClick={() => setMissingLivreOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconcile missing Livré
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!analyticsEnabled}
              onClick={() => setDeliveryFeeOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Correct delivery fees
            </Button>
            <Button
              type="button"
              variant="outline"
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
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Yalidine's Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{deliveredAgg ? yalidineDeliveredCount : "-"}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total My Company's Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{deliveredAgg ? myCompaniesDeliveredCount : "-"}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{deliveredAgg ? totalDeliveredCount : "-"}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Yalidine's Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(yalidineDeliveredAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{yalidineDeliveredCount} orders</div>
                <div className="text-sm font-bold text-green-600 mt-1">Benefit: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(benefitsYalidine)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total My Company's Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(myCompaniesDeliveredAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{myCompaniesDeliveredCount} orders</div>
                <div className="text-sm font-bold text-green-600 mt-1">Benefit: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(benefitsMyCompanies)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totalDeliveredAmount)}</div>
                <div className="text-xs text-muted-foreground mt-1">{totalDeliveredCount} orders</div>
                <div className="text-sm font-bold text-green-600 mt-1">Benefit: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(benefitsTotal)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Expenses Amount</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(expensesSumAnalytics)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Returned Cost</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(returnedCostAnalytics)}</div>
                <div className="text-xs text-muted-foreground mt-1">{returnedCountAnalytics} Yalidine return parcels × 100 DZD</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totalExpensesAnalytics)}</div></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


