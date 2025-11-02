import { AffiliatePaymentInfo } from "@/models/data/affiliate/affiliate-payment-info.model";
import { Company } from "../company.model";
import { Commission } from "./commission.model";
import { Payment } from "./payment.model";

export interface Affiliate {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  company_id: number;
  company?: Company;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  slug: string;
  is_confirmed: boolean;
  is_active: boolean;
  is_pro: boolean;
  payment_info?: AffiliatePaymentInfo;
  commissions?: Commission[];
  payments?: Payment[];
} 