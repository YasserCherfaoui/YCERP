export type ExpenseStatus = "recorded" | "approved" | "paid" | "cancelled";

export interface Expense {
  id: number;
  company_id: number | null;
  franchise_id: number | null;
  title: string;
  description: string;
  category: string;
  amount: number; // DZD smallest unit
  currency: string; // default DZD
  date: string; // ISO string
  payment_method: string; // cash|bank|other
  vendor: string;
  status: ExpenseStatus;
  paid_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface ExpensesListMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface ExpensesListResponseData {
  expenses: Expense[];
  meta: ExpensesListMeta;
}


