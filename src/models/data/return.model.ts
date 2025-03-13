import { ProductVariant } from "./product.model";
import { Sale } from "./sale.model";

export interface Return {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    sale_id: number | null;
    order_id: number | null;
    sale: Sale | null;
    // order: Order | null;
    reason: string;
    type: string;
    comment: string;
    cost: number;
    amount: number;
    previous_discount: number;
    total: number;
    items: ReturnItem[];
    // exchange: Exchange | null;
}

export interface ReturnItem {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    return_id: number;
    product_variant_id: number;
    product_variant: ProductVariant | null;
    quantity: number;
}