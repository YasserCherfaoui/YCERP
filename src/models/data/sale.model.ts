import { Product, ProductVariant } from "./product.model";
import { Return } from "./return.model";

export interface Sale {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    franchise_id?: number;
    company_id?: number;
    location_type: string;
    amount: number;
    discount: number;
    total: number;
    sale_items: SaleItem[];
    return?: Return;
}

export interface SaleItem {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    sale_id: number;
    product_id: number;
    product?: Product;
    product_variant_id: number;
    product_variant: ProductVariant;
    discount: number;
    quantity: number;
}

export interface SaleItemEntity {
    product_variant_id: number;
    variant_qr_code: string;
    quantity: number;
    discount:number;
} 