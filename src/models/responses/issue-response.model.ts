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
    issue_ticket_uploads: UploadResponse[];
    support_replies: SupportReply[];
}


