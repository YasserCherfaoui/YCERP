import { baseUrl } from "@/app/constants";
import { DeliveryCompany, DeliveryEmployee } from "@/models/data/delivery.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateDeliveryCompanySchema, CreateEmployeeSchema, LoginEmployeeSchema } from "@/schemas/delivery";

const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

export const getDeliveryCompanies = async (): Promise<APIResponse<DeliveryCompany[]>> => {
  const response = await fetch(`${baseUrl}/delivery/companies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch delivery companies.");
  }
  return response.json();
};

export const createDeliveryCompany = async (data: CreateDeliveryCompanySchema): Promise<APIResponse<DeliveryCompany>> => {
  const response = await fetch(`${baseUrl}/delivery/company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create delivery company.");
  }
  return response.json();
};

export const getDeliveryCompany = async (id: number): Promise<APIResponse<DeliveryCompany>> => {
  const response = await fetch(`${baseUrl}/delivery/company/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch delivery company.");
  }
  return response.json();
};

export const createDeliveryEmployee = async (data: CreateEmployeeSchema): Promise<APIResponse<DeliveryEmployee>> => {
  const response = await fetch(`${baseUrl}/delivery/employee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create delivery employee.");
  }
  return response.json();
};

export const getDeliveryEmployees = async (companyId: number): Promise<APIResponse<DeliveryEmployee[]>> => {
  const response = await fetch(`${baseUrl}/delivery/company/${companyId}/employees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch delivery employees.");
  }
  return response.json();
};

export const exportOrdersAlgiers = async (data: { order_ids: number[] }): Promise<APIResponse<WooOrder[]>> => {
  const response = await fetch(`${baseUrl}/woocommerce/export-algiers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to export orders.");
  }
  return response.json();
};

// ? DELIVERY EMPLOYEE

export const getDeliveryEmployee = async (token: string): Promise<APIResponse<DeliveryEmployee>> => {
  const response = await fetch(`${baseUrl}/delivery/employee`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch delivery employee.");
  }
  return response.json();
};

export const loginEmployee = async (data: LoginEmployeeSchema): Promise<APIResponse<{ token: string, employee: DeliveryEmployee }>> => {
  const response = await fetch(`${baseUrl}/delivery/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login employee.");
  }
  return response.json();
};

export const getDeliveryOrders = async (employeeId: number): Promise<APIResponse<WooOrder[]>> => {
  const response = await fetch(`${baseUrl}/delivery/employees/${employeeId}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch delivery orders.");
  }
  return response.json();
};

export const updateOrderStatus = async (orderId: number, status: string, reason?: string): Promise<APIResponse<WooOrder>> => {
  const response = await fetch(`${baseUrl}/delivery/employee/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ status, order_id: orderId, comments: reason }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update order status.");
  }
  return response.json();
};