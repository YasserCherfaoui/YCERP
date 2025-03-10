import { baseUrl } from "@/app/constants";
import { Product } from "@/models/data/product.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateProductSchema, GenerateBarcodePDFSchema, UpdateProductSchema } from "@/schemas/product";

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

export const generateBarcodes = async (data: GenerateBarcodePDFSchema): Promise<void> => {
    const response = await fetch(`${baseUrl}/products/barcodes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate barcodes.");
    }
    // Get the blob from the response
    const blob = await response.blob();

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;

    // Try to get filename from Content-Disposition header, fallback to default
    const filename = response.headers.get('Content-Disposition')
        ?.split('filename=')[1] || 'download.pdf';

    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(url);

}

export const updateProduct = async (productId: number, productData: UpdateProductSchema): Promise<APIResponse<Product>> => {
    const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product.");
    }

    const updatedProduct: APIResponse<Product> = await response.json();
    return updatedProduct;
}
