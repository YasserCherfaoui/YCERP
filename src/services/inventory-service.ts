import { baseUrl } from "@/app/constants";
import { Inventory, InventoryItem, InventoryItemTransactionLog } from "@/models/data/inventory.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { UpdateInventoryItemSchema } from "@/schemas/inventory-schema";

export const getCompanyInventory = async (companyId: number): Promise<APIResponse<Inventory>> => {
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