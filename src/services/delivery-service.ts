import { baseUrl } from "@/app/constants";
import { DeliveryCompany, DeliveryEmployee } from "@/models/data/delivery.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateDeliveryCompanySchema, CreateEmployeeSchema } from "@/schemas/delivery";

const token = localStorage.getItem("token");

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