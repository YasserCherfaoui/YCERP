import { baseUrl } from "@/app/constants";
import { WooOrder } from "@/models/data/woo-order.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateOrderSchema } from "@/schemas/order";
import { AssignRequest, ShuffleRequest } from "@/schemas/woocommerce";

const token = localStorage.getItem("token");
export const getWooCommerceOrders = async (): Promise<APIResponse<WooOrder[]>> => {
    const response = await fetch(`${baseUrl}/woocommerce/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch WooCommerce orders");
    }
    const data: APIResponse<WooOrder[]> = await response.json();
    return data;
};

export const getWooCommerceOrder = async (orderID: number): Promise<APIResponse<WooOrder>> => {
    const response = await fetch(`${baseUrl}/woocommerce/${orderID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch WooCommerce order");
    }
    const data: APIResponse<WooOrder> = await response.json();
    return data;
};
export const cancelWooCommerceOrder = async (orderID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/${orderID}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel WooCommerce order");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};

export const assignWooCommerceOrder = async (request: AssignRequest): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign WooCommerce order");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};

export const shuffleWooCommerceOrders = async (request: ShuffleRequest): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/shuffle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to shuffle WooCommerce orders");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};

export const confirmWooCommerceOrder = async (request: CreateOrderSchema): Promise<APIResponse<WooOrder>> => {
    const response = await fetch(`${baseUrl}/woocommerce/confirm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm WooCommerce order");
    }
    const data: APIResponse<WooOrder> = await response.json();
    return data;
};

export const dispatchWooCommerceOrder = async (orderID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/dispatch/${orderID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to dispatch WooCommerce order");
    }
    const data: APIResponse<void> = await response.json();
    return data;
}; 

export const exportWooCommerceOrder = async (orderID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/export/${orderID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export WooCommerce order");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};  