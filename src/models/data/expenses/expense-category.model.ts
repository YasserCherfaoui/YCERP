export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  monthly_budget_dzd: number | null;
  created_at: string;
  updated_at: string;
}


