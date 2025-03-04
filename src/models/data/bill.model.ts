import { Company } from "./company.model";
import { Franchise } from "./franchise.model";
import { ProductVariant } from "./product.model";

export type BillItem = {
    product_variant_id: number;
    quantity: number;
    qr_code: string;
    variant_name: string;
    price: number;
}

export type ExitBill = {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    franchise_id: number;
    franchise?: Franchise;
    company_id: number;
    company?: Company;
    bill_items: Array<BillItemModel>;
    franchise_total_amount: number;
    company_total_amount: number;
    cogs: number;
    status: string;
}

export type BillItemModel = {
    id: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    exit_bill_id?: number;
    entry_bill_id?: number;
    missing_bill_id?: number;
    broken_bill_id?: number;
    product_variant: ProductVariant;
    product_variant_id: number;
    quantity: number;
}

export type EntryBill = {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    franchise_id: number;
    franchise?: Franchise;
    company_id: number;
    company?: Company;
    exit_bill_id: number;
    exit_bill?: ExitBill;
    confirmed_bill_items: Array<BillItemModel>;

}

export type BillIssue = {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    entry_bill_id: number;
    entry_bill?: EntryBill;
    missing_items: Array<BillItemModel>;
    broken_items: Array<BillItemModel>;

}