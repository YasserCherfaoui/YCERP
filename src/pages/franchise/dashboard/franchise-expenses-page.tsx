import { RootState } from "@/app/store";
import ExpenseForm from "@/components/feature-specific/expenses/expense-form";
import ExpensesAppBar from "@/components/feature-specific/expenses/expenses-app-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Expense, ExpensesListResponseData } from "@/models/data/expenses/expense.model";
import { sumExpenses } from "@/services/expense-reports-service";
import { approveExpense, createExpense, deleteExpense, listExpenses, markExpensePaid, updateExpense } from "@/services/expenses-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function FranchiseExpensesPage() {
  const queryClient = useQueryClient();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();
  
  type StatusFilter = "recorded" | "approved" | "paid" | "cancelled" | "";
  const [status, setStatus] = useState<StatusFilter>("");
  const [vendor, setVendor] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [sort, setSort] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">(
    (localStorage.getItem("franchise-expenses.sort") as any) || "date_desc"
  );

  // Date range default: current month start to end
  const computeCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: start, to: end } as { from: Date; to: Date };
  };
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(computeCurrentMonthRange());

  const toYmd = (d?: Date) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10) : undefined);
  const date_from = toYmd(dateRange?.from);
  const date_to = toYmd(dateRange?.to);

  const franchiseId = franchise?.ID ?? 0;

  const filters = useMemo(() => ({
    franchise_id: franchiseId,
    status: (status ? status : undefined) as "recorded" | "approved" | "paid" | "cancelled" | undefined,
    vendor: vendor || undefined,
    date_from,
    date_to,
    sort,
    page,
    limit,
  }), [franchiseId, status, vendor, date_from, date_to, page, limit, sort]);

  useEffect(() => {
    localStorage.setItem("franchise-expenses.sort", sort);
  }, [sort]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["franchise-expenses", filters],
    queryFn: async () => (await listExpenses(filters)).data as ExpensesListResponseData,
    enabled: Boolean(franchiseId),
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => approveExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["franchise-expenses"] }),
  });
  const paidMut = useMutation({
    mutationFn: (id: number) => markExpensePaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["franchise-expenses"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["franchise-expenses"] }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-expenses"] });
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
    queryKey: ["franchise-expenses-sum", franchiseId, date_from, date_to],
    queryFn: async () => (await sumExpenses({ franchise_id: franchiseId, start: date_from, end: date_to })).data,
    enabled: Boolean(franchiseId),
  });

  const expensesSum = (sumRes as any)?.total ?? 0;
  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: any }) => updateExpense(payload.id, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["franchise-expenses"] }),
  });

  if (!franchise) {
    return <div>Loading franchise...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <ExpensesAppBar onOpenCreateExpense={() => { const el = document.getElementById('open-create-expense'); el?.click(); }} />
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

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(expensesSum / 100)}</div>
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
              defaultValues={{ franchise_id: franchiseId, created_by: user?.ID || 1 }}
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
                            franchise_id: franchiseId,
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
    </div>
  );
}

