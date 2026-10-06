import { Inventory, InventoryItem, VariantLocationStock } from "@/models/data/inventory.model";

export interface InventoryItemWithCost extends InventoryItem {
    cost: number;
    franchise_cost?: number;
}


export interface InventoryWithCostResponse extends Inventory {
    items_with_cost: InventoryItemWithCost[];
}

export interface CompanyInventoryListItem extends InventoryItemWithCost {
    location_total: number;
    locations: VariantLocationStock[];
}

export interface CompanyInventorySummary {
    variant_count: number;
    units_on_hand: number;
    out_of_stock: number;
    broken_units: number;
}

export interface CompanyInventoryItemsPagination {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface CompanyInventoryItemsResponse {
    inventory_id: number;
    items: CompanyInventoryListItem[];
    summary: CompanyInventorySummary;
    pagination: CompanyInventoryItemsPagination;
}