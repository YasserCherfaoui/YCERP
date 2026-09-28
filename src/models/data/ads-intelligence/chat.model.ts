export interface AdsSQLEvidence {
  sql: string;
  rows: Record<string, unknown>[];
  row_count: number;
}

export interface AdsChatMessageRecord {
  id: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sql_evidence?: AdsSQLEvidence | AdsSQLEvidence[] | null;
  created_at: string;
}

export interface AdsChatSessionRecord {
  id: string;
  user_id: number;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface AdsChatUIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sqlEvidence?: AdsSQLEvidence[];
  createdAt?: string;
}

export interface AdsTrueEconomicsRow {
  campaign_id: number;
  campaign_name?: string;
  /** Ad-account currency for spend. Order cash and costs are DZD. */
  currency?: string;
  platform: string;
  spend: number;
  orders_received: number;
  confirmed: number;
  delivered: number;
  returned: number;
  collected_cash: number;
  delivered_cogs: number;
  shipping_cost: number;
  net_profit: number;
  confirmation_rate: number;
  delivery_rate: number;
  return_rate: number;
  real_cost_per_delivered: number;
}

export interface AdsUndeliveredOrder {
  woo_order_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_status: string;
  franchise_order_status: string;
  shipping_provider: string;
  tracking_number: string;
  carrier_status: string;
  carrier_reason: string;
  wilaya_name: string;
  comments: string;
  created_at?: string;
  why: string;
}

export interface AdsModelFunnelRow {
  campaign_id: number;
  product_id: number;
  model_name: string;
  qty_confirmed: number;
  qty_delivered: number;
  delivered_revenue: number;
  delivered_cogs: number;
  gross_margin: number;
  confirm_to_deliver_rate: number;
}
