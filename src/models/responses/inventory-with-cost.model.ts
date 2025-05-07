import { Inventory, InventoryItem } from "@/models/data/inventory.model";

export interface InventoryItemWithCost extends InventoryItem {
    cost: number;
    franchise_cost?: number;
}


export interface InventoryWithCostResponse extends Inventory {
    items_with_cost: InventoryItemWithCost[];
}