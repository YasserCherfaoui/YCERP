import { baseUrl } from "@/app/constants";
import { ExitBill } from "@/models/data/bill.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateExitBillSchema } from "@/schemas/bill";

export const createExitBill = async (data: CreateExitBillSchema): Promise<APIResponse<ExitBill>> => {
    const response = await fetch(`${baseUrl}/bills/exit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create exit bill.");
    }

    const apiResponse: APIResponse<ExitBill> = await response.json();
    return apiResponse;

}

export const getCompanyExitBills = async (companyID: number): Promise<APIResponse<Array<ExitBill>>> => {
    const response = await fetch(`${baseUrl}/bills/exit/company/${companyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch exit bills.");
    }

    const apiResponse: APIResponse<Array<ExitBill>> = await response.json();
    return apiResponse;

}