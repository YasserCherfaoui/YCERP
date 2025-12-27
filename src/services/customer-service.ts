import { apiFetch } from "@/lib/api-fetch";
import { APIResponse } from "@/models/responses/api-response.model";
import {
  Customer,
  CustomerStats,
  DailyDelivery,
  UpcomingBirthday,
} from "@/models/data/customer.model";

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  min_delivery_rate?: number;
  max_delivery_rate?: number;
  company_id?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface UpdateCustomerRequest {
  birthday?: string | Date | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export const getCustomer = async (
  phone: string,
  companyId?: number
): Promise<APIResponse<{ customer: Customer; stats: CustomerStats; recent_orders: any[] }>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/${encodeURIComponent(phone)}${queryString ? `?${queryString}` : ""}`);
};

export const updateCustomer = async (
  phone: string,
  data: UpdateCustomerRequest,
  companyId?: number
): Promise<APIResponse<Customer>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/${encodeURIComponent(phone)}${queryString ? `?${queryString}` : ""}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const getCustomers = async (
  params: GetCustomersParams = {}
): Promise<APIResponse<{ customers: Array<{ customer: Customer; delivery_rate: number }>; pagination: { page: number; limit: number; total: number; total_pages: number } }>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.min_delivery_rate !== undefined)
    queryParams.append("min_delivery_rate", params.min_delivery_rate.toString());
  if (params.max_delivery_rate !== undefined)
    queryParams.append("max_delivery_rate", params.max_delivery_rate.toString());
  if (params.company_id) queryParams.append("company_id", params.company_id.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  const queryString = queryParams.toString();
  return apiFetch(`/customers${queryString ? `?${queryString}` : ""}`);
};

export const getCustomerStats = async (
  phone: string,
  companyId?: number
): Promise<APIResponse<{ stats: CustomerStats; reviews: { average_rating: number; count: number } }>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/${encodeURIComponent(phone)}/stats${queryString ? `?${queryString}` : ""}`);
};

export const getUpcomingBirthdays = async (
  days: number = 30,
  companyId?: number
): Promise<APIResponse<UpcomingBirthday[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append("days", days.toString());
  if (companyId) queryParams.append("company_id", companyId.toString());
  return apiFetch(`/customers/birthdays/upcoming?${queryParams.toString()}`);
};

export const getTodayBirthdays = async (
  companyId?: number
): Promise<APIResponse<Array<{ customer: Customer; age: number }>>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/birthdays/today${queryString ? `?${queryString}` : ""}`);
};

export const getDailyDeliveries = async (
  date?: string,
  companyId?: number,
  page?: number,
  limit?: number,
  reviewStatus?: "waiting" | "done"
): Promise<APIResponse<DailyDelivery>> => {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append("date", date);
  if (companyId) queryParams.append("company_id", companyId.toString());
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (reviewStatus) queryParams.append("review_status", reviewStatus);
  const queryString = queryParams.toString();
  return apiFetch(`/customers/deliveries/today${queryString ? `?${queryString}` : ""}`);
};

export const syncCustomers = async (
  companyId?: number
): Promise<APIResponse<{ synced: number; total: number }>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/sync${queryString ? `?${queryString}` : ""}`, {
    method: "POST",
  });
};

export const updateSelectedCustomers = async (
  phones: string[],
  companyId?: number
): Promise<APIResponse<{ customers_processed: number; orders_synced: number; total_orders: number; stats_updated: number }>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/update-selected${queryString ? `?${queryString}` : ""}`, {
    method: "POST",
    body: JSON.stringify({ phones }),
  });
};

export const deleteCustomersWithZeroOrders = async (
  companyId?: number
): Promise<APIResponse<{ deleted: number; total_found: number }>> => {
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append("company_id", companyId.toString());
  const queryString = queryParams.toString();
  return apiFetch(`/customers/zero-orders${queryString ? `?${queryString}` : ""}`, {
    method: "DELETE",
  });
};

