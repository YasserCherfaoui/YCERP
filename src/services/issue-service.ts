import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";
import { IssueResponse } from "@/models/responses/issue-response.model";

const token = localStorage.getItem("token");

export const getIssues = async (): Promise<APIResponse<IssueResponse[]>> => {
    const response = await fetch(`${baseUrl}/issues/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch issues");
    }
    const data = await response.json();
    return data;
}