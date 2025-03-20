import { baseUrl } from "@/app/constants";
import { Return } from "@/models/data/return.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateSaleReturnSchema, CreateUnknownReturnSchema } from "@/schemas/return-schema";


export const createReturnSale = async (data: CreateSaleReturnSchema) => {
    const response = await fetch(`${baseUrl}/returns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create return.");
    }

    const createdReturn = await response.json();
    return createdReturn;
}


export const createCompanyUnknownReturn = async (data: CreateUnknownReturnSchema): Promise<APIResponse<Return>> => {
    const response = await fetch(`${baseUrl}/company-unknown-returns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create unknown return.");
    }

    const createdReturn = await response.json();
    return createdReturn;

}

export const getCompanyUnknownReturns = async (comapnyID: number): Promise<APIResponse<Return[]>> => {
    const response = await fetch(`${baseUrl}/company-unknown-returns/${comapnyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get unknown returns.");
    }

    const returns = await response.json();
    return returns;
}

export const removeCompanyUnknownReturn = async (returnID: number): Promise<APIResponse<Return>> => {
    const response = await fetch(`${baseUrl}/company-unknown-returns/${returnID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove unknown return.");
    }

    const removedReturn = await response.json();
    return removedReturn;
}
