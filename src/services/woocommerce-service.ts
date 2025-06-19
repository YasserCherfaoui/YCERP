import { baseUrl } from "@/app/constants";
import { AddOrderHistoryRequest } from "@/components/feature-specific/orders/add-order-history-dialog";
import { UpdateWooOrderSchema } from "@/components/feature-specific/orders/update-order-dialog";
import { Exchange } from "@/models/data/exchange.model";
import { Return } from "@/models/data/return.model";
import { OrderHistory, WooOrder } from "@/models/data/woo-order.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { WooOrdersResponse } from "@/models/responses/woo_orders.model";
import { CreateOrdersFromCSVResponse } from "@/models/responses/woocommerce.model";
import { CenterListResponse } from "@/models/responses/yalidine.cache";
import { CreateOrderSchema, ExchangeWooOrderSchema } from "@/schemas/order";
import { AssignRequest, ShuffleRequest, UpdateWooCommerceOrderStatusRequest } from "@/schemas/woocommerce";

const token = localStorage.getItem("token");
export const getWooCommerceOrders = async (
    params: {
        _page: number;
        status?: string;
        taken_by_id?: number;
        wilaya?: string;
        phone_number?: string;
        shipping_provider?: string;
        delivery_company_id?: number;
        yalidine_status?:string;
        employee_id?:number;
        delivery_date?:string;
        confirmed_variant_id?: number;
    }
): Promise<APIResponse<WooOrdersResponse>> => {
    let url = `${baseUrl}/woocommerce/?page=${params._page + 1}`;
    if (params.status) url += `&status=${encodeURIComponent(params.status)}`;
    if (params.taken_by_id) url += `&taken_by_id=${params.taken_by_id}`;
    if (params.wilaya) url += `&wilaya=${encodeURIComponent(params.wilaya)}`;
    if (params.phone_number) url += `&phone_number=${encodeURIComponent(params.phone_number)}`;
    if (params.shipping_provider) url += `&shipping_provider=${encodeURIComponent(params.shipping_provider)}`;
    if (params.delivery_company_id) url += `&delivery_company_id=${params.delivery_company_id}`;
    if (params.yalidine_status) url += `&yalidine_status=${encodeURIComponent(params.yalidine_status)}`;
    if (params.employee_id) url += `&employee_id=${params.employee_id}`;
    if (params.delivery_date) url += `&delivery_date=${encodeURIComponent(params.delivery_date)}`;
    if (params.confirmed_variant_id) url += `&product_variant_id=${params.confirmed_variant_id}`;
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

export const confirmWooCommerceOrderFromScratch = async (request: CreateOrderSchema): Promise<APIResponse<WooOrder>> => {
    const response = await fetch(`${baseUrl}/woocommerce/confirm-from-scratch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm WooCommerce order from scratch");
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

export const createOrdersFromCSV = async (file: File): Promise<APIResponse<CreateOrdersFromCSVResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/woocommerce/create-from-csv`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create orders from CSV');
  }

  const data: APIResponse<CreateOrdersFromCSVResponse> = await response.json();
  return data;
};



export const updateWooCommerceOrder = async (request: UpdateWooOrderSchema): Promise<APIResponse<WooOrder>> => {
  const response = await fetch(`${baseUrl}/woocommerce/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update WooCommerce order");
  }
  const data: APIResponse<WooOrder> = await response.json();
  return data;
};

export const printDeliveryEmployeeTable = async (request: {
  delivery_employee_id: number;
  delivery_date: string;
}): Promise<void> => {
  const response = await fetch(`${baseUrl}/woocommerce/print-delivery-employee-table`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to print delivery employee table");
  }

  // Get the PDF blob
  const blob = await response.blob();
  
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'delivery_table.pdf';
  
  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  window.URL.revokeObjectURL(url);
};

export const getYalidineCenter = async (id:string): Promise<APIResponse<CenterListResponse>> => {
  const response = await fetch(`${baseUrl}/woocommerce/stop-desk/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get Yalidine center");
  }
  const data: APIResponse<CenterListResponse> = await response.json();
  return data;
}

export const exchangeWooCommerceOrder = async (request: ExchangeWooOrderSchema): Promise<APIResponse<{
  order: WooOrder;
  return: Return;
  exchange: Exchange;
}>> => {
  const response = await fetch(`${baseUrl}/woocommerce/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to exchange WooCommerce order");
  }

  const data: APIResponse<{
    order: WooOrder;
    return: Return;
    exchange: Exchange;
  }> = await response.json();
  return data;
};


export const updateWooCommerceOrderStatus = async (request: UpdateWooCommerceOrderStatusRequest): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/woocommerce/update-order-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update WooCommerce order status");
  }
  const data: APIResponse<void> = await response.json();
  return data;
}