import { baseUrl } from "@/app/constants";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.error || "An error occurred");
};

// Common response format for queries
export interface QueryResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  execution: {
    execution_time_ms: number;
    executed_at: string;
    status: string;
  };
}

// Request interfaces
export interface QRCodeSalesRequest {
  start_date: string;
  end_date: string;
  company_id: number;
  page?: number;
  limit?: number;
}

export interface OrdersByStatusSizeRequest {
  order_status: string;
  sizes: number[];
  start_date: string;
  end_date: string;
  company_id: number;
  page?: number;
  limit?: number;
}

export interface EmployeeOrdersRequest {
  employee_id: number;
  start_date: string;
  end_date: string;
  order_status?: string;
  page?: number;
  limit?: number;
}

export interface ProductSalesByProviderRequest {
  start_date: string;
  end_date: string;
  order_status: string;
  shipping_provider: string;
  company_id: number;
  page?: number;
  limit?: number;
}

export interface SalesByTypeRequest {
  start_date: string;
  end_date: string;
  sale_type: string;
  page?: number;
  limit?: number;
}

export interface CustomerPhoneSearchRequest {
  phone_pattern: string;
  page?: number;
  limit?: number;
}

export interface InventoryTransactionLogsRequest {
  location_type: string;
  start_date: string;
  end_date: string;
  page?: number;
  limit?: number;
}

// Response data interfaces
export interface QRCodeSalesData {
  qr_code: string;
  total_quantity: number;
}

export interface ProductSalesData {
  name: string;
  first_price: number;
  price: number;
  total_quantity: number;
}

export interface SalesByTypeData {
  name: string;
  first_price: number;
  franchise_price: number;
  price: number;
  total_quantity: number;
}

export interface InventoryTransactionData {
  product: string;
  qty_before: number;
  qty_change: number;
  qty_after: number;
}

// Service functions
export const getQRCodeSalesSummary = async (
  params: QRCodeSalesRequest
): Promise<QueryResponse<QRCodeSalesData>> => {
  const response = await fetch(`${baseUrl}/queries/qr-code-sales-summary`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getOrdersByStatusSize = async (
  params: OrdersByStatusSizeRequest
): Promise<QueryResponse<any>> => {
  const response = await fetch(`${baseUrl}/queries/orders-by-status-size`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getEmployeeOrders = async (
  params: EmployeeOrdersRequest
): Promise<QueryResponse<any>> => {
  const response = await fetch(`${baseUrl}/queries/employee-orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getProductSalesByProvider = async (
  params: ProductSalesByProviderRequest
): Promise<QueryResponse<ProductSalesData>> => {
  const response = await fetch(`${baseUrl}/queries/product-sales-by-provider`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getSalesByType = async (
  params: SalesByTypeRequest
): Promise<QueryResponse<SalesByTypeData>> => {
  const response = await fetch(`${baseUrl}/queries/sales-by-type`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getCustomerPhoneSearch = async (
  params: CustomerPhoneSearchRequest
): Promise<QueryResponse<any>> => {
  const response = await fetch(`${baseUrl}/queries/customer-phone-search`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getInventoryTransactionLogs = async (
  params: InventoryTransactionLogsRequest
): Promise<QueryResponse<InventoryTransactionData>> => {
  const response = await fetch(`${baseUrl}/queries/inventory-transaction-logs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getInventoryTransactionLogsDesc = async (
  params: InventoryTransactionLogsRequest
): Promise<QueryResponse<InventoryTransactionData>> => {
  const response = await fetch(`${baseUrl}/queries/inventory-transaction-logs-desc`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...params,
      page: params.page || 1,
      limit: params.limit || 50,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
