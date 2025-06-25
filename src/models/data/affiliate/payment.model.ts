import { Affiliate } from "./affiliate.model";
import { Commission } from "./commission.model";

export interface Payment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  affiliate_id: number;
  affiliate?: Affiliate;
  amount: number; // Can be negative for reversals
  payment_date: string;
  payment_method: string; // e.g., "PayPal", "Bank Transfer"
  transaction_id: string; // Optional external reference
  notes: string; // Optional internal notes
  commissions?: Commission[];
  reversed_payment_id?: number; // Link to the payment being reversed
} 