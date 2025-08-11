// Advertising charge model
import { Product } from "@/models/data/product.model";
import { BaseCharge } from "./charge.model";

export interface AdvertisingCharge extends BaseCharge {
  type: "advertising";
  
  // Campaign information
  campaign_id?: string;
  campaign_name: string;
  campaign_objective: "brand_awareness" | "lead_generation" | "sales" | "traffic" | "engagement" | "app_installs" | "video_views";
  
  // Platform details
  platform: "facebook" | "instagram" | "google" | "tiktok" | "youtube" | "linkedin" | "twitter" | "other";
  platform_campaign_id?: string;
  ad_account_id?: string;
  
  // Targeting information
  target_audience: TargetAudience;
  geographic_targeting: string[];
  age_range?: {
    min: number;
    max: number;
  };
  gender_targeting?: "all" | "male" | "female" | "other";
  
  // Budget and bidding
  budget_type: "daily" | "lifetime" | "campaign_total";
  budget_amount: number;
  bid_strategy: "automatic" | "manual" | "target_cost" | "target_roas";
  bid_amount?: number;
  
  // Spend tracking
  amount_spent: number;
  remaining_budget: number;
  budget_utilization_percentage: number;
  
  // Performance metrics
  impressions: number;
  reach: number;
  clicks: number;
  click_through_rate: number;
  cost_per_click: number;
  cost_per_thousand_impressions: number;
  
  // Conversion tracking
  conversions: number;
  conversion_rate: number;
  cost_per_conversion: number;
  conversion_value?: number;
  return_on_ad_spend?: number;
  
  // Creative information
  ad_creative_ids: string[];
  ad_formats: string[]; // "image", "video", "carousel", "collection"
  creative_testing: boolean;
  
  // Product promotion
  promoted_products: PromotedProduct[];
  product_catalog_id?: string;
  
  // Campaign timeline
  campaign_start_date: string | Date;
  campaign_end_date?: string | Date;
  actual_end_date?: string | Date;
  campaign_duration_days?: number;
  
  // Campaign status
  campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled" | "rejected";
  delivery_status: "learning" | "active" | "not_delivering" | "pending_review" | "rejected";
  
  // Optimization
  optimization_goal: "clicks" | "impressions" | "conversions" | "reach" | "engagement";
  learning_phase: boolean;
  learning_phase_info?: string;
  
  // Attribution and tracking
  attribution_window: "1_day" | "7_day" | "28_day" | "custom";
  tracking_pixels: string[];
  utm_parameters?: UTMParameters;
  
  // Currency and exchange
  spend_currency: "DZD" | "EUR" | "USD";
  exchange_rate_used?: number;
  exchange_rate_charge_id?: number; // Link to exchange rate charge
  
  // Frequency and scheduling
  frequency_cap?: number;
  frequency_cap_period?: "day" | "week" | "month";
  ad_scheduling?: ScheduleSettings[];
  
  // A/B testing
  ab_test_id?: string;
  test_variant?: string;
  control_group?: boolean;
  
  // Performance analysis
  performance_grade: "excellent" | "good" | "average" | "poor" | "failed";
  recommendations?: string[];
  optimization_suggestions?: string[];
  
  // External integration
  platform_api_data?: Record<string, any>;
  last_sync_date?: string | Date;
  sync_status?: "synced" | "pending" | "failed" | "manual";
  
  // ROI calculation
  attributed_revenue?: number;
  profit_margin?: number;
  net_profit?: number;
  roi_percentage?: number;
  payback_period_days?: number;
}

// Target audience configuration
export interface TargetAudience {
  ID: number;
  name: string;
  description?: string;
  
  // Demographic targeting
  age_ranges: AgeRange[];
  genders: string[];
  languages: string[];
  
  // Geographic targeting
  countries: string[];
  regions?: string[];
  cities?: string[];
  postal_codes?: string[];
  radius_targeting?: RadiusTargeting[];
  
