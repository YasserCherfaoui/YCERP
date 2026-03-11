import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";
import { ShipFromStore } from "@/models/data/ship-from-store.model";

const franchiseAuth = () => `Bearer ${localStorage.getItem("token")}`;
const adminAuth = () => `Bearer ${localStorage.getItem("token")}`;

// --- Franchise (myFranchise) ---

export const createShipFromStoreFranchise = async (payload: {
  product_variant_id: number;
  tracking_number: string;
}): Promise<APIResponse<ShipFromStore>> => {
  const response = await fetch(`${baseUrl}/franchise/ship-from-store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: franchiseAuth(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create ship-from-store record.");
  }
  return response.json();
};

export const listShipFromStoreFranchise = async (): Promise<APIResponse<ShipFromStore[]>> => {
  const response = await fetch(`${baseUrl}/franchise/ship-from-store`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: franchiseAuth(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch ship-from-store records.");
  }
  return response.json();
};

export const getShipFromStoreFranchise = async (id: number): Promise<APIResponse<ShipFromStore>> => {
  const response = await fetch(`${baseUrl}/franchise/ship-from-store/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: franchiseAuth(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch ship-from-store record.");
  }
  return response.json();
};

// --- Admin (company) ---

export const listShipFromStoreAdmin = async (params: {
  company_id?: number;
  franchise_id?: number;
  limit?: number;
  offset?: number;
}): Promise<APIResponse<ShipFromStore[]>> => {
  const search = new URLSearchParams();
  if (params.company_id != null) search.set("company_id", String(params.company_id));
  if (params.franchise_id != null) search.set("franchise_id", String(params.franchise_id));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const response = await fetch(`${baseUrl}/ship-from-store?${search.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: adminAuth(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch ship-from-store records.");
  }
  return response.json();
};

export const getShipFromStoreAdmin = async (id: number): Promise<APIResponse<ShipFromStore>> => {
  const response = await fetch(`${baseUrl}/ship-from-store/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: adminAuth(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch ship-from-store record.");
  }
  return response.json();
};

export const createShipFromStoreAdmin = async (payload: {
  franchise_id: number;
  product_variant_id: number;
  tracking_number: string;
}): Promise<APIResponse<ShipFromStore>> => {
  const response = await fetch(`${baseUrl}/ship-from-store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: adminAuth(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create ship-from-store record.");
  }
  return response.json();
};

export const updateShipFromStoreAdmin = async (
  id: number,
  payload: { tracking_number?: string }
): Promise<APIResponse<ShipFromStore>> => {
  const response = await fetch(`${baseUrl}/ship-from-store/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: adminAuth(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update ship-from-store record.");
  }
  return response.json();
};

export const deleteShipFromStoreAdmin = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/ship-from-store/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: adminAuth(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete ship-from-store record.");
  }
  return response.json();
};
