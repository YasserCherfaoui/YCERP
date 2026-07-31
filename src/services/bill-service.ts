import { baseUrl } from "@/app/constants";
import { ExitBill, ExitBillStatus } from "@/models/data/bill.model";
import { FranchisePayment } from "@/models/data/franchise.model";
import type { APIError } from "@/models/responses/api-response.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateExitBillSchema, CreateFranchisePayment, PrepareExitBillSchema, UpdateExitBillSchema } from "@/schemas/bill";

export const createExitBill = async (data: CreateExitBillSchema): Promise<APIResponse<ExitBill>> => {
    const response = await fetch(`${baseUrl}/bills/exit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || "Failed to create exit bill.") as Error & {
            apiError?: APIError;
        };
        if (errorData.error) {
            err.apiError = errorData.error as APIError;
        }
        throw err;
    }

    const apiResponse: APIResponse<ExitBill> = await response.json();
    return apiResponse;

}

export const getCompanyExitBills = async (
    companyID: number,
    options?: { status?: ExitBillStatus | string }
): Promise<APIResponse<Array<ExitBill>>> => {
    const params = new URLSearchParams();
    if (options?.status) {
        params.set("status", options.status);
    }
    const query = params.toString();
    const response = await fetch(
        `${baseUrl}/bills/exit/company/${companyID}${query ? `?${query}` : ""}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch exit bills.");
    }

    const apiResponse: APIResponse<Array<ExitBill>> = await response.json();
    return apiResponse;

}

export const prepareExitBill = async (
    exitBillID: number,
    data: PrepareExitBillSchema
): Promise<APIResponse<ExitBill>> => {
    const response = await fetch(`${baseUrl}/bills/exit/${exitBillID}/prepare`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to prepare exit bill.");
    }

    const apiResponse: APIResponse<ExitBill> = await response.json();
    return apiResponse;
}

export const removeExitBill = async (billID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/bills/exit/${billID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove exit bill.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}

export const deleteEntryBill = async (billID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/bills/entry/${billID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove entry bill.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}

export const recordFranchisePayment = async (data: CreateFranchisePayment): Promise<APIResponse<FranchisePayment>> => {
    const response = await fetch(`${baseUrl}/franchises/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record franchise payment.");
    }

    const apiResponse: APIResponse<any> = await response.json();
    return apiResponse;
}

export const downloadExitBillPDF = async (exitBillID: number): Promise<void> => {
    try {
        const response = await fetch(`${baseUrl}/bills/exit/${exitBillID}/print`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to download exit bill PDF.");
        }

        // Convert the response to a blob
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Open the PDF in a new tab
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
            throw new Error("Popup blocked. Please allow popups for this site.");
        }
        
        // Trigger the print dialog once the PDF is loaded
        newWindow.addEventListener('load', () => {
            newWindow.print();
        });
        
        // Clean up the URL object after a delay to ensure the PDF has loaded
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error("Error printing exit bill PDF:", error);
        throw error;
    }
};

export const updateExitBill = async (data: UpdateExitBillSchema): Promise<APIResponse<ExitBill>> => {
    const response = await fetch(`${baseUrl}/bills/exit`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update exit bill.");
    }

    const apiResponse: APIResponse<ExitBill> = await response.json();
    return apiResponse;
}

