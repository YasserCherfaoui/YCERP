import { Inventory } from "@/models/data/inventory.model";
import { ProductVariant } from "@/models/data/product.model";

export interface CompanyInventoryOption {
  ID: number;
  name: string;
  location_type: string;
  franchise_id?: number;
  franchise_name?: string;
}

export interface StockMovementBillItem {
  ID: number;
  stock_movement_bill_id: number;
  product_variant_id: number;
  product_variant?: ProductVariant;
  quantity: number;
}

export interface StockMovementBill {
  ID: number;
  CreatedAt: string;
  company_id: number;
  from_inventory_id: number;
  to_inventory_id: number;
  from_inventory?: Inventory;
  to_inventory?: Inventory;
  status: string;
  items: StockMovementBillItem[];
}

export interface StockMovementLine {
  product_variant_id: number;
  quantity: number;
}

export interface CreateStockMovementPayload {
  company_id: number;
  from_inventory_id: number;
  to_inventory_id: number;
  items: StockMovementLine[];
}

export interface AlignStockMovementSourcePayload {
  company_id: number;
  inventory_id: number;
  items: StockMovementLine[];
}

export interface StockMovementListParams {
  from_inventory_id?: number;
  to_inventory_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockMovementPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface StockMovementList {
  bills: StockMovementBill[];
  pagination: StockMovementPagination;
}
