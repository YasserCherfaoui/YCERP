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