  // Interest targeting
  interests: string[];
  behaviors: string[];
  life_events?: string[];
  
  // Custom audiences
  custom_audience_ids?: string[];
  lookalike_audience_ids?: string[];
  
  // Exclusions
  excluded_interests?: string[];
  excluded_audiences?: string[];
  
  // Device targeting
  devices: string[]; // "mobile", "desktop", "tablet"
  operating_systems?: string[];
  
  created_at: string;
  is_active: boolean;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface RadiusTargeting {
  latitude: number;
  longitude: number;
  radius_km: number;
  address_description?: string;
}

// Promoted product details
export interface PromotedProduct {
  product_id: number;
  product?: Product;
  product_set_id?: string;
  
  // Promotion settings
  promotion_type: "catalog" | "single_product" | "dynamic";
  product_priority: number;
  custom_pricing?: number;
  
  // Performance for this product
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Product-specific targeting
  audience_overlap?: string[];
  custom_audiences?: string[];
}

// UTM parameters for tracking
export interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  custom_parameters?: Record<string, string>;
}

// Ad scheduling settings
export interface ScheduleSettings {
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  start_hour: number;
  end_hour: number;
  timezone: string;
  bid_adjustment?: number; // percentage adjustment for this time slot
}

// Campaign template for reuse
export interface CampaignTemplate {
  ID: number;
  name: string;
  description?: string;
  platform: string;
  
  // Template settings
  default_budget: number;
  default_duration_days: number;
  target_audience_template: Partial<TargetAudience>;
  
  // Creative guidelines
  recommended_ad_formats: string[];
  creative_specifications?: Record<string, any>;
  
  // Performance benchmarks
  expected_ctr?: number;
  expected_cpc?: number;
  expected_conversion_rate?: number;
  
  usage_count: number;
  last_used: string;
  created_by_id: number;
  is_active: boolean;
}

// Platform account configuration
export interface AdvertisingAccount {
  ID: number;
  platform: string;
  account_id: string;
  account_name: string;
  
  // Authentication
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  
  // Account settings
  default_currency: string;
  timezone: string;
  account_status: "active" | "suspended" | "restricted";
  
  // Spending limits
  daily_spend_limit?: number;
  monthly_spend_limit?: number;
  
  // API configuration
  api_version?: string;
  webhook_url?: string;
  auto_sync_enabled: boolean;
  sync_frequency_hours: number;
  
  // Performance tracking
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  
  created_at: string;
  last_sync: string;
  is_active: boolean;
}

// Advertising analytics
export interface AdvertisingAnalytics {
  period_start: string;
  period_end: string;
  
  // Spend metrics
  total_spend: number;
  average_daily_spend: number;
  spend_by_platform: Record<string, number>;
  
  // Performance metrics
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  overall_ctr: number;
  overall_cpc: number;
  overall_conversion_rate: number;
  
  // ROI metrics
  total_revenue: number;
  total_profit: number;
  overall_roas: number;
  overall_roi: number;
  
  // Campaign performance
  top_performing_campaigns: CampaignPerformance[];
  underperforming_campaigns: CampaignPerformance[];
  
  // Audience insights
  top_audiences: AudiencePerformance[];
  demographic_breakdown: DemographicPerformance[];
  
  // Optimization recommendations
  budget_optimization_suggestions: string[];
  targeting_optimization_suggestions: string[];
  creative_optimization_suggestions: string[];
  
  // Trends
  performance_trend: "improving" | "declining" | "stable";
  spend_trend: "increasing" | "decreasing" | "stable";
  efficiency_trend: "improving" | "declining" | "stable";
}

export interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  performance_score: number;
}

export interface AudiencePerformance {
  audience_name: string;
  audience_size: number;
  spend: number;
  conversions: number;
  conversion_rate: number;
  cost_per_conversion: number;
  audience_score: number;
}

export interface DemographicPerformance {
  demographic_type: "age" | "gender" | "location" | "device";
  demographic_value: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  performance_index: number; // relative to overall performance
}