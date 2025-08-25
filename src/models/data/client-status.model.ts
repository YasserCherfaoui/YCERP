import { Order } from "@/models/data/order.model";
import { Qualification } from "./qualification.model";

export interface ClientStatus {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    order_id: number | null;
    order?: Order | null;
    woo_order_id: number;
    woo_order?: any | null;
    qualification_id: number;
    qualification?: Qualification;
    sub_qualification_id?: number;
    sub_qualification?: Qualification;
    comment: string;
    date: string;
} 