import { baseUrl } from "@/app/constants";
import { Inventory } from "@/models/data/inventory.model";
import { APIResponse } from "@/models/responses/api-response.model";

export const getCompanyInventory = async (companyId: number): Promise<APIResponse<Inventory>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/inventory`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory.");
    }
    const apiResponse: APIResponse<Inventory> = await response.json();
    return apiResponse;
}