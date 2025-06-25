import { baseUrl } from "@/app/constants";
import { Affiliate, AffiliatePaymentInfo, Commission, Payment } from "@/models/data/affiliate";
import { Product } from "@/models/data/product.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { PaymentInfoFormData } from "@/pages/affiliate/dashboard/affiliate-settings-page";
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

export interface CommissionsPaginatedResponse {
    commissions: Commission[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        limit: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface GetCommissionsParams {
    page?: number;
    limit?: number;
    status?: string;
}

export const getCommissions = async (params: GetCommissionsParams = {}): Promise<APIResponse<CommissionsPaginatedResponse>> => {
    const { page = 1, limit = 20, status } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) {
        searchParams.append('status', status);
    }

    const response = await fetch(`${baseUrl}/affiliates/commissions?${searchParams}`, {
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

    const result: APIResponse<CommissionsPaginatedResponse> = await response.json();
    return result;
};

export interface PaymentsPaginatedResponse {
    payments: Payment[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        limit: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface GetPaymentsParams {
    page?: number;
    limit?: number;
}

export const getPayments = async (params: GetPaymentsParams = {}): Promise<APIResponse<PaymentsPaginatedResponse>> => {
    const { page = 1, limit = 20 } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    const response = await fetch(`${baseUrl}/affiliates/payments?${searchParams}`, {
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

    const result: APIResponse<PaymentsPaginatedResponse> = await response.json();
    return result;
};

export const updatePaymentInfo = async (affiliateID: number, data: PaymentInfoFormData): Promise<APIResponse<AffiliatePaymentInfo>> => {
    const response = await fetch(`${baseUrl}/affiliates/payment-info/${affiliateID}`, {
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