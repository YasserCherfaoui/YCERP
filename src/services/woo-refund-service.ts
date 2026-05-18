import { baseUrl } from "@/app/constants";
import {
  CreateFranchiseWooRefundRequest,
  FranchiseLedgerEntry,
  FranchiseWooRefund,
  FranchiseWooRefundPreview,
  WooOrderSearchHit,
} from "@/models/data/franchise-woo-refund.model";
import { APIResponse } from "@/models/responses/api-response.model";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || errorData.error?.description || fallback);
}

export type WooRefundApiScope = "company" | "franchise";

function basePath(scope: WooRefundApiScope): string {
  return scope === "company" ? `${baseUrl}/franchise-fulfillment` : `${baseUrl}/franchise`;
}

export const searchWooOrdersForRefund = async (
  scope: WooRefundApiScope,
  params: { tracking_number?: string; phone?: string }
): Promise<APIResponse<WooOrderSearchHit[]>> => {
  const qs = new URLSearchParams();
  if (params.tracking_number?.trim()) {
    qs.set("tracking_number", params.tracking_number.trim());
  }
  if (params.phone?.trim()) {
    qs.set("phone", params.phone.trim());
  }
  const response = await fetch(`${basePath(scope)}/woo-orders/search?${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Search failed.");
  }
  return response.json();
};

export const getWooRefundPreview = async (
  scope: WooRefundApiScope,
  wooOrderId: number
): Promise<APIResponse<FranchiseWooRefundPreview>> => {
  const response = await fetch(
    `${basePath(scope)}/woo-orders/${wooOrderId}/refund-preview`,
    { method: "GET", headers: authHeaders() }
  );
  if (!response.ok) {
    await parseError(response, "Failed to load refund preview.");
  }
  return response.json();
};

export const createFranchiseWooRefund = async (
  scope: WooRefundApiScope,
  body: CreateFranchiseWooRefundRequest
): Promise<APIResponse<unknown>> => {
  const response = await fetch(`${basePath(scope)}/woo-refunds`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await parseError(response, "Failed to create refund.");
  }
  return response.json();
};

export const listFranchiseWooRefunds = async (params?: {
  reimbursement_status?: string;
  limit?: number;
  offset?: number;
}): Promise<APIResponse<FranchiseWooRefund[]>> => {
  const qs = new URLSearchParams();
  if (params?.reimbursement_status) {
    qs.set("reimbursement_status", params.reimbursement_status);
  }
  qs.set("limit", String(params?.limit ?? 100));
  if (params?.offset != null) {
    qs.set("offset", String(params.offset));
  }
  const response = await fetch(`${baseUrl}/franchise/woo-refunds?${qs}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Failed to load refunds.");
  }
  return response.json();
};

export const listCompanyWooRefunds = async (params?: {
  franchise_id?: number;
  woo_order_id?: number;
  reimbursement_status?: string;
  limit?: number;
  offset?: number;
}): Promise<APIResponse<FranchiseWooRefund[]>> => {
  const qs = new URLSearchParams();
  if (params?.franchise_id != null) {
    qs.set("franchise_id", String(params.franchise_id));
  }
  if (params?.woo_order_id != null) {
    qs.set("woo_order_id", String(params.woo_order_id));
  }
  if (params?.reimbursement_status) {
    qs.set("reimbursement_status", params.reimbursement_status);
  }
  qs.set("limit", String(params?.limit ?? 100));
  if (params?.offset != null) {
    qs.set("offset", String(params.offset));
  }
  const response = await fetch(
    `${baseUrl}/franchise-fulfillment/woo-refunds?${qs}`,
    { method: "GET", headers: authHeaders() }
  );
  if (!response.ok) {
    await parseError(response, "Failed to load refunds.");
  }
  return response.json();
};

export const markCompanyWooRefundReimbursed = async (
  refundId: number,
  body?: { payment_reference?: string }
): Promise<APIResponse<FranchiseWooRefund>> => {
  const response = await fetch(
    `${baseUrl}/franchise-fulfillment/woo-refunds/${refundId}/mark-reimbursed`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body ?? {}),
    }
  );
  if (!response.ok) {
    await parseError(response, "Failed to record reimbursement.");
  }
  return response.json();
};

export const listFranchiseLedgerEntries = async (): Promise<
  APIResponse<FranchiseLedgerEntry[]>
> => {
  const response = await fetch(`${baseUrl}/franchise/ledger-entries?limit=100`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!response.ok) {
    await parseError(response, "Failed to load ledger.");
  }
  return response.json();
};
