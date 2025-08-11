// Employee salary charge model
import { User } from "@/models/data/user.model";
import { BaseCharge } from "./charge.model";

export interface SalaryCharge extends BaseCharge {
  type: "salary";
  
  // Employee information
  employee_id?: number;
  employee?: User;
  employee_name: string;
  employee_position: string;
  employee_department?: string;
  
  // Salary components
  base_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  overtime_amount?: number;
  
  // Allowances and bonuses
  transport_allowance?: number;
  meal_allowance?: number;
  housing_allowance?: number;
  performance_bonus?: number;
  special_bonus?: number;
  commission?: number;
  
  // Deductions
  social_security?: number;
  tax_deduction?: number;
  insurance_deduction?: number;
  advance_deduction?: number;
  other_deductions?: number;
  
  // Time tracking
  work_days: number;
  work_hours: number;
  absent_days?: number;
  sick_days?: number;
  vacation_days?: number;
  
  // Pay period
  pay_period_start: string | Date;
  pay_period_end: string | Date;
  pay_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  
  // Calculations
  gross_amount: number; // Before deductions
  net_amount: number; // After deductions
  total_deductions: number;
  total_allowances: number;
  
  // Payment details
  payment_method: "cash" | "bank_transfer" | "check";
  bank_account?: string;
  payment_date?: string | Date;
  payment_reference?: string;
  
  // Employment details
  employment_type: "full_time" | "part_time" | "contract" | "temporary";
  hire_date?: string | Date;
  contract_end_date?: string | Date;
  
  // Integration with time tracking
  timesheet_id?: number;
  clock_in_records?: ClockInRecord[];
  
  // Payroll processing
  payroll_batch_id?: string;
  processed_at?: string | Date;
  processed_by_id?: number;
  
  // Compliance and reporting
  tax_year: number;
  tax_month: number;
  social_security_number?: string;
  tax_declaration_included: boolean;
  
  // Performance metrics
  performance_rating?: number; // 1-10
  kpi_achievement?: number; // percentage
  goal_completion?: number; // percentage
}

// Clock-in records for overtime calculation
export interface ClockInRecord {
  ID: number;
  employee_id: number;
  date: string;
  clock_in: string;
  clock_out?: string;
  break_duration?: number; // minutes
  total_hours: number;
  overtime_hours?: number;
  location?: string;
  approved_by_id?: number;
  notes?: string;
}

// Salary template for standardized salaries
export interface SalaryTemplate {
  ID: number;
  name: string;
  position: string;
  department?: string;
  base_salary: number;
  overtime_rate?: number;
  allowances: SalaryAllowances;
  deductions: SalaryDeductions;
  is_active: boolean;
  created_by_id: number;
  company_id: number;
}

export interface SalaryAllowances {
  transport?: number;
  meal?: number;
  housing?: number;
  communication?: number;
  other?: Record<string, number>;
}

export interface SalaryDeductions {
  social_security_rate?: number; // percentage
  tax_rate?: number; // percentage
  insurance_rate?: number; // percentage
  other?: Record<string, number>;
}

// Payroll batch for bulk processing
export interface PayrollBatch {
  ID: string;
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  total_employees: number;
  total_amount: number;
  status: "draft" | "processing" | "completed" | "cancelled";
  created_by_id: number;
  processed_at?: string;
  salary_charges: SalaryCharge[];
}

// Employee salary history for tracking changes
export interface SalaryHistory {
  ID: number;
  employee_id: number;
  effective_date: string;
  previous_salary?: number;
  new_salary: number;
  change_reason: string;
  approved_by_id: number;
  created_at: string;
}