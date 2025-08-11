// Advertising service for managing advertising charges and campaigns
import { baseUrl } from '@/app/constants';
import {
  AdvertisingAccount,
  AdvertisingAnalytics,
  AdvertisingCharge,
  CampaignTemplate, TargetAudience
} from '@/models/data/charges/advertising.model';
import { APIResponse } from '@/models/responses/api-response.model';


// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
};

// Fetch parameters for advertising charges
export interface FetchAdvertisingChargesParams {
  limit?: number;
  offset?: number;
  campaign_id?: string;
  platform?: "facebook" | "instagram" | "google" | "tiktok" | "youtube" | "linkedin" | "twitter" | "other";
  campaign_status?: "draft" | "active" | "paused" | "completed" | "cancelled" | "rejected";
  campaign_objective?: "brand_awareness" | "lead_generation" | "sales" | "traffic" | "engagement" | "app_installs" | "video_views";
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  min_budget?: number;
  max_budget?: number;
  performance_grade?: "excellent" | "good" | "average" | "poor" | "failed";
  search?: string;
  sort_by?: "created_at" | "amount_spent" | "campaign_start_date" | "roi_percentage" | "conversion_rate";
  sort_order?: "asc" | "desc";
  company_id?: number;
}

// Create advertising charge data
export interface CreateAdvertisingChargeData {
  campaign_name: string;
  campaign_objective: "brand_awareness" | "lead_generation" | "sales" | "traffic" | "engagement" | "app_installs" | "video_views";
  platform: "facebook" | "instagram" | "google" | "tiktok" | "youtube" | "linkedin" | "twitter" | "other";
  platform_campaign_id?: string;
  ad_account_id?: string;
  
  // Targeting
  target_audience_id?: number;
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
  
  // Creative
  ad_creative_ids: string[];
  ad_formats: string[];
  creative_testing: boolean;
  
  // Products
  promoted_products: Array<{
    product_id: number;
    promotion_type: "catalog" | "single_product" | "dynamic";
    product_priority: number;
    custom_pricing?: number;
  }>;
  
  // Timeline
  campaign_start_date: string;
  campaign_end_date?: string;
  
  // Optimization
  optimization_goal: "clicks" | "impressions" | "conversions" | "reach" | "engagement";
  
  // Tracking
  attribution_window: "1_day" | "7_day" | "28_day" | "custom";
  tracking_pixels: string[];
  utm_parameters?: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  };
  
  // Currency
  spend_currency: "DZD" | "EUR" | "USD";
  exchange_rate_charge_id?: number;
  
  // Scheduling
  frequency_cap?: number;
  frequency_cap_period?: "day" | "week" | "month";
  ad_scheduling?: Array<{
    day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    start_hour: number;
    end_hour: number;
    timezone: string;
    bid_adjustment?: number;
  }>;
  
  description?: string;
  attachments?: string[];
}

// Update advertising charge data
export interface UpdateAdvertisingChargeData extends Partial<CreateAdvertisingChargeData> {
  campaign_status?: "draft" | "active" | "paused" | "completed" | "cancelled" | "rejected";
  delivery_status?: "learning" | "active" | "not_delivering" | "pending_review" | "rejected";
  actual_end_date?: string;
  performance_grade?: "excellent" | "good" | "average" | "poor" | "failed";
  recommendations?: string[];
  optimization_suggestions?: string[];
  attributed_revenue?: number;
  profit_margin?: number;
  net_profit?: number;
  roi_percentage?: number;
  payback_period_days?: number;
}

// ROI calculation parameters
export interface ROICalculationParams {
  campaign_id: string;
  spend_amount: number;
  attributed_revenue: number;
  cost_of_goods_sold?: number;
  other_costs?: number;
  attribution_model?: "last_click" | "first_click" | "linear" | "time_decay";
  conversion_window_days?: number;
}

// ROI calculation result
export interface ROICalculationResult {
  gross_profit: number;
  net_profit: number;
  roi_percentage: number;
  roas_ratio: number;
  payback_period_days: number;
  profit_margin_percentage: number;
  
  // Breakdown
  revenue_breakdown: {
    direct_revenue: number;
    attributed_revenue: number;
    total_revenue: number;
  };
  
  cost_breakdown: {
    ad_spend: number;
    cost_of_goods: number;
    other_costs: number;
    total_costs: number;
  };
  
  // Recommendations
  recommendations: string[];
  optimization_opportunities: string[];
  budget_recommendations: string[];
}

// Campaign performance analysis
export interface CampaignPerformanceAnalysis {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  
  // Performance metrics
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Efficiency metrics
  ctr: number;
  cpc: number;
  cpm: number;
  conversion_rate: number;
  cost_per_conversion: number;
  
  // ROI metrics
  roas: number;
  roi_percentage: number;
  profit_margin: number;
  
  // Performance score
  performance_score: number;
  grade: "excellent" | "good" | "average" | "poor" | "failed";
  
  // Recommendations
  recommendations: string[];
  optimization_suggestions: string[];
}

// Dashboard data
export interface AdvertisingDashboardParams {
  date_from?: string;
  date_to?: string;
  platform?: string;
  campaign_objective?: string;
  company_id?: number;
}

export interface AdvertisingDashboardData {
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  
  // Performance metrics
  overall_ctr: number;
  overall_cpc: number;
  overall_cpm: number;
  overall_conversion_rate: number;
  overall_roas: number;
  overall_roi: number;
  
  // Campaign breakdown
  active_campaigns: number;
  paused_campaigns: number;
  completed_campaigns: number;
  
  // Platform performance
  platform_breakdown: Record<string, {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
  }>;
  
  // Top performing campaigns
  top_campaigns: CampaignPerformanceAnalysis[];
  underperforming_campaigns: CampaignPerformanceAnalysis[];
  
