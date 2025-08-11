// Salary service for managing employee salary charges
import { baseUrl } from '@/app/constants';
import { ClockInRecord, PayrollBatch, SalaryCharge, SalaryHistory, SalaryTemplate } from "@/models/data/charges/salary.model";
import { APIResponse } from "@/models/responses/api-response.model";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
};

// Fetch parameters for salary charges
export interface FetchSalaryChargesParams {
  limit?: number;
  offset?: number;
  employee_id?: number;
  department?: string;
  position?: string;
  pay_period_start?: string;
  pay_period_end?: string;
  employment_type?: "full_time" | "part_time" | "contract" | "temporary";
  payment_method?: "cash" | "bank_transfer" | "check";
  status?: string;
  search?: string;
  sort_by?: "employee_name" | "base_salary" | "net_amount" | "pay_period_start" | "created_at";
  sort_order?: "asc" | "desc";
  company_id?: number;
}

// Create salary charge data
export interface CreateSalaryChargeData {
  employee_id: number;
  employee_type: "delivery" | "moderator" | "warehouse" | "office";
  employee_name: string;
  base_salary: number;
  bonus?: number;
  allowances?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  payment_method: "cash" | "bank_transfer" | "check";
  payment_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  company_id: number;
  title: string;
  description?: string;
  date: string;
  delivery_employee_id?: number;
  user_id?: number | null;
}

// Update salary charge data
export interface UpdateSalaryChargeData extends Partial<CreateSalaryChargeData> {}

// Salary calculation parameters
export interface SalaryCalculationParams {
  base_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  work_days: number;
  work_hours: number;
  absent_days?: number;
  sick_days?: number;
  vacation_days?: number;
  allowances?: {
    transport?: number;
    meal?: number;
    housing?: number;
    performance_bonus?: number;
    special_bonus?: number;
    commission?: number;
  };
  deductions?: {
    social_security?: number;
    tax_deduction?: number;
    insurance_deduction?: number;
    advance_deduction?: number;
    other_deductions?: number;
  };
  pay_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
}

export interface SalaryCalculationResult {
  base_amount: number;
  overtime_amount: number;
  total_allowances: number;
  total_deductions: number;
  gross_amount: number;
  net_amount: number;
  calculation_breakdown: {
    base_salary: number;
    overtime: number;
    allowances: Record<string, number>;
    deductions: Record<string, number>;
  };
  effective_hourly_rate: number;
  days_worked: number;
  hours_worked: number;
}

export interface BulkSalaryOperationData {
  operation: "create" | "update" | "delete" | "process";
  salary_charges: Array<CreateSalaryChargeData | (UpdateSalaryChargeData & { id: number })>;
  payroll_batch_name?: string;
  pay_period_start?: string;
  pay_period_end?: string;
}

export interface BulkSalaryOperationResult {
  operation_id: string;
  operation_type: "create" | "update" | "delete" | "process";
  total_records: number;
  successful_records: number;
  failed_records: number;
  errors: Array<{ record_index: number; error: string }>;
  created_salary_charges: SalaryCharge[];
  payroll_batch_id?: string;
}

export interface SalaryDashboardParams {
  date_from?: string;
  date_to?: string;
  department?: string;
  employment_type?: string;
  company_id?: number;
}

export interface SalaryDashboardResponse extends APIResponse<SalaryDashboardData> {}

