import { baseUrl } from "@/app/constants";
import { AddOrderHistoryRequest } from "@/components/feature-specific/orders/add-order-history-dialog";
import { OrderHistory, WooOrder } from "@/models/data/woo-order.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { WooOrdersResponse } from "@/models/responses/woo_orders.model";
import { CreateOrderSchema } from "@/schemas/order";
import { AssignRequest, ShuffleRequest } from "@/schemas/woocommerce";

const token = localStorage.getItem("token");
export const getWooCommerceOrders = async (
    _page = 0,
    status?: string,
    taken_by_id?: number,
    wilaya?: string,
    phone_number?: string,
    shipping_provider?: string,
    delivery_company_id?: number,
    yalidine_status?:string
): Promise<APIResponse<WooOrdersResponse>> => {
    let url = `${baseUrl}/woocommerce/?page=${_page + 1}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (taken_by_id) url += `&taken_by_id=${taken_by_id}`;
    if (wilaya) url += `&wilaya=${encodeURIComponent(wilaya)}`;
    if (phone_number) url += `&phone_number=${encodeURIComponent(phone_number)}`;
    if (shipping_provider) url += `&shipping_provider=${encodeURIComponent(shipping_provider)}`;
    if (delivery_company_id) url += `&delivery_company_id=${delivery_company_id}`;
    if (yalidine_status) url += `&yalidine_status=${encodeURIComponent(yalidine_status)}`;
    const response = await fetch(url, {
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
    const data: APIResponse<WooOrdersResponse> = await response.json();
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

export const dispatchWooCommerceOrders = async (orderIDs: number[]): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/dispatch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ order_ids: orderIDs }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to dispatch WooCommerce orders");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};

export const exportWooCommerceOrders = async (orderIDs: number[]): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/woocommerce/export`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ order_ids: orderIDs }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export WooCommerce orders");
    }
    const data: APIResponse<void> = await response.json();
    return data;
};

export const refreshWooCommerceStatus = async () => {
    const response = await fetch(`${baseUrl}/woocommerce/update-status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh WooCommerce status");
    }
    const data: APIResponse<void> = await response.json();
    return data;
}

export const addOrderHistory = async (request: AddOrderHistoryRequest): Promise<APIResponse<OrderHistory>> => {
    const response = await fetch(`${baseUrl}/woocommerce/create-order-history`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add order history");
    }
    const data: APIResponse<OrderHistory> = await response.json();
    return data;
}