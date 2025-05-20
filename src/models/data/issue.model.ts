export interface IssueTicket {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  full_name: string;
  phone: string;
  comment: string;
  issue_ticket_uploads: IssueTicketUpload[];
  support_replies: SupportReply[];
}

export interface SupportReply {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  issue_ticket_id?: number | null;
  issue_ticket?: IssueTicket | null;
  order_ticket_id?: number | null;
  order_ticket?: OrderTicket | null;
  reply: string;
}

export interface IssueTicketUpload {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  issue_ticket_id: number;
  issue_ticket?: IssueTicket | null;
  upload: string;
}

export interface OrderTicket {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  full_name: string;
  phone: string;
  comment: string;
  order_ticket_uploads: OrderTicketUpload[];
  support_replies: SupportReply[];
}

export interface OrderTicketUpload {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  order_ticket_id: number;
  order_ticket?: OrderTicket | null;
  upload: string;
}
