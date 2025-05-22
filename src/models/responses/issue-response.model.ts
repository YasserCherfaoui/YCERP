import { SupportReply } from "@/models/data/issue.model";

export interface UploadResponse {
    id: number;
    issue_ticket_id: number;
    signed_url: string;
}

export interface IssueResponse {
    id: number;
    full_name: string;
    phone: string;
    comment: string;
    issue_ticket_uploads: UploadResponse[] | null;
    support_replies: SupportReply[];
}


export interface OrderTicketUploadResponse {
    id: number;
    order_ticket_id: number;
    signed_url: string;
}

export interface OrderTicketResponse {
    id: number;
    full_name: string;
    phone: string;
    comment: string;
    order_ticket_uploads: OrderTicketUploadResponse[] | null;
    support_replies: SupportReply[];
}
