export interface Payment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  affiliate_id: number;
  amount: number;
  payment_date: string; // from time.Time
  payment_method: string;
  transaction_id: string;
  notes: string;
  reversed_payment_id?: number;
} 