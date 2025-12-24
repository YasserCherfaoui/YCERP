import { apiFetch } from "@/lib/api-fetch";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateReviewRequest, Review } from "@/models/data/review.model";

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  customer_phone?: string;
  woo_order_id?: number;
  date_from?: string;
  date_to?: string;
}

export const createReview = async (
  data: CreateReviewRequest
): Promise<APIResponse<Review>> => {
  return apiFetch("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getReviews = async (
  params: GetReviewsParams = {}
): Promise<APIResponse<{ reviews: Review[]; pagination: { page: number; limit: number; total: number } }>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.customer_phone) queryParams.append("customer_phone", params.customer_phone);
  if (params.woo_order_id) queryParams.append("woo_order_id", params.woo_order_id.toString());
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);

  const queryString = queryParams.toString();
  return apiFetch(`/reviews${queryString ? `?${queryString}` : ""}`);
};

export const getReview = async (id: number): Promise<APIResponse<Review>> => {
  return apiFetch(`/reviews/${id}`);
};

export const getCustomerReviews = async (
  phone: string
): Promise<APIResponse<Review[]>> => {
  return apiFetch(`/customers/${encodeURIComponent(phone)}/reviews`);
};

