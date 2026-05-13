import { ConfirmedOrderItem, WooOrder } from "@/models/data/woo-order.model";

export type FranchiseCommissionStatus = "pending" | "approved" | "cancelled";

export interface FranchiseCommission {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  woo_order_id: number;
  woo_order?: WooOrder;
  confirmed_order_item_id: number;
  confirmed_order_item?: ConfirmedOrderItem;
  franchise_id: number;
  company_id: number;
  product_id: number;
  product_variant_id: number;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  status: FranchiseCommissionStatus | string;
}

export interface FranchiseCommissionTotals {
  pending_amount: number;
  approved_amount: number;
  cancelled_amount: number;
  total_amount: number;
}

export interface FranchiseCommissionsResponse {
  commissions: FranchiseCommission[];
  totals: FranchiseCommissionTotals;
}
