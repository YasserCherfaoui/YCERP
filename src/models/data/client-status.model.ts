import { Order } from "@/models/data/order.model";
import { Qualification } from "./qualification.model";

export interface ClientStatus {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    order_id: number | null;
    order?: Order | null;
    woo_order_id: number | null;
    woo_order?: any | null;
    order_ticket_id?: number | null;
    order_ticket?: any | null;
    qualification_id: number;
    qualification?: Qualification;
    sub_qualification_id?: number | null;
    sub_qualification?: Qualification | null;
    comment: string;
    date: string;
    notify_via_whatsapp?: boolean;
} 