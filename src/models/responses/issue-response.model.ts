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

import { ClientStatus } from "@/models/data/client-status.model";
import { WooOrder } from "@/models/data/woo-order.model";

export interface OrderTicketResponse {
    id: number;
    full_name: string;
    phone: string;
    comment: string;
    woo_order_id?: number | null;
    woo_order?: WooOrder | null;
    order_ticket_uploads: OrderTicketUploadResponse[] | null;
    support_replies: SupportReply[];
    client_statuses?: ClientStatus[] | null;
}
