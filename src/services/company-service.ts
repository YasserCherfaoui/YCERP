import { baseUrl } from "@/app/constants";
import { Company } from "@/models/data/company.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateCompanySchema } from "@/schemas/company";


export const createCompany = async (data: CreateCompanySchema): Promise<APIResponse<Company>> => {
    const response = await fetch(`${baseUrl}/companies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`

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