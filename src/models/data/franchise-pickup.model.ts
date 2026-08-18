import { Company } from "./company.model";
import { DeliveryEmployee } from "./delivery.model";
import { Franchise } from "./franchise.model";
import { InventoryItem } from "./inventory.model";
import { ProductVariant } from "./product.model";

export type FranchisePickupStatus =
  | "pending"
  | "picked"
  | "not_available"
  | "partial"
  | "cancelled";

export type FranchisePickupItemStatus = "pending" | "picked" | "not_available";

export interface FranchisePickupRequestItem {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  request_id: number;
  product_variant_id: number;
  product_variant?: ProductVariant;
  inventory_item_id: number;
  inventory_item?: InventoryItem;
  quantity: number;
  status: FranchisePickupItemStatus;
}

export interface FranchisePickupRequest {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  company_id: number;
  company?: Company;
  franchise_id: number;
  franchise?: Franchise;
  delivery_employee_id: number;
  delivery_employee?: DeliveryEmployee;
  status: FranchisePickupStatus;
  notes: string;
  created_by_administrator_id?: number;
  created_by_user_id?: number;
  resolved_by_franchise_administrator_id?: number;
  items: FranchisePickupRequestItem[];
}

export interface FranchisePickupStatusCounts {
  pending: number;
  picked: number;
  not_available: number;
  partial: number;
  cancelled: number;
}

export interface FranchisePickupListResponse {
  requests: FranchisePickupRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  status_counts: FranchisePickupStatusCounts;
}

export interface CreateFranchisePickupRequestPayload {
  company_id: number;
  franchise_id: number;
  delivery_employee_id: number;
  notes?: string;
  items: Array<{
    product_variant_id: number;
    quantity: number;
  }>;
}

export interface ResolveFranchisePickupItemPayload {
  id: number;
  status: Exclude<FranchisePickupItemStatus, "pending">;
}

export interface ResolveFranchisePickupRequestPayload {
  items: ResolveFranchisePickupItemPayload[];
}
