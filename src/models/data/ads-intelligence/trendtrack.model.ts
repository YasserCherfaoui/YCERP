export interface TrendTrackKeywordGroup {
  id: string;
  label: string;
  keywords: string[];
}

export interface TrendTrackSettings {
  company_id: number;
  api_key_masked: string;
  has_api_key: boolean;
  ad_keywords: string[];
  shop_keywords: string[];
  page_limit: number;
  credit_floor: number;
  is_active: boolean;
  default_ad_keyword_groups: TrendTrackKeywordGroup[];
}

export interface TrendTrackSettingsUpdate {
  api_key?: string;
  ad_keywords: string[];
  shop_keywords: string[];
  page_limit: number;
  credit_floor: number;
  is_active: boolean;
}

export interface TrendTrackAd {
  id: number;
  external_id: string;
  platform: string;
  status: string;
  advertiser_name: string;
  headline: string;
  ad_body: string;
  cta: string;
  format: string;
  creative_url: string;
  creative_thumbnail: string;
  landing_url: string;
  reach: number;
  days_running: number;
  brandtracker_id: string;
}

export interface TrendTrackShop {
  id: number;
  external_id: string;
  domain: string;
  name: string;
  monthly_visits: number;
  active_ads: number;
  growth_30d: number;
  est_monthly_sales: number;
}

export interface TrendTrackProduct {
  id: number;
  shop_external_id: string;
  external_id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string;
  product_url: string;
}

export interface TrendTrackBrandtracker {
  id: number;
  external_id: string;
  name: string;
  overview?: unknown;
}

export interface TrendTrackSyncReport {
  ads: number;
  shops: number;
  products: number;
  brandtrackers: number;
  credits_remaining?: number;
  errors?: string[] | null;
  stopped_reason?: string;
}

export interface TrendTrackSyncStatus {
  running: boolean;
  has_api_key: boolean;
  last_run_at?: string;
  last_error?: string;
  report?: TrendTrackSyncReport | null;
}
