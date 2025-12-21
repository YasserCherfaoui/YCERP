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
import { AssignRequest, DeclareEmptyExchangeRequest, ShuffleRequest, UpdateWooCommerceOrderStatusRequest } from "@/schemas/woocommerce";

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
        company_id?: number;
        start?: string;
        end?: string;
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
    if (params.company_id) url += `&company_id=${params.company_id}`;
    if (params.start) url += `&start=${encodeURIComponent(params.start)}`;
    if (params.end) url += `&end=${encodeURIComponent(params.end)}`;
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
    const response = await fetch(`${baseUrl}/woocommerce/export`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ order_ids: [orderID] }),
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

export const createOrdersFromCSV = async (file: File, company_id: number): Promise<APIResponse<CreateOrdersFromCSVResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/woocommerce/create-from-csv/${company_id}`, {
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

export const cloneWooCommerceOrder = async (order: WooOrder): Promise<APIResponse<WooOrder>> => {
  // Map WooOrder to CreateOrderSchema
  // Prefer confirmed_order_items if available, otherwise use line_items
  const itemsToClone = order.confirmed_order_items && order.confirmed_order_items.length > 0
    ? order.confirmed_order_items
    : order.line_items || [];

  const cloneData: CreateOrderSchema = {
    company_id: order.company_id || 0,
    shipping: {
      full_name: order.shipping_name || order.billing_name || "",
      phone_number: order.customer_phone || "",
      phone_number_2: order.customer_phone_2 || undefined,
      address: order.shipping_address_1 || order.billing_address_1 || "",
      city: order.shipping_city || order.billing_city || "",
      state: order.shipping_city || "",
      wilaya: order.woo_shipping?.wilaya_name || "",
      commune: order.woo_shipping?.commune_name || "",
      delivery_id: order.woo_shipping?.delivery_company_id || undefined,
      comments: order.comments || undefined,
    },
    order_items: itemsToClone.map((item) => {
      // Handle ConfirmedOrderItem (has product_variant_id)
      if ('product_variant_id' in item && item.product_variant_id) {
        return {
          product_id: item.product_id || 0,
          product_variant_id: item.product_variant_id,
          discount: 0,
          quantity: item.quantity || 0,
        };
      }
      // Handle WooOrderItem (has variation_id)
      const lineItem = item as any;
      return {
        product_id: lineItem.product_id || 0,
        product_variant_id: lineItem.variation_id || 0,
        discount: 0,
        quantity: lineItem.quantity || 0,
      };
    }).filter(item => item.product_id > 0 && item.product_variant_id > 0), // Filter out invalid items
    total: order.final_price || order.amount || Number(order.total) || 0,
    status: "unconfirmed",
    discount: order.discount || 0,
    taken_by_id: order.taken_by_id || undefined,
    shipping_provider: (order.woo_shipping?.shipping_provider as "yalidine" | "my_companies") || "yalidine",
    delivery_type: (order.woo_shipping?.delivery_type as "home" | "stopdesk") || "home",
    selected_commune: order.woo_shipping?.selected_commune || undefined,
    selected_center: order.woo_shipping?.selected_center || undefined,
    first_delivery_cost: order.woo_shipping?.first_delivery_cost || undefined,
    second_delivery_cost: order.woo_shipping?.second_delivery_cost || undefined,
  };

  return confirmWooCommerceOrderFromScratch(cloneData);
}

export const declareEmptyExchange = async (request: DeclareEmptyExchangeRequest): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/woocommerce/declare-empty-exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to declare empty exchange");
  }
  const data: APIResponse<void> = await response.json();
  return data;
}

export const getOrderStatusCount = async (params?: {
  date_from?: string;
  date_to?: string;
  wilaya?: string;
  shipping_provider?: string;
  company_id?: number;
}): Promise<APIResponse<{
  status_counts: { status: string; count: number }[];
  total_orders: number;
  date_from: string;
  date_to: string;
  wilaya?: string;
  shipping_provider?: string;
  company_id?: number;
}>> => {
  const currentToken = localStorage.getItem("token");
  let url = `${baseUrl}/orders/status-count`;
  const queryParams = new URLSearchParams();
  
  if (params?.date_from) queryParams.append('date_from', params.date_from);
  if (params?.date_to) queryParams.append('date_to', params.date_to);
  if (params?.wilaya) queryParams.append('wilaya', params.wilaya);
  if (params?.shipping_provider) queryParams.append('shipping_provider', params.shipping_provider);
  if (params?.company_id) queryParams.append('company_id', params.company_id.toString());
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch order status count");
  }

  const data = await response.json();
  return data;
}

export const getManagerOrderStatusCount = async (params?: {
  date_from?: string;
  date_to?: string;
  wilaya?: string;
  shipping_provider?: string;
  company_id?: number;
  manager_id?: number;
}): Promise<APIResponse<{
  managers: {
    manager_id: number;
    manager_name: string;
    manager_email: string;
    status_counts: { status: string; count: number }[];
    total_orders: number;
  }[];
  date_from: string;
  date_to: string;
  wilaya?: string;
  shipping_provider?: string;
  company_id?: number;
}>> => {
  const currentToken = localStorage.getItem("token");
  let url = `${baseUrl}/orders/manager-status-count`;
  const queryParams = new URLSearchParams();
  
  if (params?.date_from) queryParams.append('date_from', params.date_from);
  if (params?.date_to) queryParams.append('date_to', params.date_to);
  if (params?.wilaya) queryParams.append('wilaya', params.wilaya);
  if (params?.shipping_provider) queryParams.append('shipping_provider', params.shipping_provider);
  if (params?.company_id) queryParams.append('company_id', params.company_id.toString());
  if (params?.manager_id) queryParams.append('manager_id', params.manager_id.toString());
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + currentToken,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch manager order status count");
  }

  const data = await response.json();
  return data;
}