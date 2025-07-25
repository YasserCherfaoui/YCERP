import { baseUrl } from "@/app/constants";
import { AffiliateFormValues } from "@/components/feature-specific/company-products/set-affiliate-props-dialog";
import { Product, ProductVariant } from "@/models/data/product.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CompanyStatsResponse, ProductPurchasesResponse } from "@/models/responses/company-stats.model";
import { CreateProductSchema, CreateProductVariantSchema, GenerateBarcodePDFSchema, SalesQuantityRequestSchema, UpdateProductSchema } from "@/schemas/product";

export const createProduct = async (productData: CreateProductSchema): Promise<APIResponse<Product>> => {
    const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products.");
    }

    const apiResponse: APIResponse<Product[]> = await response.json();
    return apiResponse;

}
export const getFranchiseAllProducts = async (companyID: number): Promise<APIResponse<Product[]>> => {
    const response = await fetch(`${baseUrl}/products/${companyID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`${baseUrl}/products/qrcodes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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

export const generateThermalBarcodes = async (data: GenerateBarcodePDFSchema): Promise<void> => {
    const response = await fetch(`${baseUrl}/products/barcodes-thermal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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

export const createProductVariant = async (productVariantData: CreateProductVariantSchema): Promise<APIResponse<ProductVariant>> => {
    const response = await fetch(`${baseUrl}/products-variants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productVariantData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product variant.");
    }

    const createdProductVariant: APIResponse<ProductVariant> = await response.json();
    return createdProductVariant;
}


export const getProductSales = async (data: SalesQuantityRequestSchema): Promise<APIResponse<CompanyStatsResponse>> => {
    const response = await fetch(`${baseUrl}/products/sales-quantities/${data.company_id}?startDate=${data.start_date.toISOString().split('T')[0]}&endDate=${data.end_date.toISOString().split('T')[0]}&page=${data.page}&limit=${data.limit ?? 10}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get product sales.");
    }

    const apiResponse: APIResponse<CompanyStatsResponse> = await response.json();
    return apiResponse;
}


export const getProductSalesByFranchise = async (data: SalesQuantityRequestSchema): Promise<APIResponse<CompanyStatsResponse>> => {
    const response = await fetch(`${baseUrl}/products/sales-quantities-franchise/${data.company_id}?startDate=${data.start_date.toISOString().split('T')[0]}&endDate=${data.end_date.toISOString().split('T')[0]}&page=${data.page}&limit=${data.limit ?? 10}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get product sales.");
    }

    const apiResponse: APIResponse<CompanyStatsResponse> = await response.json();
    return apiResponse;
}


export const getProductPurchases = async (data: SalesQuantityRequestSchema): Promise<APIResponse<ProductPurchasesResponse>> => {
    const response = await fetch(`${baseUrl}/supplier-bills/quantities/${data.company_id}?startDate=${data.start_date.toISOString().split('T')[0]}&endDate=${data.end_date.toISOString().split('T')[0]}&page=${data.page}&limit=${data.limit ?? 10}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get product purchases.");
    }

    const apiResponse: APIResponse<ProductPurchasesResponse> = await response.json();
    return apiResponse;
}

export const setAffiliateProps = async (data: AffiliateFormValues): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/products/affiliate-props`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to set affiliate props.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;
}