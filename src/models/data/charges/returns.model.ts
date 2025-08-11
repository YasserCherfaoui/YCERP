// Returns and return fees charge model
import { Order } from "@/models/data/order.model";
import { Product, ProductVariant } from "@/models/data/product.model";
import { BaseCharge } from "./charge.model";

export interface ReturnsCharge extends BaseCharge {
  type: "returns";
  
  // Return association
  order_id?: number;
  order?: Order;
  original_sale_id?: number;
  
  // Product information
  returned_items: ReturnedItem[];
  total_items_count: number;
  total_return_value: number;
  
  // Return reason
  return_reason: "defective" | "wrong_item" | "not_as_described" | "customer_changed_mind" | "damaged_in_shipping" | "late_delivery" | "other";
  detailed_reason?: string;
  customer_complaint?: string;
  
  // Return logistics
  return_method: "pickup" | "drop_off" | "mail" | "in_store";
  return_shipping_cost: number;
  return_tracking_number?: string;
  
  // Yalidine integration
  yalidine_return_id?: string;
  yalidine_event_type?: "return_to_sender" | "return_confirmed" | "return_delivered";
  yalidine_event_data?: Record<string, any>;
  
  // Processing costs
  inspection_cost: number;
  restocking_cost: number;
  refurbishment_cost?: number;
  disposal_cost?: number;
  administrative_cost: number;
  
  // Return condition assessment
  condition_assessment: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
  inspection_notes?: string;
  quality_photos?: string[];
  
  // Financial impact
  refund_amount: number;
  restocking_fee?: number;
  shipping_refund?: number;
  processing_fee: number;
  net_loss: number; // Total cost to company
  
  // Resolution details
  resolution_type: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
  resolution_amount?: number;
  resolution_notes?: string;
  
  // Customer information
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Return timeline
  return_initiated_date: string | Date;
  return_received_date?: string | Date;
  inspection_completed_date?: string | Date;
  refund_processed_date?: string | Date;
  case_closed_date?: string | Date;
  
  // Status tracking
  current_status: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
  status_history: ReturnStatusUpdate[];
  
  // Vendor/supplier impact
  vendor_responsible: boolean;
  vendor_claim_amount?: number;
  vendor_claim_status?: "pending" | "approved" | "denied" | "partially_approved";
  
  // Inventory impact
  return_to_inventory: boolean;
  new_inventory_status?: "sellable" | "refurbished" | "damaged" | "disposed";
  inventory_adjustment_id?: number;
  
  // Prevention analysis
  preventable: boolean;
  prevention_category?: "quality_control" | "shipping" | "description" | "customer_education" | "other";
  lessons_learned?: string;
  
  // External references
  payment_processor_refund_id?: string;
  insurance_claim_id?: string;
  
  // Fraud detection
  fraud_risk_score?: number; // 0-100
  fraud_indicators?: string[];
  requires_manual_review: boolean;
}

// Individual returned item details
export interface ReturnedItem {
  ID: number;
  returns_charge_id: number;
  
  // Product details
  product_id: number;
  product?: Product;
  product_variant_id?: number;
  product_variant?: ProductVariant;
  
  // Quantity and value
  quantity_returned: number;
  original_price: number;
  refund_price: number;
  
  // Item condition
  condition: string;
  condition_notes?: string;
  photos?: string[];
  
  // Specific reason for this item
  item_reason?: string;
  defect_description?: string;
  
  // Resolution for this item
  resolution: "refund" | "exchange" | "repair" | "keep";
  resolution_value: number;
  
  // Vendor information
  vendor_id?: number;
  vendor_cost?: number;
  vendor_claim_submitted: boolean;
  
  created_at: string;
}

// Return status update tracking
export interface ReturnStatusUpdate {
  ID: number;
  returns_charge_id: number;
  status: string;
  description?: string;
  timestamp: string;
  updated_by?: "customer" | "staff" | "system" | "yalidine";
  location?: string;
  photos?: string[];
  internal_notes?: string;
}

// Return policy configuration
export interface ReturnPolicy {
  ID: number;
  company_id: number;
  name: string;
  
  // Policy rules
  return_window_days: number;
  categories_covered: string[]; // product categories
  conditions_accepted: string[]; // acceptable return conditions
  
  // Costs and fees
  return_shipping_paid_by: "customer" | "company" | "shared";
  restocking_fee_percentage?: number;
  minimum_restocking_fee?: number;
  inspection_fee?: number;
  
  // Process requirements
  original_packaging_required: boolean;
  receipt_required: boolean;
  photos_required: boolean;
  reason_required: boolean;
  
  // Restrictions
  excluded_products?: string[];
  holiday_extensions?: boolean;
  international_returns_allowed: boolean;
  
  // Automation rules
  auto_approve_conditions?: string[];
  auto_reject_conditions?: string[];
  fraud_check_threshold?: number;
  
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
}

// Return analytics and reporting
export interface ReturnAnalytics {
  period_start: string;
  period_end: string;
  
  // Volume metrics
  total_returns: number;
  total_return_value: number;
  total_items_returned: number;
  return_rate: number; // percentage of sales
  
  // Financial impact
  total_processing_costs: number;
  total_refunds_issued: number;
  net_return_cost: number;
  return_cost_percentage: number; // of revenue
  
  // Reason analysis
  return_reasons: ReasonAnalytics[];
  top_returned_products: ProductReturnAnalytics[];
  
  // Performance metrics
  average_processing_time: number; // days
  customer_satisfaction_score?: number;
  resolution_success_rate: number;
  
  // Trends
  return_trend: "increasing" | "decreasing" | "stable";
  seasonal_patterns?: Record<string, number>;
  
  // Prevention opportunities
  preventable_returns_percentage: number;
  quality_improvement_areas: string[];
  cost_reduction_opportunities: string[];
}

export interface ReasonAnalytics {
  reason: string;
  count: number;
  percentage: number;
  total_value: number;
  average_processing_cost: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface ProductReturnAnalytics {
  product_id: number;
  product_name: string;
  return_count: number;
  return_rate: number; // percentage of sales for this product
  total_return_value: number;
  primary_return_reason: string;
  vendor_responsible_count: number;
}

// Yalidine return event tracking
export interface YalidineReturnEvent {
  ID: number;
  yalidine_tracking_id: string;
  event_type: string;
  event_status: string;
  event_timestamp: string;
  location?: string;
  description?: string;
  raw_data: Record<string, any>;
  processed_at: string;
  returns_charge_id?: number;
}