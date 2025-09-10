import { FranchiseAdministrator } from "./administrator.model";
import { Company } from "./company.model";
import { Franchise } from "./franchise.model";
import { ProductVariant } from "./product.model";

export interface MissingVariantRequest {
  id: number;
  franchise_id: number;
  company_id: number;
  franchise_administrator_id: number;
  product_variant_id: number;
  requested_quantity: number;
  status: MissingVariantStatus;
  comment?: string;
  created_at: string;
  updated_at: string;
  franchise?: Franchise;
  company?: Company;
  franchise_administrator?: FranchiseAdministrator;
  product_variant?: ProductVariant;
}

export type MissingVariantStatus = "pending" | "fulfilled" | "cancelled";

export interface MissingVariantRequestResponse {
  id: number;
  franchise_id: number;
  franchise_name: string;
  company_id: number;
  company_name: string;
  franchise_administrator_id: number;
  franchise_administrator_name: string;
  product_variant_id: number;
  product_name: string;
  product_variant_color: string;
  product_variant_size: number;
  requested_quantity: number;
  status: MissingVariantStatus;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface MissingVariantListResponse {
  requests: MissingVariantRequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MissingVariantByFranchiseResponse {
  franchise: {
    id: number;
    name: string;
  };
  requests: MissingVariantRequestResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateExitBillFromMissingVariantsRequest {
  franchise_id: number;
  company_id: number;
  request_ids: number[];
  comment?: string;
}

export interface CreateExitBillFromMissingVariantsResponse {
  exit_bill: {
    id: number;
    franchise_id: number;
    company_id: number;
    franchise_total_amount: number;
    company_total_amount: number;
    cogs: number;
    status: string;
    created_at: string;
    updated_at: string;
    franchise: {
      id: number;
      name: string;
    };
    company: {
      id: number;
      company_name: string;
    };
    bill_items: Array<{
      id: number;
      product_variant_id: number;
      quantity: number;
      product_variant: {
        id: number;
        color: string;
        size: number;
        product: {
          id: number;
          name: string;
        };
      };
    }>;
  };
  fulfilled_requests: number;
}
