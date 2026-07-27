import { baseUrl } from "@/app/constants";
import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { APIResponse } from "@/models/responses/api-response.model";

export interface TotalsByMonthRow { month: string; total: number }
export interface TotalsByCategoryRow { category: string; total: number }
export interface ExpensesTotalResponse { total: number }

export async function totalsByMonth(params: { company_id?: number; franchise_id?: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByMonthRow[] }>> {
  const qs = buildQueryString(params as any);
  return apiFetch<{ rows: TotalsByMonthRow[] }>(`/expenses/reports/totals/months${qs}`);
}

export async function totalsByCategory(params: { company_id?: number; franchise_id?: number; date_from: string; date_to: string }): Promise<APIResponse<{ rows: TotalsByCategoryRow[] }>> {
  const qs = buildQueryString(params as any);
  return apiFetch<{ rows: TotalsByCategoryRow[] }>(`/expenses/reports/totals/categories${qs}`);
}

export async function sumExpenses(params: { company_id?: number; franchise_id?: number; start?: string; end?: string }): Promise<APIResponse<ExpensesTotalResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<ExpensesTotalResponse>(`/expenses/reports/sum${qs}`);
}

export interface ReturnedOrdersCountResponse {
  count: number;
  cost: number;
}

/** Count returned woo_orders filtered by updated_at; cost = count * 100 */
export async function countReturnedOrders(params: {
  company_id: number;
  start: string;
  end: string;
}): Promise<APIResponse<ReturnedOrdersCountResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<ReturnedOrdersCountResponse>(`/expenses/reports/returned-count${qs}`);
}

export interface DeliveredAggregatesResponse {
  total_delivered_orders_amount_yalidine: number;
  total_delivered_orders_amount_my_companies: number;
  total_delivered_orders_amount: number;
  total_delivered_orders_count_yalidine: number;
  total_delivered_orders_count_my_companies: number;
  total_delivered_orders_count: number;
  total_benefits_yalidine: number;
  total_benefits_my_companies: number;
  total_benefits: number;
}

export async function getDeliveredAggregates(params: { company_id: number; start?: string; end?: string }): Promise<APIResponse<DeliveredAggregatesResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<DeliveredAggregatesResponse>(`/delivery/reports/delivered-aggregates${qs}`);
}

async function downloadCsvFile(
  path: string,
  filename: string,
  fallbackError: string
): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    let message = fallbackError;
    try {
      const err = await response.json();
      message = err?.message || err?.error?.description || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadDeliveredOrdersCsv(params: {
  company_id: number;
  start: string;
  end: string;
}): Promise<void> {
  const qs = buildQueryString(params as any);
  return downloadCsvFile(
    `/delivery/reports/delivered-orders-csv${qs}`,
    `delivered-orders-${params.start}-${params.end}.csv`,
    "Failed to export delivered orders CSV."
  );
}

export async function downloadDeliveredProductsCsv(params: {
  company_id: number;
  start: string;
  end: string;
}): Promise<void> {
  const qs = buildQueryString(params as any);
  return downloadCsvFile(
    `/delivery/reports/delivered-products-csv${qs}`,
    `delivered-products-${params.start}-${params.end}.csv`,
    "Failed to export delivered products CSV."
  );
}

export interface DeliveredProductSoldRow {
  product_id: number;
  product_name: string;
  quantity: number;
  first_price: number;
  line_total: number;
}

export interface DeliveredProductsSoldResponse {
  rows: DeliveredProductSoldRow[];
  total_cogs: number;
  start: string;
  end: string;
}

export async function getDeliveredProductsSold(params: {
  company_id: number;
  start: string;
  end: string;
}): Promise<APIResponse<DeliveredProductsSoldResponse>> {
  const qs = buildQueryString(params as any);
  return apiFetch<DeliveredProductsSoldResponse>(`/delivery/reports/delivered-products-sold${qs}`);
}


