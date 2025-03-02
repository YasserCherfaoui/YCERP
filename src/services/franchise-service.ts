import { baseUrl } from "@/app/constants";
import { FranchiseAdministrator } from "@/models/data/administrator.model";
import { EntryBill, ExitBill } from "@/models/data/bill.model";
import { Franchise } from "@/models/data/franchise.model";
import { Inventory } from "@/models/data/inventory.model";
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

export const getMyAdminFranchise = async (token: string): Promise<APIResponse<FranchiseAdministrator>> => {
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

export const getFranchiseExitBills = async (id: number): Promise<APIResponse<Array<ExitBill>>> => {
    const response = await fetch(`${baseUrl}/franchise/bills/exit/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('my-franchise-user-token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise exit bills.");
    }

    const apiResponse: APIResponse<Array<ExitBill>> = await response.json();
    return apiResponse;

}

export const getFranchiseEntryBills = async (id: number): Promise<APIResponse<Array<EntryBill>>> => {
    const response = await fetch(`${baseUrl}/franchise/bills/entry/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('my-franchise-user-token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise entry bills.");
    }

    const apiResponse: APIResponse<Array<EntryBill>> = await response.json();
    return apiResponse;

}

export const getFranchiseInventory = async (id: number): Promise<APIResponse<Inventory>> => {
    const response = await fetch(`${baseUrl}/franchises/inventory/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('my-franchise-user-token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise inventory.");
    }

    const apiResponse: APIResponse<Inventory> = await response.json();
    return apiResponse;

}

export const deleteFranchise = async (id: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/franchises/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete franchise.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}