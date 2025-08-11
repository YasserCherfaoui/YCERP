import { apiFetch } from "@/lib/api-fetch";
import { ExpenseCategory } from "@/models/data/expenses/expense-category.model";
import { APIResponse } from "@/models/responses/api-response.model";

export async function listExpenseCategories(): Promise<APIResponse<ExpenseCategory[]>> {
  return apiFetch<ExpenseCategory[]>(`/expense-categories`);
}

export async function createExpenseCategory(payload: Partial<ExpenseCategory> & { name: string }): Promise<APIResponse<ExpenseCategory>> {
  return apiFetch<ExpenseCategory>(`/expense-categories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpenseCategory(id: number, payload: Partial<ExpenseCategory>): Promise<APIResponse<ExpenseCategory>> {
  return apiFetch<ExpenseCategory>(`/expense-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpenseCategory(id: number): Promise<APIResponse<{ id: number }>> {
  return apiFetch<{ id: number }>(`/expense-categories/${id}`, { method: "DELETE" });
}



