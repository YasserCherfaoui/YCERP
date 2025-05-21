import { baseUrl } from "@/app/constants";
import { Order } from "@/models/data/order.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CommuneListResponse, YalidineCache } from "@/models/responses/yalidine.cache";
import { CreateOrderSchema } from "@/schemas/order";

export const createOrder = async (orderData: CreateOrderSchema): Promise<APIResponse<Order>> => {
  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create order.");
  }

  const createdOrder: APIResponse<Order> = await response.json();
  return createdOrder;
};

export const shuffleOrders = async (data: { selected_users: number[] }): Promise<APIResponse<any>> => {
  const response = await fetch(`${baseUrl}/woocommerce/shuffle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to shuffle orders.");
  }

  const shuffledOrders: APIResponse<any> = await response.json();
  return shuffledOrders;
}

export const assignOrders = async (data: { orders_ids: number[], user_id: number }): Promise<APIResponse<any>> => {
  const response = await fetch(`${baseUrl}/woocommerce/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to assign orders.");
  }

  const assignedOrders: APIResponse<any> = await response.json();
  return assignedOrders;
}

export  const getYalidineCache = async (): Promise<APIResponse<YalidineCache>> => {
  const response = await fetch(`${baseUrl}/woocommerce/cache`,{
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get yalidine cache.");
  }
  const cache: APIResponse<YalidineCache> = await response.json();  
  return cache;
}

export const getYalidineCommunes = async (state: number): Promise<APIResponse<CommuneListResponse>> => {
  const response = await fetch(`${baseUrl}/woocommerce/communes/${state}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get yalidine communes.");
  }
  const cache: APIResponse<CommuneListResponse> = await response.json();
  return cache;
}
