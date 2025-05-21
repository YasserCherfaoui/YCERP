import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";
import { IssueResponse, OrderTicketResponse } from "@/models/responses/issue-response.model";
import { IssueReplySchema } from "@/schemas/issue";

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



export const createIssueReply = async (data: IssueReplySchema): Promise<APIResponse<IssueResponse>> => {
    const response = await fetch(`${baseUrl}/support/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create issue reply");
    }
    const responseData = await response.json();
    return responseData;
}

export const getOrderTickets = async (): Promise<APIResponse<OrderTicketResponse[]>> => {
    const response = await fetch(`${baseUrl}/orders/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch order tickets");
    }
    const data = await response.json();
    return data;
}
