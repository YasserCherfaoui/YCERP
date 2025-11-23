import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { Expense, ExpensesListResponseData } from "@/models/data/expenses/expense.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { ExpenseCreateSchema, ExpenseUpdateSchema } from "@/schemas/expenses/expense";

type ListParams = {
  company_id?: number;
  franchise_id?: number;
  category?: string;
  status?: "recorded" | "approved" | "paid" | "cancelled";
  vendor?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  page?: number; // default 1
  limit?: number; // default 50, max 200
};

function normalizeExpense(raw: any): Expense {
  return {
    id: raw.id ?? raw.ID,
    company_id: raw.company_id ?? null,
    franchise_id: raw.franchise_id ?? null,
    title: raw.title,
    description: raw.description ?? "",
    category: raw.category,
    amount: raw.amount,
    currency: raw.currency ?? "DZD",
    date: raw.date,
    payment_method: raw.payment_method,
    vendor: raw.vendor ?? "",
    status: raw.status,
    paid_at: raw.paid_at ?? null,
    approved_by: raw.approved_by ?? null,
    approved_at: raw.approved_at ?? null,
    created_by: raw.created_by,
    updated_by: raw.updated_by,
    created_at: raw.created_at ?? raw.CreatedAt,
    updated_at: raw.updated_at ?? raw.UpdatedAt,
  } as Expense;
}

export async function listExpenses(params: ListParams): Promise<APIResponse<ExpensesListResponseData>> {
  const qs = buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>);
  const envelope = await apiFetch<any>(`/expenses${qs}`);
  const raw = envelope.data || { expenses: [], meta: { current_page: 1, per_page: 50, total_items: 0, total_pages: 0 } };
  const normalized: ExpensesListResponseData = {
    expenses: (raw.expenses || []).map((e: any) => normalizeExpense(e)),
    meta: raw.meta,
  };
  return { ...envelope, data: normalized };
}

export async function getExpense(id: number): Promise<APIResponse<Expense>> {
  const envelope = await apiFetch<any>(`/expenses/${id}`);
  const normalized = normalizeExpense((envelope as any).data ?? {});
  return { ...envelope, data: normalized } as APIResponse<Expense>;
}

export async function createExpense(payload: ExpenseCreateSchema): Promise<APIResponse<Expense>> {
  const envelope = await apiFetch<any>(`/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ...envelope, data: normalizeExpense((envelope as any).data ?? {}) } as APIResponse<Expense>;
}

export async function updateExpense(id: number, payload: ExpenseUpdateSchema): Promise<APIResponse<Expense>> {
  const envelope = await apiFetch<any>(`/expenses/${id}` , {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return { ...envelope, data: normalizeExpense((envelope as any).data ?? {}) } as APIResponse<Expense>;
}

export async function deleteExpense(id: number): Promise<APIResponse<{ id: number }>> {
  return apiFetch<{ id: number }>(`/expenses/${id}`, { method: "DELETE" });
}

export async function approveExpense(id: number): Promise<APIResponse<Expense>> {
  const envelope = await apiFetch<any>(`/expenses/${id}/approve`, { method: "POST" });
  return { ...envelope, data: normalizeExpense((envelope as any).data ?? {}) } as APIResponse<Expense>;
}

export async function markExpensePaid(id: number): Promise<APIResponse<Expense>> {
  const envelope = await apiFetch<any>(`/expenses/${id}/mark-paid`, { method: "POST" });
  return { ...envelope, data: normalizeExpense((envelope as any).data ?? {}) } as APIResponse<Expense>;
}


