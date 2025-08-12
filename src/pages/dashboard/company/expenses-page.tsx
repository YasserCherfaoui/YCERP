import { RootState } from "@/app/store";
import ExpenseForm from "@/components/feature-specific/expenses/expense-form";
import ExpensesAppBar from "@/components/feature-specific/expenses/expenses-app-bar";
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
import { getDeliveredAggregates, sumExpenses } from "@/services/expense-reports-service";
import { approveExpense, createExpense, deleteExpense, listExpenses, markExpensePaid, updateExpense } from "@/services/expenses-service";
import { getWooCommerceOrders } from "@/services/woocommerce-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "categories" ? "categories" : "expenses";
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
  const computeCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: start, to: end } as { from: Date; to: Date };
  };
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(computeCurrentMonthRange());
  const [analyticsRange, setAnalyticsRange] = useState<{ from?: Date; to?: Date }>({ from: computeCurrentMonthRange().from, to: computeCurrentMonthRange().to });

  const toYmd = (d?: Date) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10) : undefined);
  const toIso = (d?: Date, endOfDay = false) => {
    if (!d) return undefined;
    const dt = new Date(d);
    if (endOfDay) dt.setHours(23, 59, 59, 999); else dt.setHours(0, 0, 0, 0);
    return dt.toISOString();
  };
  const computeBounds = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from && !range?.to) return { start: undefined as string | undefined, end: undefined as string | undefined };
    const from = range?.from ? new Date(range.from) : undefined;
    const to = range?.to ? new Date(range.to) : from;
    if (!from) return { start: undefined, end: undefined };
    const start = toIso(from, false);
    const end = toIso(to!, true);
    return { start, end };
  };
  const date_from = toYmd(dateRange?.from);
  const date_to = toYmd(dateRange?.to);

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

  const { data: returnedOrders } = useQuery({
    queryKey: ["returned-orders-count", companyId, date_from, date_to],
    queryFn: async () =>
      (await getWooCommerceOrders({ _page: 0, status: "returned", company_id: companyId, start: toIso(dateRange?.from), end: toIso(dateRange?.to, true) })).data,
    enabled: Boolean(companyId),
  });
  // Analytics Tab Queries
  const analyticsBounds = computeBounds(analyticsRange);
  const { data: yalidineDelivered } = useQuery({
    queryKey: ["analytics-delivered-yalidine", companyId, analyticsBounds.start, analyticsBounds.end],
    queryFn: async () => (await getWooCommerceOrders({ _page: 0, status: "delivered", company_id: companyId, shipping_provider: "yalidine", start: analyticsBounds.start, end: analyticsBounds.end })).data,
    enabled: Boolean(companyId),
  });
  const { data: myCompaniesDelivered } = useQuery({
    queryKey: ["analytics-delivered-my_companies", companyId, analyticsBounds.start, analyticsBounds.end],
    queryFn: async () => (await getWooCommerceOrders({ _page: 0, status: "delivered", company_id: companyId, shipping_provider: "my_companies", start: analyticsBounds.start, end: analyticsBounds.end })).data,
    enabled: Boolean(companyId),
  });

  // Delivered aggregates
  const { data: deliveredAgg } = useQuery({
    queryKey: ["delivered-aggregates", companyId, analyticsBounds.start?.slice(0,10), analyticsBounds.end?.slice(0,10)],
    queryFn: async () => (await getDeliveredAggregates({ company_id: companyId, start: analyticsBounds.start?.slice(0,10), end: analyticsBounds.end?.slice(0,10) })).data,
    enabled: Boolean(companyId),
  });
  const yalidineDeliveredAmount: number = (deliveredAgg as any)?.total_delivered_orders_amount_yalidine ?? 0;
  const myCompaniesDeliveredAmount: number = (deliveredAgg as any)?.total_delivered_orders_amount_my_companies ?? 0;
  const totalDeliveredAmountApi: number = (deliveredAgg as any)?.total_delivered_orders_amount ?? (yalidineDeliveredAmount + myCompaniesDeliveredAmount);
  const benefitsYalidine: number = (deliveredAgg as any)?.total_benefits_yalidine ?? 0;
  const benefitsMyCompanies: number = (deliveredAgg as any)?.total_benefits_my_companies ?? 0;
  const benefitsTotal: number = (deliveredAgg as any)?.total_benefits ?? (benefitsYalidine + benefitsMyCompanies);

  const totalDeliveredCount = (yalidineDelivered?.meta?.total_items || yalidineDelivered?.orders?.length || 0) + (myCompaniesDelivered?.meta?.total_items || myCompaniesDelivered?.orders?.length || 0);
  const totalDeliveredAmount = totalDeliveredAmountApi;

  // Analytics: Expenses and Returns (same logic as above but using analytics range)
  const { data: sumResAnalytics } = useQuery({
    queryKey: ["expenses-sum-analytics", companyId, analyticsBounds.start?.slice(0,10), analyticsBounds.end?.slice(0,10)],
    queryFn: async () => (await sumExpenses({ company_id: companyId, start: analyticsBounds.start?.slice(0,10), end: analyticsBounds.end?.slice(0,10) })).data,
    enabled: Boolean(companyId),
  });
  const { data: returnedOrdersAnalytics } = useQuery({
    queryKey: ["returned-orders-count-analytics", companyId, analyticsBounds.start, analyticsBounds.end],
    queryFn: async () => (await getWooCommerceOrders({ _page: 0, status: "returned", company_id: companyId, start: analyticsBounds.start, end: analyticsBounds.end })).data,
    enabled: Boolean(companyId),
  });

  const expensesSumAnalytics = (sumResAnalytics as any)?.total ?? 0;
  const returnedCountAnalytics = returnedOrdersAnalytics?.meta?.total_items ?? (returnedOrdersAnalytics?.orders?.length || 0);
  // TODO: Replace the static unit cost if server provides cost per return
  const returnedCostAnalytics = returnedCountAnalytics * 100;
  const totalExpensesAnalytics = expensesSumAnalytics + returnedCostAnalytics;


  const returnedCount = returnedOrders?.meta?.total_items ?? (returnedOrders?.orders?.length || 0);
  const returnedCost = returnedCount * 100;
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
            date={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range: any) => {
              const from = range?.from ?? dateRange.from;
              const to = range?.to ?? range?.from ?? dateRange.to;
              setDateRange({ from, to });
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
            <div className="text-xs text-muted-foreground">{returnedCount} returned × 100 DZD</div>
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
                date={{ from: analyticsRange?.from, to: analyticsRange?.to }}
                onSelect={(range: any) => {
                  const from = range?.from ?? analyticsRange?.from;
                  const to = range?.to ?? range?.from ?? analyticsRange?.to;
                  setAnalyticsRange({ from, to });
                }}
              />
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Yalidine's Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{yalidineDelivered ? (yalidineDelivered.meta?.total_items || yalidineDelivered.orders?.length || 0) : "-"}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total My Company's Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{myCompaniesDelivered ? (myCompaniesDelivered.meta?.total_items || myCompaniesDelivered.orders?.length || 0) : "-"}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Delivered Orders</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{totalDeliveredCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Yalidine's Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(yalidineDeliveredAmount)}</div>
                <div className="text-sm font-bold text-green-600 mt-1">Benefit: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(benefitsYalidine)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total My Company's Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(myCompaniesDeliveredAmount)}</div>
                <div className="text-sm font-bold text-green-600 mt-1">Benefit: {new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(benefitsMyCompanies)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Delivered Orders Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(totalDeliveredAmount)}</div>
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
                {/* TODO: Replace static unit cost calculation when server provides precise returned cost */}
                <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(returnedCostAnalytics)}</div>
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


