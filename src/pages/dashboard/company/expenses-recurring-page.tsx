import { RootState } from "@/app/store";
import RecurringExpenseForm from "@/components/feature-specific/expenses/recurring-expense-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecurringExpense } from "@/models/data/expenses/recurring-expense.model";
import { createRecurringExpense, deleteRecurringExpense, listRecurringExpenses, pauseRecurringExpense, resumeRecurringExpense, runRecurringExpenseNow, updateRecurringExpense } from "@/services/recurring-expenses-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function ExpensesRecurringPage() {
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);
  type RecStatus = "active" | "paused" | "ended" | "";
  const [status, setStatus] = useState<RecStatus>("");

  const companyId = company?.ID ?? 0;

  const filters = useMemo(() => ({
    company_id: companyId,
    status: (status ? status : undefined) as "active" | "paused" | "ended" | undefined,
  }), [companyId, status]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recurring-expenses", filters],
    queryFn: async () => (await listRecurringExpenses(filters)).data as RecurringExpense[],
    enabled: Boolean(companyId),
  });

  const pauseMut = useMutation({
    mutationFn: (id: number) => pauseRecurringExpense(id),
    onSuccess: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { description: 'Template paused' } }));
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
  const resumeMut = useMutation({
    mutationFn: (id: number) => resumeRecurringExpense(id),
    onSuccess: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { description: 'Template resumed' } }));
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
  const runNowMut = useMutation({
    mutationFn: (id: number) => runRecurringExpenseNow(id),
    onSuccess: () => {
      // Optionally, we could extract created expense id if backend returns it
      window.dispatchEvent(new CustomEvent('toast', { detail: { description: 'Generated current month expense' } }));
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteRecurringExpense(id),
    onSuccess: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { description: 'Template deleted' } }));
      queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
    },
  });

  const createMut = useMutation({
    mutationFn: createRecurringExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: any }) => updateRecurringExpense(payload.id, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });

  return (
    <div className="space-y-4">
      <Card className="p-4 flex gap-2 items-end">
        <div className="w-48">
          <label className="text-sm">Status</label>
          <Select value={status || "__all__"} onValueChange={(v) => setStatus((v === "__all__" ? "" : (v as RecStatus)))}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Recurring Template</DialogTitle>
            </DialogHeader>
            <RecurringExpenseForm
              mode="create"
              defaultValues={{ company_id: companyId, created_by: 0 }}
              submitting={createMut.isPending}
              onSubmit={async (values) => {
                await createMut.mutateAsync(values as any);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div>Loading templates…</div>}
      {isError && <div className="text-red-500">{(error as Error)?.message || "Failed to load."}</div>}
      {!isLoading && data && (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Day</th>
                <th className="p-2">Status</th>
                <th className="p-2">Next Run</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((r: RecurringExpense) => (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{(r.amount/100).toFixed(2)} {r.currency}</td>
                  <td className="p-2">{r.day_of_month}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{r.next_run_at ? new Date(r.next_run_at).toLocaleString() : '-'}</td>
                  <td className="p-2 flex gap-2">
                    {r.status !== 'paused' && <Button size="sm" variant="outline" onClick={() => window.confirm('Pause template?') && pauseMut.mutate(r.id)}>Pause</Button>}
                    {r.status === 'paused' && <Button size="sm" variant="outline" onClick={() => window.confirm('Resume template?') && resumeMut.mutate(r.id)}>Resume</Button>}
                    <Button size="sm" variant="outline" onClick={() => window.confirm('Generate current month instance?') && runNowMut.mutate(r.id)}>Run Now</Button>
                    <Button size="sm" variant="destructive" onClick={() => window.confirm('Delete template?') && deleteMut.mutate(r.id)}>Delete</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Recurring Template</DialogTitle>
                        </DialogHeader>
                        <RecurringExpenseForm
                          mode="edit"
                          defaultValues={{
                            company_id: companyId,
                            title: r.title,
                            description: r.description,
                            category: r.category,
                            amount: r.amount,
                            currency: r.currency,
                            payment_method: r.payment_method,
                            vendor: r.vendor,
                            day_of_month: r.day_of_month,
                            start_month: r.start_month?.split('T')[0] || "",
                            end_month: r.end_month ? r.end_month.split('T')[0] : null,
                            updated_by: 0,
                          }}
                          submitting={updateMut.isPending}
                          onSubmit={async (values) => {
                            await updateMut.mutateAsync({ id: r.id, data: values as any });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}


