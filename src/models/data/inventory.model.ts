import { Administrator, FranchiseAdministrator } from "@/models/data/administrator.model";
import { Company } from "@/models/data/company.model";
import { Franchise } from "@/models/data/franchise.model";
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
    quantity: number;
    broken_count: number;

    inventory?: Inventory;
}


export interface InventoryItemTransactionLog {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    inventory_item_id: number;
    inventory_item?: InventoryItem;
    product_id: number;
    product?: Product;
    product_variant_id: number;
    product_variant?: ProductVariant;
    inventory_id: number;
    inventory?: Inventory;
    administrator_id?: number;
    administrator?: Administrator;
    franchise_administrator_id?: number;
    franchise_administrator?: FranchiseAdministrator;
    company_id?: number;
    company?: Company;
    franchise_id?: number;
    franchise?: Franchise;
    location_type: string;
    transaction_type: string;
    quantity_change: number;
    quantity_before: number;
    quantity_after: number;
    comment: string;
    reference_id?: number;
    reference_type: string;
}

export interface InventoryDiscrepancy {
    inventory_item_id: number;
    item_name: string;
    current_quantity: number;
    ledger_balance: number;
    discrepancy: number;
    product_name: string;
    variant_info: string;
    inventory_name: string;
}

export interface InventoryDiscrepanciesResponse {
    discrepancies: InventoryDiscrepancy[];
    total: number;
    limit: number;
    offset: number;
    warning?: string;
}

export interface InventorySnapshotItem {
    inventory_item_id: number;
    item_name: string;
    product_name: string;
    variant_info: string;
    closing_quantity: number;
    closing_broken_count: number;
    last_entry_id?: number;
}

export interface InventorySnapshotResponse {
    snapshot_date: string;
    inventory_id: number;
    items: InventorySnapshotItem[];
    total: number;
}

export interface InventoryItemBalanceAtResponse {
    inventory_item_id: number;
    balance: number;
    at: string;
    used_snapshot: boolean;
    snapshot_date?: string;
}