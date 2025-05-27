import { baseUrl } from "@/app/constants";
import { Sale } from "@/models/data/sale.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { SalesCountResponse } from "@/models/responses/sales-count.model";
import { CreateSaleSchema } from "@/schemas/sale";

export const createCompanySale = async (data: CreateSaleSchema): Promise<APIResponse<Sale>> => {
    const response = await fetch(`${baseUrl}/sales`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sales.");
    }

    const apiResponse: APIResponse<Sale[]> = await response.json();
    return apiResponse;
}


export const getCompanyAlgiersSales = async (companyID: number): Promise<APIResponse<Sale[]>> => {
    const response = await fetch(`${baseUrl}/sales/${companyID}?sale_type=algiers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sales.");
    }

    const apiResponse: APIResponse<Sale[]> = await response.json();
    return apiResponse;
}

export const removeSale = async (saleID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/sales/${saleID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove sale.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;
}

export const getSalesTotal = async (companyID: number, from: Date, to: Date): Promise<APIResponse<{ total_amount: number, total_benefit:number }>> => {
    const response = await fetch(`${baseUrl}/sales/totals?company_id=${companyID}&start_date=${from.toISOString()}&end_date=${to.toISOString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sales total.");
    }

    const apiResponse: APIResponse<{ total_amount: number, total_benefit:number }> = await response.json();
    return apiResponse;
}

export const getAlgiersSalesTotal = async (companyID: number, from: Date, to: Date): Promise<APIResponse<{ total_amount: number, total_benefit:number }>> => {
    const response = await fetch(`${baseUrl}/sales/totals?company_id=${companyID}&start_date=${from.toISOString()}&end_date=${to.toISOString()}&sale_type=algiers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sales total.");
    }

    const apiResponse: APIResponse<{ total_amount: number, total_benefit:number }> = await response.json();
    return apiResponse;
}

export const removeFranchiseSale = async (saleID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/franchise/sales/${saleID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove sale.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;
}

export const removeCompanyFranchiseSale = async (saleID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/franchise/sales/${saleID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove sale.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;
}

export const downloadAndPrintPDF = async (saleID: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/sales/receipt/${saleID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const printWindow = window.open(url);
    if (printWindow) {
        printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    } else {
        throw new Error("Failed to open print window.");
    }
}

export const getSalesCount = async (params: {
    company_id?: string;
    franchise_id?: string;
    start_date: string;
    end_date: string;
    sale_type?: string;
}): Promise<APIResponse<SalesCountResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.company_id) {
        queryParams.append('company_id', params.company_id);
    }
    if (params.franchise_id) {
        queryParams.append('franchise_id', params.franchise_id);
    }
    queryParams.append('start_date', params.start_date);
    queryParams.append('end_date', params.end_date);
    if (params.sale_type) {
        queryParams.append('sale_type', params.sale_type);
    }

    const response = await fetch(`${baseUrl}/sales/count?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get sales count.");
    }

    const apiResponse: APIResponse<SalesCountResponse> = await response.json();
    return apiResponse;
}
