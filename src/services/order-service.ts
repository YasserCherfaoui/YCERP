import { baseUrl } from "@/app/constants";
import { Order } from "@/models/data/order.model";
import { APIResponse } from "@/models/responses/api-response.model";
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