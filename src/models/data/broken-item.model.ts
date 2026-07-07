import { Company } from "./company.model";
import { Franchise } from "./franchise.model";
import { Inventory, InventoryItem } from "./inventory.model";
import { ProductVariant } from "./product.model";

export interface BrokenItem {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    product_variant_id: number;
    product_variant?: ProductVariant;
    inventory_id: number;
    inventory?: Inventory;
    inventory_item_id: number;
    inventory_item?: InventoryItem;
    broken_quantity: number; // Note: Backend uses "BorkenQuantity" (typo preserved for compatibility)
    recovered_quantity: number;
    company_id?: number;
    company?: Company;
    franchise_id?: number;
    franchise?: Franchise;
    location_type: string;
    status: string; // "pending", "partially_recovered", "fully_recovered", "lost"
    reason: string;
}

export interface BrokenItemListItem extends BrokenItem {
    recoverable_quantity: number;
    blocked_by_pending_transfer: boolean;
}

export interface BrokenItemStatusCounts {
    pending: number;
    partially_recovered: number;
    fully_recovered: number;
    lost: number;
}

export interface BrokenItemListResponse {
    items: BrokenItemListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    status_counts: BrokenItemStatusCounts;
}
