// Shipping charge model
import { DeliveryCompany } from "@/models/data/delivery.model";
import { Order } from "@/models/data/order.model";
import { BaseCharge } from "./charge.model";

export interface ShippingCharge extends BaseCharge {
  type: "shipping";
  
  // Order association
  order_id?: number;
  order?: Order;
  
  // Delivery provider
  delivery_company_id?: number;
  delivery_company?: DeliveryCompany;
  provider_name: string;
  
  // Shipping details
  tracking_number?: string;
  shipping_method: "standard" | "express" | "overnight" | "same_day" | "pickup";
  service_type: "door_to_door" | "pickup_point" | "station_to_station";
  
  // Location information
  origin_address: string;
  origin_city: string;
  origin_postal_code?: string;
  destination_address: string;
  destination_city: string;
  destination_postal_code?: string;
  
  // Geographic zones
  origin_zone: string;
  destination_zone: string;
  zone_category: "local" | "regional" | "national" | "international";
  distance_km?: number;
  
  // Package details
  weight: number; // kg
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  volume?: number; // cubic cm
  package_count: number;
  
  // Cost breakdown
  base_shipping_cost: number;
  fuel_surcharge?: number;
  insurance_cost?: number;
  cod_fee?: number; // Cash on delivery fee
  packaging_fee?: number;
  handling_fee?: number;
  tax_amount?: number;
  
  // Timing
  pickup_date?: string | Date;
  estimated_delivery_date?: string | Date;
  actual_delivery_date?: string | Date;
  delivery_window?: string; // e.g., "9AM-12PM"
  
  // Service features
  insurance_value?: number;
  cash_on_delivery: boolean;
  cod_amount?: number;
  signature_required: boolean;
  fragile_handling: boolean;
  
  // Status tracking
  current_status: "pending" | "picked_up" | "in_transit" | "delivered" | "returned" | "lost" | "damaged";
  status_updates: ShippingStatusUpdate[];
  
  // Performance metrics
  delivery_time_hours?: number;
  on_time_delivery: boolean;
  customer_satisfaction?: number; // 1-10
  
  // Cost analysis
  cost_per_kg: number;
  cost_per_km?: number;
  profitability_impact?: number;
  
  // Integration with external systems
  yalidine_tracking_id?: string;
  external_reference?: string;
  api_response_data?: Record<string, any>;
  
  // Return information
  return_allowed: boolean;
  return_cost?: number;
  return_deadline?: string | Date;
  
  // Special handling
  temperature_controlled: boolean;
  hazardous_materials: boolean;
  high_value_item: boolean;
  special_instructions?: string;
}

// Shipping status update tracking
export interface ShippingStatusUpdate {
  ID: number;
  shipping_charge_id: number;
  status: string;
  location?: string;
  timestamp: string;
  description?: string;
  updated_by?: "system" | "provider" | "manual";
  provider_status_code?: string;
}

// Shipping rate calculation
export interface ShippingRate {
  ID: number;
  provider_id: number;
  service_type: string;
  origin_zone: string;
  destination_zone: string;
  
  // Rate structure
  base_rate: number;
  rate_per_kg: number;
  rate_per_km?: number;
  minimum_charge: number;
  maximum_charge?: number;
  
  // Surcharges
  fuel_surcharge_rate: number; // percentage
  insurance_rate: number; // percentage
  cod_rate?: number; // percentage
  
  // Conditions
  max_weight?: number;
  max_dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Timing
  estimated_days: number;
  cutoff_time?: string; // Latest pickup time
  
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
}

// Delivery zone configuration
export interface DeliveryZone {
  ID: number;
  name: string;
  code: string;
  type: "city" | "region" | "postal_code" | "custom";
  
  // Geographic coverage
  cities: string[];
  postal_codes?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  };
  
  // Service availability
  available_services: string[];
  delivery_days: string[]; // ["monday", "tuesday", ...]
  cutoff_times: Record<string, string>; // service -> cutoff time
  
  // Pricing
  zone_multiplier: number;
  base_delivery_fee: number;
  is_rural: boolean;
  accessibility_level: "easy" | "medium" | "difficult";
  
  is_active: boolean;
  created_at: string;
}

// Fuel surcharge tracking
export interface FuelSurcharge {
  ID: number;
  provider_id: number;
  effective_date: string;
  fuel_price_per_liter: number;
  surcharge_percentage: number;
  calculation_method: "percentage" | "fixed_amount";
  applied_to: "base_rate" | "total_cost";
  
  // Documentation
  source_reference?: string;
  government_index?: number;
  
  is_active: boolean;
  created_at: string;
}

// Shipping analytics
export interface ShippingAnalytics {
  period_start: string;
  period_end: string;
  
  // Volume metrics
  total_shipments: number;
  total_cost: number;
  total_weight: number;
  total_distance?: number;
  
  // Performance metrics
  on_time_delivery_rate: number;
  average_delivery_time: number;
  customer_satisfaction_avg: number;
  
  // Cost metrics
  average_cost_per_shipment: number;
  average_cost_per_kg: number;
  cost_trend: "increasing" | "decreasing" | "stable";
  
  // Provider comparison
  provider_performance: ProviderPerformance[];
  
  // Geographic analysis
  top_destinations: ZoneAnalytics[];
  
  // Issue tracking
  lost_packages: number;
  damaged_packages: number;
  returned_packages: number;
  complaint_count: number;
}

export interface ProviderPerformance {
  provider_id: number;
  provider_name: string;
  shipment_count: number;
  total_cost: number;
  on_time_rate: number;
  damage_rate: number;
  average_rating: number;
  cost_efficiency_score: number;
}

export interface ZoneAnalytics {
  zone_name: string;
  shipment_count: number;
  total_cost: number;
  average_delivery_time: number;
  success_rate: number;
}