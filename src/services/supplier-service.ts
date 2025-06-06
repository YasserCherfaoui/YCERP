import { baseUrl } from "@/app/constants";
import { Supplier, SupplierBill, SupplierPayment, SupplierResponse } from "@/models/data/supplier.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateSupplierBillSchema, CreateSupplierSchema } from "@/schemas/supplier";

export const createSupplier = async (data: CreateSupplierSchema) => {
    const response = await fetch(`${baseUrl}/suppliers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove supplier.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const getSupplierBills = async (supplierID: number): Promise<APIResponse<SupplierBill[]>> => {
    const response = await fetch(`${baseUrl}/supplier-bills/${supplierID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch supplier bills.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const getSupplier = async (supplierID: number): Promise<APIResponse<SupplierResponse>> => {
    const response = await fetch(`${baseUrl}/supplier/${supplierID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch supplier.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const deleteSupplierBill = async (billID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/supplier-bills/${billID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete supplier bill.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}

export const addSupplierPayment = async (data: any): Promise<APIResponse<SupplierPayment>> => {
    const response = await fetch(`${baseUrl}/supplier-payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add supplier payment.");
    }

    const apiResponse = await response.json();
    return apiResponse;

}
