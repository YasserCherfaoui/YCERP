import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { APIResponse } from "@/models/responses/api-response.model";

export interface TotalsByMonthRow { month: string; total: number }
export interface TotalsByCategoryRow { category: string; total: number }
export interface ExpensesTotalResponse { total: number }

export async function totalsByMonth(params: { company_id: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByMonthRow[] }>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiFetch<{ rows: TotalsByMonthRow[] }>(`/expenses/reports/totals/months${qs}`);
}

export async function totalsByCategory(params: { company_id: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByCategoryRow[] }>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiFetch<{ rows: TotalsByCategoryRow[] }>(`/expenses/reports/totals/categories${qs}`);
}

export async function sumExpenses(params: { company_id: number; start?: string; end?: string }): Promise<APIResponse<ExpensesTotalResponse>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return apiFetch<ExpensesTotalResponse>(`/expenses/reports/sum${qs}`);
}


