import { Product, ProductVariant } from "./product.model";

export interface Inventory {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    company_id?: number;
    franchise_id?: number;
    location_type: string;
    name: string;
    items: InventoryItem[];

}

export interface InventoryItem {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    inventory_id: number;
    product_id: number;
    product_variant_id: number;
    name: string;
    product?: Product;
    product_variant?: ProductVariant;
    quantity: number
}