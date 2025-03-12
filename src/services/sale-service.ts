import { baseUrl } from "@/app/constants";
import { Sale } from "@/models/data/sale.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateSaleSchema } from "@/schemas/sale";

export const createCompanySale = async (data: CreateSaleSchema): Promise<APIResponse<Sale>> => {
    const response = await fetch(`${baseUrl}/sales`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create sale.");
    }

    const createdSale: APIResponse<Sale> = await response.json();
    return createdSale;
}

export const getCompanySales = async (companyID: number): Promise<APIResponse<Sale[]>> => {
    const response = await fetch(`${baseUrl}/sales/${companyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sales.");
    }

    const apiResponse: APIResponse<Sale[]> = await response.json();
    return apiResponse;
}
