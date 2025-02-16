import { baseUrl } from "@/app/constants";
import { Product } from "@/models/data/product.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateProductSchema } from "@/schemas/product";

export const createProduct = async (productData: CreateProductSchema): Promise<APIResponse<Product>> => {
    const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product.");
    }

    const createdProduct: APIResponse<Product> = await response.json();
    return createdProduct;
}

export const getAllProducts = async (): Promise<APIResponse<Product[]>> => {
    const response = await fetch(`${baseUrl}/products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products.");
    }

    const apiResponse: APIResponse<Product[]> = await response.json();
    return apiResponse;

}

export const getAllProductsWithVariantsByCompany = async (companyId: number): Promise<APIResponse<Product[]>> => {
    const response = await fetch(`${baseUrl}/company/products/variants/${companyId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products.");
    }

    const apiResponse: APIResponse<Product[]> = await response.json();
    return apiResponse;

}

export const deleteProducts = async (productIds: number[]): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/products`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            "ids": productIds
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete products.");
    }
    
    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}