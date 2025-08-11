// Exchange rate charge model
import { BaseCharge } from "./charge.model";

export interface ExchangeRateCharge extends BaseCharge {
  type: "exchange_rate";
  
  // Exchange rate specific fields
  source_currency: "DZD" | "EUR" | "USD";
  target_currency: "DZD" | "EUR" | "USD";
  
  // Rate information
  exchange_rate: number; // The rate used for conversion
  rate_source: "bank" | "official" | "market" | "custom";
  rate_date: string | Date; // When the rate was obtained
  
  // Transaction details
  source_amount: number; // Amount in source currency
  target_amount: number; // Amount in target currency
  fee_amount?: number; // Transaction fees
  
  // Loss/Gain tracking
  expected_rate?: number; // Expected rate for comparison
  rate_variance?: number; // Difference between expected and actual
  loss_gain_amount?: number; // Financial impact of rate difference
  
  // Purchase details (for Euro purchases)
  purpose: "advertising" | "inventory" | "services" | "other";
  purchase_description?: string;
  vendor_name?: string;
  vendor_reference?: string;
  
  // Rate history for comparison
  previous_rate?: number;
  rate_trend: "increasing" | "decreasing" | "stable";
  
  // Integration with advertising
  advertising_campaign_id?: number;
  
  // Banking details
  bank_name?: string;
  transaction_reference?: string;
  bank_fees?: number;
  
  // Approval specific to currency exchange
  requires_bank_approval?: boolean;
  bank_approval_reference?: string;
  
  // Risk assessment
  risk_level: "low" | "medium" | "high";
  risk_factors?: string[];
  hedging_strategy?: string;
}

// Rate source configuration
export interface ExchangeRateSource {
  ID: number;
  name: string;
  source_type: "api" | "manual" | "bank";
  api_endpoint?: string;
  update_frequency?: number; // minutes
  is_active: boolean;
  reliability_score: number; // 0-100
  last_updated: string;
}

// Historical exchange rates for analysis
export interface ExchangeRateHistory {
  ID: number;
  source_currency: string;
  target_currency: string;
  rate: number;
  source: string;
  recorded_at: string;
  high_rate?: number;
  low_rate?: number;
  volume?: number;
}

// Exchange rate alert configuration
export interface ExchangeRateAlert {
  ID: number;
  company_id: number;
  currency_pair: string; // e.g., "EUR/DZD"
  target_rate: number;
  condition: "above" | "below" | "equals";
  is_active: boolean;
  notification_method: "email" | "sms" | "in_app";
  created_by_id: number;
  triggered_at?: string;
}