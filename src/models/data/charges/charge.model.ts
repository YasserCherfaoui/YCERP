// Base charge model for the charges system
import { Company } from "@/models/data/company.model";
import { User } from "@/models/data/user.model";

export type ChargeType = 
  | "exchange_rate"
  | "salary"
  | "boxing"
  | "shipping"
  | "returns"
  | "other"
  | "advertising"
  | "rent_utility";

export type ChargeStatus = "pending" | "approved" | "rejected" | "draft" | "paid";

export type ChargePriority = "low" | "medium" | "high" | "urgent";

export interface BaseCharge {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  
  // Core charge fields
  title: string;
  description?: string;
  amount: number;
  currency: "DZD" | "EUR" | "USD";
  type: ChargeType;
  status: ChargeStatus;
  priority: ChargePriority;
  date: string | Date;
  
  // Relationships
  company_id: number;
  company?: Company;
  created_by_id?: number;
  created_by?: User;
  approved_by_id?: number;
  approved_by?: User;
  
  // Additional metadata
  reference_number?: string;
  notes?: string;
  tags?: string[];
  attachment_urls?: string[];
  
  // Financial tracking
  actual_amount?: number; // For tracking actual vs estimated
  variance?: number; // Difference between estimated and actual
  impact_on_profit?: number; // How this charge affects company profit
  
  // Approval workflow
  approval_required: boolean;
  approval_notes?: string;
  approved_at?: string | Date;
  
  // Integration fields
  external_reference?: string; // For external system integration
  sync_status?: "synced" | "pending" | "failed" | "manual";
  last_synced_at?: string | Date;
}

// Generic charge interface that extends BaseCharge
export interface Charge extends BaseCharge {
  // Additional computed fields
  is_overdue?: boolean;
  days_since_creation?: number;
  category_breakdown?: Record<string, number>;
}

// Charge category for grouping and filtering
export interface ChargeCategory {
  ID: number;
  name: string;
  description?: string;
  type: ChargeType;
  is_active: boolean;
  created_at: string;
}

// Charge attachment model
export interface ChargeAttachment {
  ID: number;
  charge_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  url: string;
  uploaded_at: string;
  uploaded_by_id: number;
  uploaded_by?: User;
}

// Charge comment model for audit trail
export interface ChargeComment {
  ID: number;
  charge_id: number;
  user_id: number;
  user?: User;
  comment: string;
  created_at: string;
  is_system_comment: boolean;
}

// Charge approval history
export interface ChargeApprovalHistory {
  ID: number;
  charge_id: number;
  action: "submitted" | "approved" | "rejected" | "modified";
  comment?: string;
  performed_by_id: number;
  performed_by?: User;
  performed_at: string;
  previous_status?: ChargeStatus;
  new_status: ChargeStatus;
}