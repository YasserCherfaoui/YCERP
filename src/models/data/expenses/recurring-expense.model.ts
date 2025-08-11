export type RecurringStatus = "active" | "paused" | "ended";

export interface RecurringExpense {
  id: number;
  company_id: number;
  title: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  payment_method: string;
  vendor: string;
  day_of_month: number; // 1..28
  start_month: string; // YYYY-MM-01
  end_month: string | null; // YYYY-MM-01 or null
  status: RecurringStatus;
  last_generated_at: string | null;
  next_run_at: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}


