import { baseUrl } from "@/app/constants";
import { Affiliate } from "@/models/data/affiliate/affiliate.model";
import { Product } from "@/models/data/product.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { RegisterAffiliateSchema } from "@/schemas/affiliate";

const getAffiliateToken = () => localStorage.getItem("affiliate_token");

export const login = async (credentials: any): Promise<APIResponse<{token: string, affiliate: Affiliate}>> => {
    const response = await fetch(`${baseUrl}/affiliates/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to login.");
    }

    const result: APIResponse<{token: string, affiliate: Affiliate}> = await response.json();
    return result;
};

export const registerAffiliate = async (data: RegisterAffiliateSchema): Promise<APIResponse<Affiliate>> => {
    const response = await fetch(`${baseUrl}/affiliates/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register.");
    }

    const result: APIResponse<Affiliate> = await response.json();
    return result;
}

export const getAffiliateProfile = async (): Promise<APIResponse<Affiliate>> => {
    const response = await fetch(`${baseUrl}/affiliates/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate profile.");
    }

    const result: APIResponse<Affiliate> = await response.json();
    return result;
};

export const getAffiliateProducts = async (): Promise<APIResponse<Product[]>> => {
    const response = await fetch(`${baseUrl}/affiliates/products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate products.");
    }

    const result: APIResponse<any[]> = await response.json();
    return result;
};

export const getCommissions = async (): Promise<APIResponse<any[]>> => {
     const response = await fetch(`${baseUrl}/affiliates/me/commissions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch commissions.");
    }

    const result: APIResponse<any[]> = await response.json();
    return result;
};

export const getPayments = async (): Promise<APIResponse<any[]>> => {
    const response = await fetch(`${baseUrl}/affiliates/me/payments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payments.");
    }

    const result: APIResponse<any[]> = await response.json();
    return result;
};

export const updatePaymentInfo = async (data: any): Promise<APIResponse<any>> => {
    const response = await fetch(`${baseUrl}/affiliates/payment-info`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payment info.");
    }

    const result: APIResponse<any> = await response.json();
    return result;
}; 