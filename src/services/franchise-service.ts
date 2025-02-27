import { baseUrl } from "@/app/constants";
import { FranchiseAdministrator } from "@/models/data/administrator.model";
import { Franchise } from "@/models/data/franchise.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { MyFranchiseAuthResponse } from "@/models/responses/my-franchise-auth-response.model";
import { LoginFormSchema } from "@/schemas/auth";
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

export const loginMyFranchise = async (data: LoginFormSchema): Promise<APIResponse<MyFranchiseAuthResponse>> => {
    const response = await fetch(`${baseUrl}/franchise/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to login.");
    }

    const apiResponse: APIResponse<MyFranchiseAuthResponse> = await response.json();
    return apiResponse;

}

export const getMyAdminFranchise = async (token:string) : Promise<APIResponse<FranchiseAdministrator>> => {
    const response = await fetch(`${baseUrl}/franchise/admin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise.");
    }

    const apiResponse: APIResponse<FranchiseAdministrator> = await response.json();
    return apiResponse;

}