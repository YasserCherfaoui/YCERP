import { baseUrl } from "@/app/constants";
import { Company } from "@/models/data/company.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateCompanySchema, UpdateCompanySchema } from "@/schemas/company";


export const createCompany = async (data: CreateCompanySchema): Promise<APIResponse<Company>> => {
    const response = await fetch(`${baseUrl}/companies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`

        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create company.");
    }

    const apiResponse: APIResponse<Company> = await response.json();
    return apiResponse;

}

export const deleteCompany = async (companyId: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete company.");
    }

    const apiResponse: APIResponse<void> = await response.json();
    return apiResponse;

}

export const updateCompany = async (
  companyId: number,
  data: UpdateCompanySchema
): Promise<APIResponse<Company>> => {
  const payload: Record<string, unknown> = {
    company_name: data.company_name,
    address: data.address,
  };
  if (data.logo !== undefined) payload.logo = data.logo;
  if (data.registration_number !== undefined) payload.registration_number = data.registration_number;
  if (data.vat_number !== undefined) payload.vat_number = data.vat_number;
  if (typeof data.vip_allow_bogo === "boolean") payload.vip_allow_bogo = data.vip_allow_bogo;
  if (typeof data.vip_allow_pairable === "boolean") payload.vip_allow_pairable = data.vip_allow_pairable;
  if (typeof data.vip_allow_combinable === "boolean") payload.vip_allow_combinable = data.vip_allow_combinable;

  const response = await fetch(`${baseUrl}/companies/${companyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update company.");
  }

  return response.json();
};

export const getMyCompanies = async (): Promise<APIResponse<Company[]>> => {
    const response = await fetch(`${baseUrl}/companies/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch companies.");
    }

    const apiResponse: APIResponse<Company[]> = await response.json();
    return apiResponse;
}
