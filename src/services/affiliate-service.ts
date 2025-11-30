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

// Password Reset API Functions
export interface RequestPasswordResetData {
    email: string;
}

export interface VerifyOTPData {
    email: string;
    otp_code: string;
}

export interface ResetPasswordData {
    verification_token: string;
    new_password: string;
}

export interface VerifyOTPResponse {
    verification_token: string;
}

export const requestPasswordReset = async (data: RequestPasswordResetData): Promise<APIResponse<null>> => {
    const response = await fetch(`${baseUrl}/affiliates/password-reset/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    const result: APIResponse<null> = await response.json();

    if (!response.ok) {
        if (result.error?.description) {
            throw new Error(result.error.description);
        }
        throw new Error(result.message || "Failed to request password reset.");
    }

    return result;
};

export const verifyOTP = async (data: VerifyOTPData): Promise<APIResponse<VerifyOTPResponse>> => {
    const response = await fetch(`${baseUrl}/affiliates/password-reset/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    const result: APIResponse<VerifyOTPResponse> = await response.json();

    if (!response.ok) {
        if (result.error?.code === "invalid-credentials") {
            throw new Error("Invalid email or OTP code. Please check your email and try again.");
        }
        if (result.error?.description) {
            throw new Error(result.error.description);
        }
        throw new Error(result.message || "Failed to verify OTP.");
    }

    return result;
};

export const resetPassword = async (data: ResetPasswordData): Promise<APIResponse<null>> => {
    const response = await fetch(`${baseUrl}/affiliates/password-reset/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    const result: APIResponse<null> = await response.json();

    if (!response.ok) {
        if (result.error?.code === "invalid-token") {
            throw new Error("Invalid or expired verification token. Please try the password reset process again.");
        }
        if (result.error?.code === "account-inactive") {
            throw new Error("Account is not active. Please contact support.");
        }
        if (result.error?.code === "invalid-body") {
            throw new Error("Password must be at least 8 characters long.");
        }
        if (result.error?.description) {
            throw new Error(result.error.description);
        }
        throw new Error(result.message || "Failed to reset password.");
    }

    return result;
};

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

// Affiliate Orders (Self) ----------------------------------------------------
export interface AffiliateOrderCommissionSummary {
    id: number;
    amount: number;
    status: string;
}

export interface AffiliateOrder {
    id: number;
    order_status: string;
    customer_phone: string;
    billing_name: string;
    shipping_address1: string;
    amount: number;
    date_created: string;
    commission?: AffiliateOrderCommissionSummary | null;
}

export interface AffiliateOrdersMeta {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface AffiliateOrdersResponse {
    orders: AffiliateOrder[];
    meta: AffiliateOrdersMeta;
}

export interface GetAffiliateOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    start?: string; // YYYY-MM-DD
    end?: string;   // YYYY-MM-DD
    phone_number?: string;
}

export const getAffiliateOrders = async (
    params: GetAffiliateOrdersParams = {}
): Promise<APIResponse<AffiliateOrdersResponse>> => {
    const { page = 1, limit = 20, status, start, end, phone_number } = params;

    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) searchParams.append("status", status);
    if (start) searchParams.append("start", start);
    if (end) searchParams.append("end", end);
    if (phone_number) searchParams.append("phone_number", phone_number);

    const response = await fetch(`${baseUrl}/affiliates/orders?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAffiliateToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate orders.");
    }

    const result: APIResponse<AffiliateOrdersResponse> = await response.json();
    return result;
};

export interface ImportAffiliateOrdersCsvResult {
    orders_created: number;
    items_created: number;
    skipped: number;
    skipped_rows: Array<{ error: string; row: string }>;
}

export const importAffiliateOrdersCsv = async (
    file: File
): Promise<APIResponse<ImportAffiliateOrdersCsvResult>> => {
    const form = new FormData();
    form.append('file', file);

    const response = await fetch(`${baseUrl}/affiliates/orders/import-csv`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAffiliateToken()}`
        },
        body: form
    });

    const result: APIResponse<ImportAffiliateOrdersCsvResult> = await response.json();

    if (!response.ok) {
        if (result?.error?.description) {
            throw new Error(result.error.description);
        }
        throw new Error(result?.message || "Failed to import orders CSV.");
    }

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
    is_pro?: boolean;
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

export interface AffiliateTotals {
    total_earnings: number;
    total_paid: number;
    pending_approved: number;
    pending_pending: number;
}

export const getAffiliateTotals = async (companyId: number, affiliateId: number): Promise<APIResponse<AffiliateTotals>> => {
    const response = await fetch(`${baseUrl}/company/${companyId}/affiliates/${affiliateId}/totals`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch affiliate totals.");
    }

    const result: APIResponse<AffiliateTotals> = await response.json();
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

export const syncProductsWithShopify = async (): Promise<APIResponse<any>> => {
    const response = await fetch(`${baseUrl}/affiliates/products/shopify/sync`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync products with Shopify.");
    }

    const result: APIResponse<any> = await response.json();
    return result;
};

// Company Commissions Management
export interface CommissionStatistics {
    total_count: number;
    by_status: {
        pending?: number;
        approved?: number;
        paid?: number;
        partially_paid?: number;
        cancelled?: number;
    };
    amounts: {
        pending?: {
            total_amount: number;
            paid_amount: number;
        };
        approved?: {
            total_amount: number;
            paid_amount: number;
        };
        paid?: {
            total_amount: number;
            paid_amount: number;
        };
        partially_paid?: {
            total_amount: number;
            paid_amount: number;
        };
        cancelled?: {
            total_amount: number;
            paid_amount: number;
        };
    };
    totals: {
        total_amount: number;
        total_paid_amount: number;
        unpaid_amount: number;
        pending_amount: number;
        approved_amount: number;
        cancelled_amount: number;
    };
}

export interface AllCommissionsPaginatedResponse {
    commissions: Commission[];
    statistics: CommissionStatistics;
    pagination: {
        current_page: number;
        total_pages: number;
        total_count: number;
        limit: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface GetAllCommissionsParams {
    page?: number;
    limit?: number;
    status?: string;
    affiliate_id?: number;
    search?: string;
    sort_by?: 'created_at' | 'amount' | 'status' | 'affiliate_name';
    sort_order?: 'asc' | 'desc';
}

export const getCompanyCommissions = async (companyId: number, params: GetAllCommissionsParams = {}): Promise<APIResponse<AllCommissionsPaginatedResponse>> => {
    const { page = 1, limit = 20, status, affiliate_id, search, sort_by, sort_order } = params;
    
    const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) searchParams.append('status', status);
    if (affiliate_id) searchParams.append('affiliate_id', affiliate_id.toString());
    if (search) searchParams.append('search', search);
    if (sort_by) searchParams.append('sort_by', sort_by);
    if (sort_order) searchParams.append('sort_order', sort_order);

    const response = await fetch(`${baseUrl}/company/${companyId}/commissions?${searchParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCompanyToken()}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch company commissions.");
    }

    const result: APIResponse<AllCommissionsPaginatedResponse> = await response.json();
    return result;
}; 