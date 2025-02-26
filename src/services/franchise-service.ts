import { baseUrl } from "@/app/constants";
import { Franchise } from "@/models/data/franchise.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateFranchiseSchema } from "@/schemas/franchise";


export const createFranchise = async (data: CreateFranchiseSchema): Promise<APIResponse<Franchise>> => {
    const response = await fetch(`${baseUrl}/franchises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create franchise.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const getMyCompanyFranchises = async (id: number): Promise<APIResponse<Array<Franchise>>> => {
    const response = await fetch(`${baseUrl}/franchises/company/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchises.");
    }

    const apiResponse: APIResponse<Array<Franchise>> = await response.json();
    return apiResponse;

}