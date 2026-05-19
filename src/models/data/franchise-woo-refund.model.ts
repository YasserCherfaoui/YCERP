export type WooRefundResolutionType = "cash_refund" | "local_exchange";

export type WooRefundReimbursementStatus =
  | "pending"
  | "paid"
  | "not_applicable";

export interface FranchiseWooRefundPreview {
  woo_order_id: number;
  order_status: string;
  eligible_amount: number;
  final_price: number;
  second_delivery_cost: number;
  can_refund: boolean;
  block_reason?: string;
  existing_refund_id?: number;
}

export interface WooOrderSearchHit {
  id: number;
  number: string;
  order_status: string;
  tracking_number?: string;
  customer_phone?: string;
  customer_phone_2?: string;
  billing_name?: string;
  final_price?: number;
  franchise_id?: number | null;
  franchise?: { ID: number; name: string } | null;
  confirmed_order_items?: Array<{
    id: number;
    quantity: number;
    product?: { name: string; price: number };
    product_variant?: { color: string; size: number };
  }>;
  has_refund: boolean;
}

export interface FranchiseWooRefundExchangeItemInput {
  product_variant_id: number;
  quantity: number;
  discount?: number;
}

export interface CreateFranchiseWooRefundRequest {
  woo_order_id: number;
  franchise_id?: number;
  resolution_type: WooRefundResolutionType;
  reason?: string;
  cash_paid_to_customer?: number;
  exchange_items?: FranchiseWooRefundExchangeItemInput[];
  exchange_customer_pays?: number;
  exchange_customer_receives?: number;
}

export interface FranchiseWooRefundItem {
  ID: number;
  confirmed_order_item_id: number;
  product_variant_id: number;
  product_variant?: {
    ID?: number;
    color?: string;
    size?: number;
    qr_code?: string;
    product?: { name?: string };
  };
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface FranchiseWooRefundExchangeItem {
  ID: number;
  product_variant_id: number;
  product_variant?: {
    ID?: number;
    color?: string;
    size?: number;
    qr_code?: string;
    product?: { name?: string };
  };
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface FranchiseWooRefund {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  woo_order_id: number;
  woo_order?: {
    id?: number;
    ID?: number;
    number?: string;
    tracking_number?: string;
    customer_phone?: string;
    order_status?: string;
    final_price?: number;
  };
  franchise_id: number;
  franchise?: { ID: number; name: string };
  company_id: number;
  resolution_type: WooRefundResolutionType;
  status: string;
  eligible_amount: number;
  cash_paid_to_customer?: number | null;
  exchange_customer_pays: number;
  exchange_customer_receives: number;
  reason?: string;
  reimbursement_status?: WooRefundReimbursementStatus;
  reimbursed_at?: string | null;
  reimbursed_by_user_id?: number | null;
  reimbursement_reference?: string;
  items?: FranchiseWooRefundItem[];
  exchange_items?: FranchiseWooRefundExchangeItem[];
}

export interface FranchiseLedgerEntry {
  id: number;
  created_at: string;
  franchise_id: number;
  company_id: number;
  woo_order_id?: number;
  franchise_woo_refund_id?: number;
  entry_type: string;
  amount: number;
  comment?: string;
}