export interface SalaryDashboardData {
  total_employees: number;
  total_salary_cost: number;
  average_salary: number;
  median_salary: number;
  highest_salary: number;
  lowest_salary: number;
  overtime_cost: number;
  total_allowances: number;
  total_deductions: number;
  net_payroll_cost: number;
  salary_range: {
    min: number;
    max: number;
    q1: number;
    q3: number;
  };
  allowance_breakdown: {
    transport: number;
    meal: number;
    housing: number;
  };
  department_breakdown: Array<{
    department: string;
    employee_count: number;
    total_cost: number;
    average_salary: number;
    percentage_of_total: number;
  }>;
  position_breakdown: Array<{
    position: string;
    employee_count: number;
    total_cost: number;
    average_salary: number;
  }>;
  employment_type_breakdown: Array<{
    type: string;
    employee_count: number;
    total_cost: number;
    percentage: number;
  }>;
  monthly_trends: Array<{
    month: string;
    total_cost: number;
    employee_count: number;
    overtime_cost: number;
    average_salary: number;
    new_hires: number;
    terminations: number;
  }>;
  top_earners: Array<{
    employee_name: string;
    position: string;
    department: string;
    net_amount: number;
    gross_amount: number;
    overtime_amount?: number;
    commission?: number;
    employee_id: number;
  }>;
  salary_status_summary: {
    pending_approvals: number;
    approved_this_month: number;
    rejected_this_month: number;
    draft_salaries: number;
    processing_salaries: number;
    total_processed: number;
  };
  performance_metrics: {
    average_performance_rating: number;
    employees_with_bonus: number;
    total_bonus_amount: number;
    average_bonus_percentage: number;
    kpi_achievement_rate: number;
    employees_above_target: number;
  };
  payroll_batch_summary: {
    total_batches: number;
    completed_batches: number;
    processing_batches: number;
    draft_batches: number;
    next_payroll_date: string;
    estimated_payroll_amount: number;
    last_payroll_date: string;
  };
  compliance_summary: {
    total_tax_deductions: number;
    total_social_security: number;
    total_insurance: number;
    tax_declaration_compliance: number;
    social_security_compliance: number;
    insurance_compliance: number;
  };
  recent_salary_changes: Array<{
    ID: number;
    employee_id: number;
    employee_name: string;
    effective_date: string;
    previous_salary: number;
    new_salary: number;
    change_amount: number;
    change_percentage: number;
    change_reason: string;
    approved_by_id: number;
    created_at: string;
  }>;
  cost_analysis: {
    salary_to_revenue_ratio: number;
    salary_growth_rate: number;
    overtime_percentage: number;
    allowance_percentage: number;
    deduction_percentage: number;
    cost_per_employee: number;
  };
  forecast_data: {
    projected_next_month: number;
    projected_quarter: number;
    projected_year: number;
    growth_rate: number;
    budget_variance: number;
  };
}

export interface SalaryChargeListResponse extends APIResponse<SalaryCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SalaryChargeResponse extends APIResponse<SalaryCharge> {}

// New response interface for salary charge creation
export interface CreateSalaryChargeResponse extends APIResponse<{
  charge: {
    id: number;
    company_id: number;
    type: string;
    category: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
  };
  salary_details: {
    id: number;
    charge_id: number;
    employee_id: number;
    employee_type: string;
    employee_name: string;
    base_salary: number;
    bonus?: number;
    allowances?: number;
    overtime_hours?: number;
    overtime_rate?: number;
    overtime_amount?: number;
    payment_method: string;
    payment_frequency: string;
    delivery_employee_id?: number;
    user_id?: number | null;
    created_at: string;
    updated_at: string;
  };
}> {}

export interface SalaryTemplateResponse extends APIResponse<SalaryTemplate[]> {}
export interface PayrollBatchResponse extends APIResponse<PayrollBatch> {}
export interface SalaryCalculationResponse extends APIResponse<SalaryCalculationResult> {}
export interface BulkSalaryResponse extends APIResponse<BulkSalaryOperationResult> {}

