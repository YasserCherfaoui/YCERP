import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";
import { IssueResponse, OrderTicketResponse } from "@/models/responses/issue-response.model";
import { IssueReplySchema } from "@/schemas/issue";

const token = localStorage.getItem("token");

export const getIssues = async (companyId?: number): Promise<APIResponse<IssueResponse[]>> => {
    const queryParams = new URLSearchParams();
    if (companyId) {
        queryParams.append('company_id', companyId.toString());
    }
    
    const url = `${baseUrl}/issues/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
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

export const getOrderTickets = async (
    companyId?: number,
    qualificationId?: number,
    dateFrom?: string,
    dateTo?: string,
    ticketCreatedFrom?: string,
    ticketCreatedTo?: string,
    wooOrderCreatedFrom?: string,
    wooOrderCreatedTo?: string
): Promise<APIResponse<OrderTicketResponse[]>> => {
    const queryParams = new URLSearchParams();
    if (companyId) {
        queryParams.append('company_id', companyId.toString());
    }
    if (qualificationId) {
        queryParams.append('qualification_id', qualificationId.toString());
    }
    if (dateFrom) {
        queryParams.append('date_from', dateFrom);
    }
    if (dateTo) {
        queryParams.append('date_to', dateTo);
    }
    if (ticketCreatedFrom) {
        queryParams.append('ticket_created_from', ticketCreatedFrom);
    }
    if (ticketCreatedTo) {
        queryParams.append('ticket_created_to', ticketCreatedTo);
    }
    if (wooOrderCreatedFrom) {
        queryParams.append('woo_order_created_from', wooOrderCreatedFrom);
    }
    if (wooOrderCreatedTo) {
        queryParams.append('woo_order_created_to', wooOrderCreatedTo);
    }
    
    const url = `${baseUrl}/orders/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
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

export const updateOrderTicket = async (
    ticketId: number,
    wooOrderId: number | null
): Promise<APIResponse<OrderTicketResponse>> => {
    const response = await fetch(`${baseUrl}/orders/${ticketId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            woo_order_id: wooOrderId,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order ticket");
    }
    const data = await response.json();
    return data;
}
