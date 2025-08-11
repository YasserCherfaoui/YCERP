import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ExpenseCategory } from "@/models/data/expenses/expense-category.model";
import { createExpenseCategory, deleteExpenseCategory, listExpenseCategories, updateExpenseCategory } from "@/services/expense-categories-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function ExpensesCategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => (await listExpenseCategories()).data as ExpenseCategory[],
  });

  const createMut = useMutation({
    mutationFn: (payload: Partial<ExpenseCategory> & { name: string }) => createExpenseCategory(payload),
    onSuccess: () => {
      toast({ description: "Category created" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: Partial<ExpenseCategory> }) => updateExpenseCategory(payload.id, payload.data),
    onSuccess: () => {
      toast({ description: "Category updated" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteExpenseCategory(id),
    onSuccess: () => {
      toast({ description: "Category deleted" });
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Name" id="name" />
              <Input placeholder="Description" id="description" />
              <Input type="number" placeholder="Monthly budget DZD" id="monthly_budget_dzd" />
              <div className="flex justify-end">
                <Button onClick={() => {
                  const name = (document.getElementById('name') as HTMLInputElement).value;
                  const description = (document.getElementById('description') as HTMLInputElement).value;
                  const monthly = (document.getElementById('monthly_budget_dzd') as HTMLInputElement).value;
                  if (!name) return;
                  createMut.mutate({ name, description, monthly_budget_dzd: monthly ? Number(monthly) : undefined, is_active: true });
                }}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && <div>Loading…</div>}
      {isError && <div className="text-red-500">{(error as Error)?.message}</div>}
      {data && (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Active</th>
                <th className="p-2">Monthly Budget</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.description}</td>
                  <td className="p-2">{c.is_active ? "Yes" : "No"}</td>
                  <td className="p-2">{c.monthly_budget_dzd ?? "-"}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => window.confirm("Delete category?") && deleteMut.mutate(c.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-2">
              <Input defaultValue={editing.name} id={`edit-name`} />
              <Input defaultValue={editing.description} id={`edit-description`} />
              <Input type="number" defaultValue={editing.monthly_budget_dzd ?? undefined} id={`edit-monthly`} />
              <div className="flex justify-end">
                <Button onClick={() => {
                  const name = (document.getElementById('edit-name') as HTMLInputElement).value;
                  const description = (document.getElementById('edit-description') as HTMLInputElement).value;
                  const monthly = (document.getElementById('edit-monthly') as HTMLInputElement).value;
                  updateMut.mutate({ id: editing.id, data: { name, description, monthly_budget_dzd: monthly ? Number(monthly) : null } });
                }}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


