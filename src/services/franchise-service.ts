import { baseUrl } from "@/app/constants";
import { FranchiseAdministrator } from "@/models/data/administrator.model";
import { EntryBill, ExitBill } from "@/models/data/bill.model";
import { Franchise, FranchiseTotals } from "@/models/data/franchise.model";
import { Sale } from "@/models/data/sale.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { InventoryWithCostResponse } from "@/models/responses/inventory-with-cost.model";
import { MyFranchiseAuthResponse } from "@/models/responses/my-franchise-auth-response.model";
import { LoginFormSchema } from "@/schemas/auth";
import { CreateEntryBillSchema } from "@/schemas/bill";
import { CreateFranchiseSchema } from "@/schemas/franchise";
import { CreateSaleSchema } from "@/schemas/sale";


export const createFranchise = async (data: CreateFranchiseSchema): Promise<APIResponse<Franchise>> => {
    const response = await fetch(`${baseUrl}/franchises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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

export const getFranchise = async (id: number): Promise<APIResponse<Franchise>> => {
    const response = await fetch(`${baseUrl}/franchises/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise.");
    }

    const apiResponse: APIResponse<Franchise> = await response.json();
    return apiResponse;
}

export const getMyCompanyFranchises = async (id: number): Promise<APIResponse<Array<Franchise>>> => {
    const response = await fetch(`${baseUrl}/franchises/company/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise exit bills.");
    }

    const apiResponse: APIResponse<Array<ExitBill>> = await response.json();
    return apiResponse;

}

export const getSuperFranchiseExitBills = async (id: number): Promise<APIResponse<Array<ExitBill>>> => {
    const response = await fetch(`${baseUrl}/franchises/bills/exit/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise entry bills.");
    }

    const apiResponse: APIResponse<Array<EntryBill>> = await response.json();
    return apiResponse;

}

export const getSuperFranchiseEntryBills = async (id: number): Promise<APIResponse<Array<EntryBill>>> => {
    const response = await fetch(`${baseUrl}/franchises/bills/entry/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise entry bills.");
    }

    const apiResponse: APIResponse<Array<EntryBill>> = await response.json();
    return apiResponse;

}

export const getFranchiseInventory = async (id: number): Promise<APIResponse<InventoryWithCostResponse>> => {
    const token = localStorage.getItem('token') ? localStorage.getItem('token') : localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/franchises/inventory/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise inventory.");
    }

    const apiResponse: APIResponse<InventoryWithCostResponse> = await response.json();
    return apiResponse;

}

export const getCompanyFranchiseInventory = async (id: number): Promise<APIResponse<InventoryWithCostResponse>> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/franchises/inventory/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch franchise inventory.");
    }

const apiResponse: APIResponse<InventoryWithCostResponse> = await response.json();
    return apiResponse;

}
export const deleteFranchise = async (id: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/franchises/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete franchise.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}

export const createFranchiseEntryBill = async (data: CreateEntryBillSchema): Promise<APIResponse<EntryBill>> => {
    const response = await fetch(`${baseUrl}/franchise/bills/entry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create entry bill.");
    }

    const apiResponse: APIResponse<EntryBill> = await response.json();
    return apiResponse;

}

export const getCompanyFranchiseSales = async (franchiseID: number): Promise<APIResponse<Sale[]>> => {
    const response = await fetch(`${baseUrl}/franchises/sales/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create entry bill.");
    }

    const apiResponse: APIResponse<Sale[]> = await response.json();
    return apiResponse;

}
export const getFranchiseSales = async (franchiseID: number): Promise<APIResponse<Sale[]>> => {
    const response = await fetch(`${baseUrl}/franchise/sales/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create entry bill.");
    }

    const apiResponse: APIResponse<Sale[]> = await response.json();
    return apiResponse;

}

export const createFranchiseSale = async (data: CreateSaleSchema): Promise<APIResponse<Sale>> => {
    const response = await fetch(`${baseUrl}/franchise/sale`, {
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

    const apiResponse: APIResponse<Sale> = await response.json();
    return apiResponse;

}

export const getFranchisePaymentTotals = async (franchiseID: number): Promise<APIResponse<FranchiseTotals>> => {
    const response = await fetch(`${baseUrl}/franchise/payment-totals/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get payment totals.");
    }

    const apiResponse: APIResponse<FranchiseTotals> = await response.json();
    return apiResponse;

}


export const getCompanyFranchisePaymentTotals = async (franchiseID: number): Promise<APIResponse<FranchiseTotals>> => {
    const response = await fetch(`${baseUrl}/franchise/payment-totals/${franchiseID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get payment totals.");
    }

    const apiResponse: APIResponse<FranchiseTotals> = await response.json();
    return apiResponse;

}


export const getFranchiseSalesTotal = async (franchiseID: number, from: Date, to: Date): Promise<APIResponse<{ total_amount: number, total_franchise_price: number, total_benefit:number }>> => {
    const response = await fetch(`${baseUrl}/franchise/sales/totals/${franchiseID}?start_date=${from.toISOString()}&end_date=${to.toISOString()}`, {
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

    const apiResponse: APIResponse<{ total_amount: number, total_franchise_price: number, total_benefit:number }> = await response.json();
    return apiResponse;
}

export const getCompanyFranchiseSalesTotal = async (franchiseID: number, from: Date, to: Date): Promise<APIResponse<{ total_amount: number, total_franchise_price: number, total_benefit:number }>> => {
    const response = await fetch(`${baseUrl}/franchise/sales/totals/${franchiseID}?start_date=${from.toISOString()}&end_date=${to.toISOString()}`, {
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

    const apiResponse: APIResponse<{ total_amount: number, total_franchise_price:number, total_benefit:number }> = await response.json();
    return apiResponse;
}

export const downloadAndPrintFranchisePDF = async (saleID: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/franchise/sales/receipt/${saleID}`, {
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
