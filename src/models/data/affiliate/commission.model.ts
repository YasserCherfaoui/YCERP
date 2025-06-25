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
  woo_order_id: number;
  amount: number;
  paid_amount: number;
  status: CommissionStatus;
} 