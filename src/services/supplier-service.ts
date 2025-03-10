import { baseUrl } from "@/app/constants";
import { Supplier, SupplierBill } from "@/models/data/supplier.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateSupplierBillSchema, CreateSupplierSchema } from "@/schemas/supplier";

export const createSupplier = async (data: CreateSupplierSchema) => {
    const response = await fetch(`${baseUrl}/suppliers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create supplier.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const getSuppliers = async (companyID: number): Promise<APIResponse<Array<Supplier>>> => {
    const response = await fetch(`${baseUrl}/suppliers/${companyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch suppliers.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const createSupplierBill = async (data: CreateSupplierBillSchema): Promise<APIResponse<SupplierBill>> => {
    const response = await fetch(`${baseUrl}/supplier-bills`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create supplier bill.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const removeSupplier = async (supplierID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/suppliers/${supplierID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove supplier.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}