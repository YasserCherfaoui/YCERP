import { Administrator, FranchiseAdministrator } from "./administrator.model";
import { Company } from "./company.model";
import { Franchise } from "./franchise.model";
import { Inventory } from "./inventory.model";
import { BrokenItem } from "./broken-item.model";

export interface BrokenItemTransfer {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    from_inventory_id: number;
    from_inventory?: Inventory;
    to_inventory_id: number;
    to_inventory?: Inventory;
    status: "pending" | "approved" | "rejected";
    requested_by_id: number;
    requested_by?: FranchiseAdministrator;
    approved_by_id?: number;
    approved_by?: Administrator;
    notes: string;
    items: BrokenItemTransferItem[];
    company_id?: number;
    company?: Company;
    franchise_id?: number;
    franchise?: Franchise;
}

export interface BrokenItemTransferItem {
    ID: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    transfer_id: number;
    transfer?: BrokenItemTransfer;
    broken_item_id: number;
    broken_item?: BrokenItem;
    quantity: number;
}
