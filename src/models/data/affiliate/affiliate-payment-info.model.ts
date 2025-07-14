import { Affiliate } from "./affiliate.model";

export interface AffiliatePaymentInfo {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  affiliate_id: number;
  affiliate?: Affiliate;
  
  // Bank Transfer Details
  bank_name: string;
  bank_account_number: string;
  bank_address: string;
  iban: string;
  swift_code: string;
  
  // PayPal Details
  paypal_email: string;
  
  // Check Details
  check_payable_to: string;
} 