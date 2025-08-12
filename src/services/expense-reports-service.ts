import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { APIResponse } from "@/models/responses/api-response.model";

export interface TotalsByMonthRow { month: string; total: number }
export interface TotalsByCategoryRow { category: string; total: number }
export interface ExpensesTotalResponse { total: number }

export async function totalsByMonth(params: { company_id: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByMonthRow[] }>> {
  const qs = buildQueryString(params as any);
  return apiFetch<{ rows: TotalsByMonthRow[] }>(`/expenses/reports/totals/months${qs}`);
}

export async function totalsByCategory(params: { company_id: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByCategoryRow[] }>> {
  const qs = buildQueryString(params as any);
  return apiFetch<{ rows: TotalsByCategoryRow[] }>(`/expenses/reports/totals/categories${qs}`);
}

export async function sumExpenses(params: { company_id: number; start?: string; end?: string }): Promise<APIResponse<ExpensesTotalResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<ExpensesTotalResponse>(`/expenses/reports/sum${qs}`);
}

export interface DeliveredAggregatesResponse {
  total_delivered_orders_amount_yalidine: number;
  total_delivered_orders_amount_my_companies: number;
  total_delivered_orders_amount: number;
  total_benefits_yalidine: number;
  total_benefits_my_companies: number;
  total_benefits: number;
}

export async function getDeliveredAggregates(params: { company_id: number; start?: string; end?: string }): Promise<APIResponse<DeliveredAggregatesResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<DeliveredAggregatesResponse>(`/delivery/reports/delivered-aggregates${qs}`);
}


