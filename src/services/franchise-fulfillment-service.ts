import { baseUrl } from "@/app/constants";
import { FranchiseCommissionsResponse } from "@/models/data/franchise-commission.model";
import { ShipFromStore } from "@/models/data/ship-from-store.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { APIResponse } from "@/models/responses/api-response.model";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export interface FranchiseFulfillmentListParams {
  company_id?: number;
  franchise_id?: number;
  start?: string;
  end?: string;
  status?: string;
  franchise_order_status?: string;
  limit?: number;
  offset?: number;
}

function buildSearch(params: FranchiseFulfillmentListParams): string {
  const search = new URLSearchParams();
  if (params.company_id != null) search.set("company_id", String(params.company_id));
  if (params.franchise_id != null) search.set("franchise_id", String(params.franchise_id));
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.status) search.set("status", params.status);
  if (params.franchise_order_status) {
    search.set("franchise_order_status", params.franchise_order_status);
  }
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  return search.toString();
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || fallback);
}

export const listCompanyFranchiseFulfillmentShipments = async (
  params: FranchiseFulfillmentListParams
): Promise<APIResponse<ShipFromStore[]>> => {
  const qs = buildSearch(params);
  const response = await fetch(`${baseUrl}/franchise-fulfillment/shipments?${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Failed to fetch shipments.");
  }
  return response.json();
};

export const listCompanyFranchiseFulfillmentOrders = async (
  params: FranchiseFulfillmentListParams
): Promise<APIResponse<WooOrder[]>> => {
  const qs = buildSearch(params);
  const response = await fetch(`${baseUrl}/franchise-fulfillment/orders?${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Failed to fetch orders.");
  }
  return response.json();
};

export const listCompanyFranchiseFulfillmentCommissions = async (
  params: FranchiseFulfillmentListParams
): Promise<APIResponse<FranchiseCommissionsResponse>> => {
  const qs = buildSearch(params);
  const response = await fetch(`${baseUrl}/franchise-fulfillment/commissions?${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Failed to fetch commissions.");
  }
  return response.json();
};
