export type AdsPlatform = "meta" | "tiktok";

export interface AdsPlatformCredential {
  id: number;
  company_id: number;
  platform: AdsPlatform;
  label: string;
  access_token_masked: string;
  has_access_token: boolean;
  has_refresh_token: boolean;
  has_app_secret: boolean;
  app_id: string;
  account_ids: string[];
  api_version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdsPlatformCredentialCreate {
  platform: AdsPlatform;
  label?: string;
  access_token?: string;
  refresh_token?: string;
  app_id?: string;
  app_secret?: string;
  account_ids?: string[];
  api_version?: string;
  is_active?: boolean;
}

export interface AdsPlatformCredentialUpdate {
  label?: string;
  access_token?: string;
  refresh_token?: string;
  app_id?: string;
  app_secret?: string;
  account_ids?: string[];
  api_version?: string;
  is_active?: boolean;
}
