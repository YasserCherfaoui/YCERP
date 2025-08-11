import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { RecurringExpense } from "@/models/data/expenses/recurring-expense.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { RecurringExpenseCreateSchema, RecurringExpenseUpdateSchema } from "@/schemas/expenses/recurring-expense";

export async function listRecurringExpenses(params: { company_id: number; status?: "active" | "paused" | "ended" }): Promise<APIResponse<RecurringExpense[]>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiFetch<RecurringExpense[]>(`/recurring-expenses${qs}`);
}

export async function getRecurringExpense(id: number): Promise<APIResponse<RecurringExpense>> {
  return apiFetch<RecurringExpense>(`/recurring-expenses/${id}`);
}

export async function createRecurringExpense(payload: RecurringExpenseCreateSchema): Promise<APIResponse<RecurringExpense>> {
  return apiFetch<RecurringExpense>(`/recurring-expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRecurringExpense(id: number, payload: RecurringExpenseUpdateSchema): Promise<APIResponse<RecurringExpense>> {
  return apiFetch<RecurringExpense>(`/recurring-expenses/${id}` , {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRecurringExpense(id: number): Promise<APIResponse<{ id: number }>> {
  return apiFetch<{ id: number }>(`/recurring-expenses/${id}`, { method: "DELETE" });
}

export async function pauseRecurringExpense(id: number): Promise<APIResponse<{ id: number }>> {
  return apiFetch<{ id: number }>(`/recurring-expenses/${id}/pause`, { method: "POST" });
}

export async function resumeRecurringExpense(id: number): Promise<APIResponse<{ id: number }>> {
  return apiFetch<{ id: number }>(`/recurring-expenses/${id}/resume`, { method: "POST" });
}

export async function runRecurringExpenseNow(id: number): Promise<APIResponse<any>> {
  return apiFetch<any>(`/recurring-expenses/${id}/run`, { method: "POST" });
}


