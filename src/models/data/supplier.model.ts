import { Administrator } from "./administrator.model";
import { BillItemModel } from "./bill.model";
import { Company } from "./company.model";

export interface Supplier {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    company_id: number;
    administrator_id: number;
    administrator?: Administrator;
    company?: Company;

}

export interface SupplierBill {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    company_id: number;
    company?: Company;
    administrator_id: number;
    administrator?: Administrator;
    items: BillItemModel[];
    total: number;
    due: number;
    paid: number;
    status: number;
}

export interface SupplierResponse {
    supplier: Supplier;
    totals: {
        Due: number;
        Paid: number;
        Total: number;
    }
}

export interface SupplierPayment {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    supplier_id: number;
    supplier?: Supplier;
    company_id: number;
    company?: Company;
    administrator_id: number;
    administrator?: Administrator;
    amount: number;
    comment: string;
}
