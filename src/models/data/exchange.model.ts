import { ProductVariant } from "@/models/data/product.model"; // Assuming this path is correct based on context
import { Return } from "@/models/data/return.model"; // Assuming this path is correct based on context

export interface Exchange {
    ID: number; // from gorm.Model
    CreatedAt: string; // from gorm.Model
    UpdatedAt: string; // from gorm.Model
    DeletedAt: string | null; // from gorm.Model
    return_id: number;
    return: Return | null; // Pointer becomes nullable type
    reason: string;
    type: string;
    difference: number;
    exchange_items: ExchangeItem[]; // Slice of pointers becomes array
    discount: number;
    extra_costs: number;
    amount: number;
    total: number;
}

export interface ExchangeItem {
    ID: number; // from gorm.Model
    CreatedAt: string; // from gorm.Model
    UpdatedAt: string; // from gorm.Model
    DeletedAt: string | null; // from gorm.Model
    exchange_id: number;
    product_variant_id: number;
    product_variant: ProductVariant | null; // Pointer becomes nullable type
    franchise_price?: number | null;
    exchange_price?: number | null;
    discount: number;
    quantity: number;
}
