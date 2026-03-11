import { ProductVariant } from "./product.model";

export type VariantDepositStatus = "pending" | "fulfilled" | "cancelled" | "refunded";

export interface VariantDeposit {
  id: number;
  franchise_id: number;
  customer_phone: string;
  product_variant_id: number;
  product_variant?: ProductVariant;
  amount_paid: number;
  quantity: number;
  status: VariantDepositStatus;
  sale_id?: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface VariantDepositResponse {
  id: number;
  franchise_id: number;
  customer_phone: string;
  product_variant_id: number;
  product_name?: string;
  product_variant_color?: string;
  product_variant_size?: number;
  amount_paid: number;
  quantity: number;
  status: VariantDepositStatus;
  sale_id?: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  in_franchise_inventory?: boolean;
  franchise_inventory_qty?: number;
}

export interface VariantDepositListResponse {
  deposits: VariantDepositResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