  // Audience insights
  top_audiences: Array<{
    audience_name: string;
    spend: number;
    conversions: number;
    conversion_rate: number;
    cost_per_conversion: number;
  }>;
  
  // Trends
  spend_trend: "increasing" | "decreasing" | "stable";
  performance_trend: "improving" | "declining" | "stable";
  efficiency_trend: "improving" | "declining" | "stable";
  
  // Recent activity
  recent_campaigns: AdvertisingCharge[];
  alerts: Array<{
    type: "budget_alert" | "performance_alert" | "billing_alert";
    message: string;
    severity: "low" | "medium" | "high";
  }>;
}

// API Response types
export interface AdvertisingChargeListResponse extends APIResponse<AdvertisingCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AdvertisingChargeResponse extends APIResponse<AdvertisingCharge> {}
export interface ROICalculationResponse extends APIResponse<ROICalculationResult> {}
export interface DashboardResponse extends APIResponse<AdvertisingDashboardData> {}
export interface AnalyticsResponse extends APIResponse<AdvertisingAnalytics> {}

// CRUD Operations - Advertising Charges

// Get advertising charges
export const getAdvertisingCharges = async (params: FetchAdvertisingChargesParams = {}): Promise<AdvertisingChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/advertising-charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get single advertising charge
export const getAdvertisingCharge = async (id: number): Promise<AdvertisingChargeResponse> => {
  const response = await fetch(`${baseUrl}/advertising-charges/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create advertising charge
export const createAdvertisingCharge = async (data: CreateAdvertisingChargeData): Promise<AdvertisingChargeResponse> => {
  const response = await fetch(`${baseUrl}/advertising-charges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update advertising charge
export const updateAdvertisingCharge = async (id: number, data: UpdateAdvertisingChargeData): Promise<AdvertisingChargeResponse> => {
  const response = await fetch(`${baseUrl}/advertising-charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Delete advertising charge
export const deleteAdvertisingCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/advertising-charges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// ROI Calculations

// Calculate ROI
export const calculateROI = async (params: ROICalculationParams): Promise<ROICalculationResponse> => {
  const response = await fetch(`${baseUrl}/advertising-charges/calculate-roi`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get campaign performance analysis
export const getCampaignPerformanceAnalysis = async (campaignId: string): Promise<APIResponse<CampaignPerformanceAnalysis>> => {
  const response = await fetch(`${baseUrl}/advertising-charges/campaign/${campaignId}/performance`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Campaign Management

// Get campaign templates
export const getCampaignTemplates = async (params: {
  platform?: string;
  active_only?: boolean;
} = {}): Promise<APIResponse<CampaignTemplate[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/campaign-templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create campaign from template
export const createCampaignFromTemplate = async (templateId: number, data: {
  campaign_name: string;
  budget_amount: number;
  start_date: string;
  end_date?: string;
  customizations?: Record<string, any>;
}): Promise<AdvertisingChargeResponse> => {
  const response = await fetch(`${baseUrl}/campaign-templates/${templateId}/create-campaign`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Target Audience Management

// Get target audiences
export const getTargetAudiences = async (params: {
  active_only?: boolean;
  search?: string;
} = {}): Promise<APIResponse<TargetAudience[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/target-audiences${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create target audience
export const createTargetAudience = async (data: Omit<TargetAudience, "ID">): Promise<APIResponse<TargetAudience>> => {
  const response = await fetch(`${baseUrl}/target-audiences`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Platform Account Management

// Get advertising accounts
export const getAdvertisingAccounts = async (params: {
  platform?: string;
  active_only?: boolean;
} = {}): Promise<APIResponse<AdvertisingAccount[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/advertising-accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Sync with platform
export const syncWithPlatform = async (accountId: number): Promise<APIResponse<{
  synced_campaigns: number;
  synced_metrics: number;
  last_sync: string;
}>> => {
  const response = await fetch(`${baseUrl}/advertising-accounts/${accountId}/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Analytics and Reporting

// Get advertising dashboard
export const getAdvertisingDashboard = async (params: AdvertisingDashboardParams): Promise<DashboardResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/advertising-charges/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get advertising analytics
export const getAdvertisingAnalytics = async (params: {
  date_from?: string;
  date_to?: string;
  platform?: string;
  campaign_objective?: string;
  group_by?: 'day' | 'week' | 'month' | 'campaign';
}): Promise<AnalyticsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/advertising-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Export and Import

// Export advertising charges
export const exportAdvertisingCharges = async (params: FetchAdvertisingChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_analytics?: boolean;
}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/advertising-charges/export?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Import advertising charges
export const importAdvertisingCharges = async (file: File, options?: {
  skip_duplicates?: boolean;
  auto_calculate_roi?: boolean;
  default_platform?: string;
}): Promise<APIResponse<{ imported_count: number; errors: string[] }>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${baseUrl}/advertising-charges/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });
  
  await handleApiError(response);
  return response.json();
};

// Bulk Operations

// Bulk update campaign status
export const bulkUpdateCampaignStatus = async (data: {
  campaign_ids: string[];
  status: "active" | "paused" | "cancelled";
  notes?: string;
}): Promise<APIResponse<{ updated_count: number; errors: string[] }>> => {
  const response = await fetch(`${baseUrl}/advertising-charges/bulk-update-status`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Bulk calculate ROI
export const bulkCalculateROI = async (campaignIds: string[]): Promise<APIResponse<ROICalculationResult[]>> => {
  const response = await fetch(`${baseUrl}/advertising-charges/bulk-calculate-roi`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ campaign_ids: campaignIds }),
  });
  
  await handleApiError(response);
  return response.json();
}; 