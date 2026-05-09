import { Administrator } from "./administrator.model";
import { Franchise } from "./franchise.model";
import { Product } from "./product.model";

export interface Company {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    company_name: string;
    address: string;
    logo?: string;
    registration_number?: string;
    vat_number?: string;
    /** When false, VIP franchises skip BOGO pricing (default true when omitted). */
    vip_allow_bogo?: boolean;
    vip_allow_pairable?: boolean;
    vip_allow_combinable?: boolean;
    administrators: Administrator[];
    franchises?: Franchise[];
    products?: Product[];
    woo_company?: WooCompany;
}
export interface WooCompany {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    company_id: number;
    company?: Company;
    woo_url: string;
}
