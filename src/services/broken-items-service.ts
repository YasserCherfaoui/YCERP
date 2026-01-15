import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";
import { BrokenItem } from "@/models/data/broken-item.model";
import { BrokenItemTransfer } from "@/models/data/broken-item-transfer.model";

export interface RecordBrokenItemsRequest {
    inventory_id: number;
    items: Array<{
        qr_code?: string;
        product_variant_id?: number;
        quantity: number;
        reason?: string;
    }>;
    reason?: string;
}

export interface CreateTransferRequest {
    broken_item_ids: number[];
    notes?: string;
}

export interface ApproveTransferRequest {
    action: "approve" | "reject";
    notes?: string;
}

export interface GetTransferRequestsParams {
    status?: "pending" | "approved" | "rejected";
    company_id?: number;
    franchise_id?: number;
}

export const recordBrokenItems = async (
    data: RecordBrokenItemsRequest
): Promise<APIResponse<{ broken_items: BrokenItem[]; errors: string[] }>> => {
    const response = await fetch(`${baseUrl}/broken-items/record`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record broken items.");
    }

    return await response.json();
};

export const createTransferRequest = async (
    data: CreateTransferRequest
): Promise<APIResponse<BrokenItemTransfer>> => {
    const response = await fetch(`${baseUrl}/broken-items/transfers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create transfer request.");
    }

    return await response.json();
};

export const approveTransfer = async (
    transferId: number,
    data: ApproveTransferRequest
): Promise<APIResponse<BrokenItemTransfer>> => {
    const response = await fetch(`${baseUrl}/broken-items/transfers/${transferId}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process transfer.");
    }

    return await response.json();
};

export const getTransferRequests = async (
    params?: GetTransferRequestsParams
): Promise<APIResponse<BrokenItemTransfer[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.company_id) queryParams.append("company_id", params.company_id.toString());
    if (params?.franchise_id) queryParams.append("franchise_id", params.franchise_id.toString());

    const url = `${baseUrl}/broken-items/transfers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch transfer requests.");
    }

    return await response.json();
};
