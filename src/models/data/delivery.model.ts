import { Company } from "@/models/data/company.model";

export interface DeliveryCompany {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    company_id: number;
    company?: Company;
    name: string;
    employees?: DeliveryEmployee[];

}

export interface DeliveryEmployee {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    delivery_company_id: number;
    delivery_company?: DeliveryCompany;
    name: string;
    email: string;
    password: string;
    costs?: DeliveryCost[];

}

export interface DeliveryCost {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    delivery_id: number;
    city: string;
    state: string;
    stop_desk_cost: number;
    express_cost: number;

}

export interface DeliveryEmployeePayment {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    delivery_employee_id: number;
    delivery_company_id: number;
    company_id: number;
    amount: number;
    collected_at: string;
    created_by: number;
    notes: string;
}
