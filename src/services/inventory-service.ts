import { baseUrl } from "@/app/constants";
import { Inventory, InventoryItem, InventoryItemTransactionLog } from "@/models/data/inventory.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { InventoryWithCostResponse } from "@/models/responses/inventory-with-cost.model";
import { UpdateInventoryItemSchema } from "@/schemas/inventory-schema";

export const getCompanyInventory = async (companyId: number): Promise<APIResponse<InventoryWithCostResponse>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/inventory`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory.");
    }
    const apiResponse: APIResponse<InventoryWithCostResponse> = await response.json();
    return apiResponse;
}

export const getUserInventory = async (companyId: number): Promise<APIResponse<Inventory>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/inventory`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory.");
    }
    const apiResponse: APIResponse<Inventory> = await response.json();
    return apiResponse;
}

export const updateCompanyInventoryItem = async (itemID: number, data: UpdateInventoryItemSchema): Promise<APIResponse<InventoryItem>> => {
    const response = await fetch(`${baseUrl}/inventory/item/${itemID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)

    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update inventory item.");
    }
    const apiResponse: APIResponse<InventoryItem> = await response.json();
    return apiResponse;

}

export const getCompanyInventoryTransactionLogs = async (comapnyID: number): Promise<APIResponse<InventoryItemTransactionLog[]>> => {
    const response = await fetch(`${baseUrl}/inventory/transactions/${comapnyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory transactions.");
    }
    const apiResponse: APIResponse<InventoryItemTransactionLog[]> = await response.json();
    return apiResponse;

}
export const getFranchiseInventoryTransactionLogs = async (franchiseID: number): Promise<APIResponse<InventoryItemTransactionLog[]>> => {
    const response = await fetch(`${baseUrl}/inventory/transactions/franchise/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory transactions.");
    }
    const apiResponse: APIResponse<InventoryItemTransactionLog[]> = await response.json();
    return apiResponse;

}

export const getInventoryTotalCost = async (companyId: number): Promise<APIResponse<{ total: number }>> => {
    const response = await fetch(`${baseUrl}/inventory/totals/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory total cost.");
    }
    const apiResponse: APIResponse<{ total: number }> = await response.json();
    return apiResponse;
}

export const getFranchiseInventoryTotalCost = async (franchiseID: number): Promise<APIResponse<{ total_first_price: number, total_franchise_price: number }>> => {
    const response = await fetch(`${baseUrl}/inventory/totals/franchise/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory total cost.");
    }
    const apiResponse: APIResponse<{
        total_first_price: number,
        total_franchise_price: number,
    }> = await response.json();
    return apiResponse;
}

export const getInventoryByVariant = async (productVariantId: number): Promise<APIResponse<InventoryItem[]>> => {
    const response = await fetch(`${baseUrl}/inventory/variant/${productVariantId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory by variant.");
    }
    const apiResponse: APIResponse<InventoryItem[]> = await response.json();
    return apiResponse;
}

