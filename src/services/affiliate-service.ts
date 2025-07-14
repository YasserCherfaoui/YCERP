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

// Company-side affiliate management methods
const getCompanyToken = () => localStorage.getItem("token");

export interface CompanyAffiliatesPaginatedResponse {
    affiliates: Affiliate[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        limit: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface GetCompanyAffiliatesParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    email?: string;
    phone?: string;
}

export const getCompanyAffiliates = async (companyId: number, params: GetCompanyAffiliatesParams = {}): Promise<APIResponse<CompanyAffiliatesPaginatedResponse>> => {
    const { page = 1, limit = 20, status, search, email, phone } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);
    if (email) searchParams.append('email', email);
    if (phone) searchParams.append('phone', phone);

    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates?${searchParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch company affiliates.");
    }

    const result: APIResponse<CompanyAffiliatesPaginatedResponse> = await response.json();
    return result;
};

export const getAffiliateDetails = async (companyId: number, affiliateId: number): Promise<APIResponse<Affiliate>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates/${affiliateId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate details.");
    }

    const result: APIResponse<Affiliate> = await response.json();
    return result;
};

export interface UpdateAffiliateRequest {
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    is_active?: boolean;
    is_confirmed?: boolean;
}

export const updateAffiliate = async (companyId: number, affiliateId: number, data: UpdateAffiliateRequest): Promise<APIResponse<Affiliate>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates/${affiliateId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update affiliate.");
    }

    const result: APIResponse<Affiliate> = await response.json();
    return result;
};

export interface RecordPaymentRequest {
    amount: number;
    payment_method: string;
    transaction_id?: string;
    notes?: string;
    commission_ids?: number[];
}

export const recordAffiliatePayment = async (companyId: number, affiliateId: number, data: RecordPaymentRequest): Promise<APIResponse<Payment>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates/${affiliateId}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record payment.");
    }

    const result: APIResponse<Payment> = await response.json();
    return result;
};

export interface AffiliateCommissionsParams {
    page?: number;
    limit?: number;
    status?: string;
}

export const getAffiliateCommissions = async (companyId: number, affiliateId: number, params: AffiliateCommissionsParams = {}): Promise<APIResponse<CommissionsPaginatedResponse>> => {
    const { page = 1, limit = 20, status } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) searchParams.append('status', status);

    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates/${affiliateId}/commissions?${searchParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate commissions.");
    }

    const result: APIResponse<CommissionsPaginatedResponse> = await response.json();
    return result;
};

// Affiliate Applications Management
export interface AffiliateApplication {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    company_id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    application_status: 'pending' | 'approved' | 'rejected';
    applied_at: string;
    reviewed_at?: string;
    reviewer_notes?: string;
}

export interface ApplicationsPaginatedResponse {
    applications: AffiliateApplication[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        limit: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface GetApplicationsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export const getAffiliateApplications = async (companyId: number, params: GetApplicationsParams = {}): Promise<APIResponse<ApplicationsPaginatedResponse>> => {
    const { page = 1, limit = 20, status, search } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);

    const response = await fetch(`${baseUrl}/company/${companyId}/affiliate-applications?${searchParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate applications.");
    }

    const result: APIResponse<ApplicationsPaginatedResponse> = await response.json();
    return result;
};

export interface ReviewApplicationRequest {
    action: 'approve' | 'reject';
    reviewer_notes?: string;
}

export const reviewAffiliateApplication = async (companyId: number, applicationId: number, data: ReviewApplicationRequest): Promise<APIResponse<AffiliateApplication>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliate-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to review application.");
    }

    const result: APIResponse<AffiliateApplication> = await response.json();
    return result;
};

export const bulkReviewApplications = async (companyId: number, applicationIds: number[], action: 'approve' | 'reject', notes?: string): Promise<APIResponse<{ processed: number; errors: any[] }>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliate-applications/bulk-review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        },
        body: JSON.stringify({
            application_ids: applicationIds,
            action,
            reviewer_notes: notes
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process bulk review.");
    }

    const result: APIResponse<{ processed: number; errors: any[] }> = await response.json();
    return result;
}; 