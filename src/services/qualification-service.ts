import { baseUrl } from "@/app/constants";
import { ClientStatus } from "@/models/data/client-status.model";
import { Qualification } from "@/models/data/qualification.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateClientStatusSchema } from "@/schemas/client-status";


// Fetch all qualifications
export async function getQualifications(): Promise<APIResponse<Qualification[]>> {
    const response = await fetch(`${baseUrl}/qualifications/`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
        }
    );
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch qualifications");
    }
    const qualifications: APIResponse<Qualification[]> = await response.json();
    return qualifications;
}

// Create a client status
export async function createClientStatus(data: CreateClientStatusSchema): Promise<APIResponse<ClientStatus>> {
    const response = await fetch(`${baseUrl}/client-status/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create client status");
    }
    const clientStatus: APIResponse<ClientStatus> = await response.json();
    return clientStatus;
}