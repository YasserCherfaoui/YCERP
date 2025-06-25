import { WooOrder } from "../woo-order.model";
import { Affiliate } from "./affiliate.model";
import { Payment } from "./payment.model";

export type CommissionStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "approved"
  | "partially_paid";

export interface Commission {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  affiliate_id: number;
  affiliate?: Affiliate;
  woo_order_id: number;
  woo_order?: WooOrder;
  amount: number;
  paid_amount: number;
  status: CommissionStatus;
  payments?: Payment[];
} 