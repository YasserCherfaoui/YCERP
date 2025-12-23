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
}

export interface UpdateCustomerRequest {
  birthday?: string | Date | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export const getCustomer = async (
  phone: string
): Promise<APIResponse<{ customer: Customer; stats: CustomerStats; recent_orders: any[] }>> => {
  return apiFetch(`/customers/${encodeURIComponent(phone)}`);
};

export const updateCustomer = async (
  phone: string,
  data: UpdateCustomerRequest
): Promise<APIResponse<Customer>> => {
  return apiFetch(`/customers/${encodeURIComponent(phone)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const getCustomers = async (
  params: GetCustomersParams = {}
): Promise<APIResponse<{ customers: Array<{ customer: Customer; delivery_rate: number }>; pagination: { page: number; limit: number; total: number } }>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.min_delivery_rate !== undefined)
    queryParams.append("min_delivery_rate", params.min_delivery_rate.toString());
  if (params.max_delivery_rate !== undefined)
    queryParams.append("max_delivery_rate", params.max_delivery_rate.toString());

  const queryString = queryParams.toString();
  return apiFetch(`/customers${queryString ? `?${queryString}` : ""}`);
};

export const getCustomerStats = async (
  phone: string
): Promise<APIResponse<{ stats: CustomerStats; reviews: { average_rating: number; count: number } }>> => {
  return apiFetch(`/customers/${encodeURIComponent(phone)}/stats`);
};

export const getUpcomingBirthdays = async (
  days: number = 30
): Promise<APIResponse<UpcomingBirthday[]>> => {
  return apiFetch(`/customers/birthdays/upcoming?days=${days}`);
};

export const getTodayBirthdays = async (): Promise<APIResponse<Array<{ customer: Customer; age: number }>>> => {
  return apiFetch(`/customers/birthdays/today`);
};

export const getDailyDeliveries = async (
  date?: string
): Promise<APIResponse<DailyDelivery>> => {
  const queryString = date ? `?date=${date}` : "";
  return apiFetch(`/customers/deliveries/today${queryString}`);
};

