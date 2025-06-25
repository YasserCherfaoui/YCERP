export interface AffiliatePaymentInfo {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  affiliate_id: number;
  bank_name: string;
  bank_account_number: string;
  bank_address: string;
  iban: string;
  swift_code: string;
  paypal_email: string;
  check_payable_to: string;
} 