// Core CRUD operations for salary charges
export const getSalaryCharges = async (params: FetchSalaryChargesParams = {}): Promise<SalaryChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add company_id if provided
  if (params.company_id) {
    queryParams.append('company_id', params.company_id.toString());
  }
  
  // Add employee_id if provided
  if (params.employee_id) {
    queryParams.append('employee_id', params.employee_id.toString());
  }
  
  // Add limit and offset
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }
  
  const url = `${baseUrl}/charges/salaries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  const result = await response.json();
  
  // Transform the new response structure to match the existing interface
  if (result.data && Array.isArray(result.data)) {
    const transformedData = result.data.map((item: any) => {
      const charge = item.charge;
      const salaryDetails = item.salary_details;
      
      // Merge charge and salary_details into a single SalaryCharge object
      return {
        ID: charge.id,
        company_id: charge.company_id,
        title: charge.title,
        description: charge.description,
        amount: charge.amount,
        currency: charge.currency,
        type: "salary" as const,
        status: charge.status,
        priority: "medium" as const,
        date: charge.date,
        CreatedAt: charge.created_at,
        UpdatedAt: charge.updated_at,
        DeletedAt: null,
        created_by_id: charge.created_by,
        approved_by_id: charge.approved_by,
        approved_at: charge.approved_at,
        approval_required: true,
        
        // Salary-specific fields from salary_details
        employee_id: salaryDetails?.employee_id,
        employee_name: salaryDetails?.employee_name || '',
        employee_position: salaryDetails?.employee_position || '',
        employee_department: salaryDetails?.employee_department,
        base_salary: salaryDetails?.base_salary || 0,
        bonus: salaryDetails?.bonus || 0,
        allowances: salaryDetails?.allowances || 0,
        overtime_hours: salaryDetails?.overtime_hours || 0,
        overtime_rate: salaryDetails?.overtime_rate || 0,
        overtime_amount: salaryDetails?.overtime_amount || 0,
        payment_method: salaryDetails?.payment_method || 'bank_transfer',
        payment_frequency: salaryDetails?.payment_frequency || 'monthly',
        delivery_employee_id: salaryDetails?.delivery_employee_id,
        
        // Set default values for required fields that might not be in the new response
        gross_amount: charge.amount,
        net_amount: charge.amount,
        total_deductions: 0,
        total_allowances: salaryDetails?.allowances || 0,
        work_days: 0,
        work_hours: 0,
        pay_period_start: charge.date,
        pay_period_end: charge.date,
        employment_type: 'full_time' as const,
        tax_year: new Date(charge.date).getFullYear(),
        tax_month: new Date(charge.date).getMonth() + 1,
        tax_declaration_included: false,
      } as unknown as SalaryCharge;
    });
    
    return {
      ...result,
      data: transformedData
    };
  }
  
  return result;
};

export const getSalaryCharge = async (id: number, companyId?: number): Promise<SalaryChargeResponse> => {
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/charges/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

export const createSalaryCharge = async (data: CreateSalaryChargeData): Promise<CreateSalaryChargeResponse> => {
  // Validate employee type requirements
  if (data.employee_type === "delivery") {
    if (!data.delivery_employee_id) {
      throw new Error("delivery_employee_id is required for delivery employees");
    }
    if (data.user_id !== null && data.user_id !== undefined) {
      throw new Error("user_id should be null for delivery employees");
    }
  } else if (data.employee_type === "moderator") {
    if (!data.user_id) {
      throw new Error("user_id is required for moderators");
    }
    if (data.delivery_employee_id !== null && data.delivery_employee_id !== undefined) {
      throw new Error("delivery_employee_id should be null for moderators");
    }
  } else {
    // For warehouse and office employees
    if (data.delivery_employee_id !== null && data.delivery_employee_id !== undefined) {
      throw new Error("delivery_employee_id should be null for warehouse/office employees");
    }
    if (data.user_id !== null && data.user_id !== undefined) {
      throw new Error("user_id should be null for warehouse/office employees");
    }
  }
  
  const response = await fetch(`${baseUrl}/charges/salaries`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

export const updateSalaryCharge = async (id: number, data: UpdateSalaryChargeData, companyId?: number): Promise<SalaryChargeResponse> => {
  // Ensure company_id is included in the request body
  const requestData = {
    ...data,
    company_id: data.company_id || companyId || undefined
  };
  
  const response = await fetch(`${baseUrl}/charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  await handleApiError(response);
  return response.json();
};

export const deleteSalaryCharge = async (id: number, companyId?: number): Promise<APIResponse<void>> => {
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/charges/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Salary calculation utilities
export const calculateSalary = async (params: SalaryCalculationParams): Promise<SalaryCalculationResponse> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  const baseAmount = params.base_salary;
  const overtimeAmount = (params.overtime_hours || 0) * (params.overtime_rate || 0);
  const totalAllowances = Object.values(params.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
  const totalDeductions = Object.values(params.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
  const grossAmount = baseAmount + overtimeAmount + totalAllowances;
  const netAmount = grossAmount - totalDeductions;
  
  return {
    status: "success",
    message: "Salary calculated successfully",
    data: {
      base_amount: baseAmount,
      overtime_amount: overtimeAmount,
      total_allowances: totalAllowances,
      total_deductions: totalDeductions,
      gross_amount: grossAmount,
      net_amount: netAmount,
      calculation_breakdown: {
        base_salary: baseAmount,
        overtime: overtimeAmount,
        allowances: params.allowances || {},
        deductions: params.deductions || {}
      },
      effective_hourly_rate: baseAmount / (params.work_hours || 1),
      days_worked: params.work_days,
      hours_worked: params.work_hours
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const calculateOvertime = async (params: {
  base_salary: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_rate_multiplier?: number;
  pay_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
}): Promise<APIResponse<{ overtime_amount: number; hourly_rate: number; overtime_rate: number }>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  const hourlyRate = params.base_salary / params.regular_hours;
  const overtimeRate = hourlyRate * (params.overtime_rate_multiplier || 1.5);
  const overtimeAmount = params.overtime_hours * overtimeRate;
  
  return {
    status: "success",
    message: "Overtime calculated successfully",
    data: {
      overtime_amount: overtimeAmount,
      hourly_rate: hourlyRate,
      overtime_rate: overtimeRate
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/calculate-overtime`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Bulk operations
export const bulkCreateSalaryCharges = async (salaryCharges: CreateSalaryChargeData[]): Promise<BulkSalaryResponse> => {
  // Ensure company_id is included in all charges
  const chargesWithCompanyId = salaryCharges.map(charge => ({
    ...charge,
    company_id: charge.company_id || 1
  }));
  
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Bulk salary charges created successfully",
    data: {
      operation_id: "bulk_123",
      operation_type: "create",
      total_records: chargesWithCompanyId.length,
      successful_records: chargesWithCompanyId.length,
      failed_records: 0,
      errors: [],
      created_salary_charges: [] // Empty array to avoid type issues
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ salary_charges: chargesWithCompanyId }),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const bulkUpdateSalaryCharges = async (updates: Array<UpdateSalaryChargeData & { id: number }>, companyId?: number): Promise<BulkSalaryResponse> => {
  // Ensure company_id is included in all updates
  const updatesWithCompanyId = updates.map(update => ({
    ...update,
    company_id: update.company_id || companyId || undefined
  }));
  
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Bulk salary charges updated successfully",
    data: {
      operation_id: "bulk_update_123",
      operation_type: "update",
      total_records: updatesWithCompanyId.length,
      successful_records: updatesWithCompanyId.length,
      failed_records: 0,
      errors: [],
      created_salary_charges: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/bulk`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ updates: updatesWithCompanyId }),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const bulkDeleteSalaryCharges = async (ids: number[]): Promise<BulkSalaryResponse> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Bulk salary charges deleted successfully",
    data: {
      operation_id: "bulk_delete_123",
      operation_type: "delete",
      total_records: ids.length,
      successful_records: ids.length,
      failed_records: 0,
      errors: [],
      created_salary_charges: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const response = await fetch(`${baseUrl}/api/salary/bulk`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Payroll batch operations
export const createPayrollBatch = async (data: {
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  employee_ids?: number[];
  department?: string;
  employment_type?: string;
  auto_calculate?: boolean;
  company_id?: number;
}): Promise<PayrollBatchResponse> => {
  // Ensure company_id is included in the request
  
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Payroll batch created successfully",
    data: {
      ID: "batch_123",
      name: data.name,
      pay_period_start: data.pay_period_start,
      pay_period_end: data.pay_period_end,
      total_employees: 25,
      total_amount: 12500000,
      status: "draft",
      created_by_id: 1,
      salary_charges: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/payroll-batches`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const processPayrollBatch = async (batchId: string): Promise<APIResponse<PayrollBatch>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Payroll batch processed successfully",
    data: {
      ID: batchId,
      name: "January 2025 Payroll",
      pay_period_start: "2025-01-01",
      pay_period_end: "2025-01-31",
      total_employees: 25,
      total_amount: 12500000,
      status: "completed",
      created_by_id: 1,
      processed_at: "2025-01-15T10:00:00Z",
      salary_charges: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/api/salary/payroll-batches/${batchId}/process${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const getPayrollBatches = async (_params: {
  limit?: number;
  offset?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  company_id?: number;
} = {}): Promise<APIResponse<PayrollBatch[]>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Payroll batches retrieved successfully",
    data: [
      {
        ID: "batch_123",
        name: "January 2025 Payroll",
        pay_period_start: "2025-01-01",
        pay_period_end: "2025-01-31",
        total_employees: 25,
        total_amount: 12500000,
        status: "completed",
        created_by_id: 1,
        processed_at: "2025-01-15T10:00:00Z",
        salary_charges: []
      },
      {
        ID: "batch_124",
        name: "February 2025 Payroll",
        pay_period_start: "2025-02-01",
        pay_period_end: "2025-02-28",
        total_employees: 25,
        total_amount: 12500000,
        status: "draft",
        created_by_id: 1,
        salary_charges: []
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/api/salary/payroll-batches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Salary templates
export const getSalaryTemplates = async (companyId?: number): Promise<SalaryTemplateResponse> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Salary templates retrieved successfully",
    data: [
      {
        ID: 1,
        name: "Standard Full-Time",
        position: "Developer",
        department: "Engineering",
        base_salary: 500000,
        overtime_rate: 1.5,
        allowances: {
          transport: 50000,
          meal: 30000,
          housing: 100000
        },
        deductions: {
          social_security_rate: 10,
          tax_rate: 15,
          insurance_rate: 5
        },
        is_active: true,
        created_by_id: 1,
        company_id: companyId || 1
      },
      {
        ID: 2,
        name: "Part-Time Contract",
        position: "Sales Representative",
        department: "Sales",
        base_salary: 300000,
        overtime_rate: 1.25,
        allowances: {
          transport: 25000,
          meal: 15000
        },
        deductions: {
          social_security_rate: 8,
          tax_rate: 12,
          insurance_rate: 3
        },
        is_active: true,
        created_by_id: 1,
        company_id: companyId || 1
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/api/salary/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const createSalaryTemplate = async (data: Omit<SalaryTemplate, "ID"> & { company_id?: number }): Promise<APIResponse<SalaryTemplate>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Salary template created successfully",
    data: {
      ID: 3,
      ...data,
      is_active: true
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/templates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Clock-in records and timesheet integration
export const getClockInRecords = async (_companyId?: number): Promise<APIResponse<ClockInRecord[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Clock-in records retrieved successfully",
    data: [
      {
        ID: 1,
        employee_id: 1,
        date: "2025-01-15",
        clock_in: "2025-01-15T08:00:00Z",
        clock_out: "2025-01-15T17:00:00Z",
        total_hours: 9,
        overtime_hours: 1,
        location: "Office",
        approved_by_id: 5,
        notes: "Regular day"
      },
      {
        ID: 2,
        employee_id: 2,
        date: "2025-01-15",
        clock_in: "2025-01-15T08:30:00Z",
        clock_out: "2025-01-15T17:30:00Z",
        total_hours: 9,
        overtime_hours: 0.5,
        location: "Office",
        approved_by_id: undefined,
        notes: "Late arrival"
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/api/salary/clock-in-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const calculateSalaryFromTimesheet = async (params: {
  employee_id: number;
  timesheet_id: number;
  base_salary: number;
  overtime_rate_multiplier?: number;
  company_id?: number;
}): Promise<SalaryCalculationResponse> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  const baseAmount = params.base_salary;
  const overtimeAmount = baseAmount * 0.1; // 10% overtime
  const totalAllowances = baseAmount * 0.2; // 20% allowances
  const totalDeductions = baseAmount * 0.15; // 15% deductions
  const grossAmount = baseAmount + overtimeAmount + totalAllowances;
  const netAmount = grossAmount - totalDeductions;
  
  return {
    status: "success",
    message: "Salary calculated from timesheet successfully",
    data: {
      base_amount: baseAmount,
      overtime_amount: overtimeAmount,
      total_allowances: totalAllowances,
      total_deductions: totalDeductions,
      gross_amount: grossAmount,
      net_amount: netAmount,
      calculation_breakdown: {
        base_salary: baseAmount,
        overtime: overtimeAmount,
        allowances: { transport: 50000, meal: 30000 },
        deductions: { social_security_rate: 10, tax_rate: 15 }
      },
      effective_hourly_rate: baseAmount / 160, // 160 hours per month
      days_worked: 22,
      hours_worked: 176
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/api/salary/calculate-from-timesheet`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Dashboard and analytics
export const getSalaryDashboard = async (params: SalaryDashboardParams = {}): Promise<SalaryDashboardResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add company_id if provided
  if (params.company_id) {
    queryParams.append('company_id', params.company_id.toString());
  }
  
  // Add date filters if provided
  if (params.date_from) {
    queryParams.append('date_from', params.date_from);
  }
  if (params.date_to) {
    queryParams.append('date_to', params.date_to);
  }
  
  // Add department filter if provided
  if (params.department) {
    queryParams.append('department', params.department);
  }
  
  // Add employment type filter if provided
  if (params.employment_type) {
    queryParams.append('employment_type', params.employment_type);
  }
  
  const url = `${baseUrl}/charges/salaries/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

export const getSalaryHistory = async (employeeId: number, _companyId?: number): Promise<APIResponse<SalaryHistory[]>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Salary history retrieved successfully",
    data: [
      {
        ID: 1,
        employee_id: employeeId,
        effective_date: "2025-01-01",
        previous_salary: 480000,
        new_salary: 500000,
        change_reason: "Annual raise",
        approved_by_id: 1,
        created_at: "2025-01-15T10:00:00Z"
      },
      {
        ID: 2,
        employee_id: employeeId,
        effective_date: "2024-07-01",
        previous_salary: 450000,
        new_salary: 480000,
        change_reason: "Performance bonus",
        approved_by_id: 1,
        created_at: "2024-06-15T10:00:00Z"
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) {
    queryParams.append('company_id', companyId.toString());
  }
  
  const url = `${baseUrl}/api/salary/history/${employeeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Export and import
export const exportSalaryCharges = async (_params: {
  format?: string;
  company_id?: number;
  [key: string]: any;
} = {}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Salary charges exported successfully",
    data: {
      file_url: "https://api.example.com/exports/salary_charges_2025_01_15.xlsx",
      file_size: 1024000
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('type', 'employee_salary');
  queryParams.append('format', params.format || 'xlsx');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'format') {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/api/salary/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

export const importSalaryCharges = async (_file: File, _options?: {
  company_id?: number;
  [key: string]: any;
}): Promise<BulkSalaryResponse> => {
  // UNDOCUMENTED ROUTE - Mock data for UI testing
  return {
    status: "success",
    message: "Salary charges imported successfully",
    data: {
      operation_id: "import_123",
      operation_type: "create",
      total_records: 25,
      successful_records: 23,
      failed_records: 2,
      errors: [
        { record_index: 5, error: "Invalid employee ID" },
        { record_index: 12, error: "Missing required field" }
      ],
      created_salary_charges: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
  }
  
  const response = await fetch(`${baseUrl}/api/salary/import`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Approval workflow
export const submitSalaryChargeForApproval = async (id: number, notes?: string, companyId?: number): Promise<SalaryChargeResponse> => {
  const requestData = {
    notes,
    company_id: companyId
  };
  
  const response = await fetch(`${baseUrl}/charges/${id}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  await handleApiError(response);
  return response.json();
};

export const approveSalaryCharge = async (id: number, notes?: string, companyId?: number): Promise<SalaryChargeResponse> => {
  const requestData = {
    notes,
    company_id: companyId
  };
  
  const response = await fetch(`${baseUrl}/charges/${id}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  await handleApiError(response);
  return response.json();
};

export const rejectSalaryCharge = async (id: number, reason: string, companyId?: number): Promise<SalaryChargeResponse> => {
  const requestData = {
    reason,
    company_id: companyId
  };
  
  const response = await fetch(`${baseUrl}/charges/${id}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  await handleApiError(response);
  return response.json();
};

export const getPendingSalaryCharges = async (params: {
  limit?: number;
  offset?: number;
  department?: string;
  approver_id?: number;
  company_id?: number;
}): Promise<SalaryChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add company_id if provided
  if (params.company_id) {
    queryParams.append('company_id', params.company_id.toString());
  }
  
  // Add limit and offset
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }
  
  // Add status filter for pending charges
  queryParams.append('status', 'pending');
  
  const url = `${baseUrl}/charges/salaries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  const result = await response.json();
  
  // Transform the new response structure to match the existing interface
  if (result.data && Array.isArray(result.data)) {
    const transformedData = result.data.map((item: any) => {
      const charge = item.charge;
      const salaryDetails = item.salary_details;
      
      // Safety check for required fields
      if (!charge || !salaryDetails) {
        console.warn('Missing charge or salary_details in API response:', item);
        return null;
      }
      
      // Merge charge and salary_details into a single SalaryCharge object
      return {
        ID: charge.ID,
        company_id: charge.company_id,
        title: charge.title,
        description: charge.description,
        amount: charge.amount,
        currency: charge.currency,
        type: "salary" as const,
        status: charge.status,
        priority: "medium" as const,
        date: charge.date,
        CreatedAt: charge.CreatedAt || charge.created_at,
        UpdatedAt: charge.UpdatedAt || charge.updated_at,
        DeletedAt: charge.DeletedAt || null,
        created_by_id: charge.created_by,
        updated_by_id: charge.updated_by,
        approved_by_id: charge.approved_by,
        approved_at: charge.approved_at,
        approval_required: true,
        
        // Salary-specific fields from salary_details
        employee_id: salaryDetails?.employee_id,
        employee_name: salaryDetails?.employee_name || '',
        employee_position: charge.title || '', // Use charge title as position
        employee_department: salaryDetails?.employee_department || '',
        base_salary: salaryDetails?.base_salary || 0,
        bonus: salaryDetails?.bonus || 0,
        allowances: salaryDetails?.allowances || 0,
        overtime_hours: salaryDetails?.overtime_hours || 0,
        overtime_rate: salaryDetails?.overtime_rate || 0,
        overtime_amount: salaryDetails?.overtime_amount || 0,
        payment_method: salaryDetails?.payment_method || 'bank_transfer',
        payment_frequency: salaryDetails?.payment_frequency || 'monthly',
        delivery_employee_id: salaryDetails?.delivery_employee_id,
        
        // Set default values for required fields that might not be in the new response
        gross_amount: charge.amount || 0,
        net_amount: charge.amount || 0,
        total_deductions: 0,
        total_allowances: salaryDetails?.allowances || 0,
        work_days: 0,
        work_hours: 0,
        pay_period_start: charge.date || null,
        pay_period_end: charge.date || null,
        employment_type: 'full_time' as const,
        tax_year: charge.date ? (() => {
          try {
            const date = new Date(charge.date);
            return isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
          } catch {
            return new Date().getFullYear();
          }
        })() : new Date().getFullYear(),
        tax_month: charge.date ? (() => {
          try {
            const date = new Date(charge.date);
            return isNaN(date.getTime()) ? new Date().getMonth() + 1 : date.getMonth() + 1;
          } catch {
            return new Date().getMonth() + 1;
          }
        })() : new Date().getMonth() + 1,
        tax_declaration_included: false,
      } as unknown as SalaryCharge;
    }).filter(Boolean); // Remove null values
    
    return {
      ...result,
      data: transformedData
    };
  }
  
  return result;
};