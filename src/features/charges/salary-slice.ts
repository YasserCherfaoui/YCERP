// Redux slice for salary charges
import { ClockInRecord, PayrollBatch, SalaryCharge, SalaryHistory, SalaryTemplate } from '@/models/data/charges/salary.model';
import {
    approveSalaryCharge,
    bulkCreateSalaryCharges,
    bulkDeleteSalaryCharges,
    BulkSalaryOperationResult,
    bulkUpdateSalaryCharges,
    calculateOvertime,
    calculateSalary,
    calculateSalaryFromTimesheet,
    createPayrollBatch,
    createSalaryCharge,
    CreateSalaryChargeData,
    createSalaryTemplate,
    deleteSalaryCharge,
    exportSalaryCharges,
    FetchSalaryChargesParams,
    getClockInRecords,
    getPayrollBatches,
    getPendingSalaryCharges,
    getSalaryCharge,
    getSalaryCharges,
    getSalaryDashboard,
    getSalaryHistory,
    getSalaryTemplates,
    importSalaryCharges,
    processPayrollBatch,
    rejectSalaryCharge,
    SalaryCalculationParams,
    SalaryCalculationResult,
    SalaryDashboardData,
    SalaryDashboardParams,
    submitSalaryChargeForApproval,
    updateSalaryCharge,
    UpdateSalaryChargeData,
} from '@/services/salary-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Filters and form interfaces
export interface SalaryFilters {
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
}

export interface SalaryFormData extends CreateSalaryChargeData {}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Main salary state interface
export interface SalaryState {
  // Data
  salaryCharges: SalaryCharge[];
  selectedSalaryCharge: SalaryCharge | null;
  salaryTemplates: SalaryTemplate[];
  payrollBatches: PayrollBatch[];
  salaryHistory: SalaryHistory[];
  clockInRecords: ClockInRecord[];
  pendingApprovals: SalaryCharge[];
  
  // UI State
  loading: boolean;
  error: string | null;
  templatesLoading: boolean;
  batchesLoading: boolean;
  historyLoading: boolean;
  clockInLoading: boolean;
  approvalsLoading: boolean;
  
  // Calculator state
  calculator: {
    params: SalaryCalculationParams | null;
    result: SalaryCalculationResult | null;
    loading: boolean;
    error: string | null;
  };
  
  // Bulk operations
  bulkOperation: {
    loading: boolean;
    result: BulkSalaryOperationResult | null;
    error: string | null;
  };
  
  // Dashboard data
  dashboard: {
    data: SalaryDashboardData | null;
    loading: boolean;
    error: string | null;
  };
  
  // Filters and pagination
  filters: SalaryFilters;
  pagination: PaginationState;
  
  // Form state
  formData: SalaryFormData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Selected items for bulk operations
  selectedSalaryChargeIds: number[];
  
  // Payroll batch creation
  payrollBatchForm: {
    name: string;
    pay_period_start: string;
    pay_period_end: string;
    employee_ids: number[];
    department?: string;
    employment_type?: string;
    auto_calculate: boolean;
  };
}

const initialState: SalaryState = {
  // Data
  salaryCharges: [],
  selectedSalaryCharge: null,
  salaryTemplates: [],
  payrollBatches: [],
  salaryHistory: [],
  clockInRecords: [],
  pendingApprovals: [],
  
  // UI State
  loading: false,
  error: null,
  templatesLoading: false,
  batchesLoading: false,
  historyLoading: false,
  clockInLoading: false,
  approvalsLoading: false,
  
  // Calculator state
  calculator: {
    params: null,
    result: null,
    loading: false,
    error: null,
  },
  
  // Bulk operations
  bulkOperation: {
    loading: false,
    result: null,
    error: null,
  },
  
  // Dashboard data
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Filters and pagination
  filters: {
    sort_by: "created_at",
    sort_order: "desc",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // Selected items
  selectedSalaryChargeIds: [],
  
  // Payroll batch form
  payrollBatchForm: {
    name: '',
    pay_period_start: '',
    pay_period_end: '',
    employee_ids: [],
    auto_calculate: true,
  },
};

// Async thunks

// Fetch salary charges
export const fetchSalaryCharges = createAsyncThunk(
  'salary/fetchSalaryCharges',
  async (params: FetchSalaryChargesParams, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getSalaryCharges({
        ...params,
        company_id: companyId
      });
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch salary charges');
    }
  }
);

// Fetch single salary charge
export const fetchSalaryCharge = createAsyncThunk(
  'salary/fetchSalaryCharge',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getSalaryCharge(id, companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch salary charge');
    }
  }
);

// Create salary charge
export const createSalaryChargeAsync = createAsyncThunk(
  'salary/createSalaryCharge',
  async (data: CreateSalaryChargeData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await createSalaryCharge({
        ...data,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create salary charge');
    }
  }
);

// Update salary charge
export const updateSalaryChargeAsync = createAsyncThunk(
  'salary/updateSalaryCharge',
  async ({ id, data }: { id: number; data: UpdateSalaryChargeData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await updateSalaryCharge(id, data, companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update salary charge');
    }
  }
);

// Delete salary charge
export const deleteSalaryChargeAsync = createAsyncThunk(
  'salary/deleteSalaryCharge',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      await deleteSalaryCharge(id, companyId);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete salary charge');
    }
  }
);

// Calculate salary
export const calculateSalaryAsync = createAsyncThunk(
  'salary/calculateSalary',
  async (params: SalaryCalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateSalary(params);
      return { params, result: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate salary');
    }
  }
);

// Calculate overtime
export const calculateOvertimeAsync = createAsyncThunk(
  'salary/calculateOvertime',
  async (params: {
    base_salary: number;
    regular_hours: number;
    overtime_hours: number;
    overtime_rate_multiplier?: number;
    pay_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  }, { rejectWithValue }) => {
    try {
      const response = await calculateOvertime(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate overtime');
    }
  }
);

// Bulk operations
export const bulkCreateSalaryChargesAsync = createAsyncThunk(
  'salary/bulkCreateSalaryCharges',
  async (salaryCharges: CreateSalaryChargeData[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const chargesWithCompanyId = salaryCharges.map(charge => ({
        ...charge,
        company_id: companyId
      }));
      
      const response = await bulkCreateSalaryCharges(chargesWithCompanyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk create salary charges');
    }
  }
);

export const bulkUpdateSalaryChargesAsync = createAsyncThunk(
  'salary/bulkUpdateSalaryCharges',
  async (updates: Array<UpdateSalaryChargeData & { id: number }>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await bulkUpdateSalaryCharges(updates, companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk update salary charges');
    }
  }
);

export const bulkDeleteSalaryChargesAsync = createAsyncThunk(
  'salary/bulkDeleteSalaryCharges',
  async (ids: number[], { rejectWithValue, getState }) => {
    try {
      
      const response = await bulkDeleteSalaryCharges(ids);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk delete salary charges');
    }
  }
);

// Payroll operations
export const createPayrollBatchAsync = createAsyncThunk(
  'salary/createPayrollBatch',
  async (data: {
    name: string;
    pay_period_start: string;
    pay_period_end: string;
    employee_ids?: number[];
    department?: string;
    employment_type?: string;
    auto_calculate?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await createPayrollBatch({
        ...data,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create payroll batch');
    }
  }
);

export const processPayrollBatchAsync = createAsyncThunk(
  'salary/processPayrollBatch',
  async (batchId: string, { rejectWithValue, getState }) => {
    try {
      
      const response = await processPayrollBatch(batchId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process payroll batch');
    }
  }
);

export const fetchPayrollBatches = createAsyncThunk(
  'salary/fetchPayrollBatches',
  async (params: {
    limit?: number;
    offset?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getPayrollBatches({
        ...params,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch payroll batches');
    }
  }
);

// Templates
export const fetchSalaryTemplates = createAsyncThunk(
  'salary/fetchSalaryTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSalaryTemplates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch salary templates');
    }
  }
);

export const createSalaryTemplateAsync = createAsyncThunk(
  'salary/createSalaryTemplate',
  async (data: Omit<SalaryTemplate, "ID">, { rejectWithValue }) => {
    try {
      const response = await createSalaryTemplate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create salary template');
    }
  }
);

// Time tracking
export const fetchClockInRecords = createAsyncThunk(
  'salary/fetchClockInRecords',
  async (params: {
    employee_id?: number;
    date_from?: string;
    date_to?: string;
    approved_only?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getClockInRecords(companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch clock-in records');
    }
  }
);

export const calculateSalaryFromTimesheetAsync = createAsyncThunk(
  'salary/calculateSalaryFromTimesheet',
  async (params: {
    employee_id: number;
    timesheet_id: number;
    base_salary: number;
    overtime_rate_multiplier?: number;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await calculateSalaryFromTimesheet({
        ...params,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate salary from timesheet');
    }
  }
);

// Dashboard
export const fetchSalaryDashboard = createAsyncThunk(
  'salary/fetchSalaryDashboard',
  async (params: SalaryDashboardParams, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getSalaryDashboard({
        ...params,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch salary dashboard');
    }
  }
);

// Salary history
export const fetchSalaryHistory = createAsyncThunk(
  'salary/fetchSalaryHistory',
  async (employeeId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getSalaryHistory(employeeId, companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch salary history');
    }
  }
);

// Export
export const exportSalaryChargesAsync = createAsyncThunk(
  'salary/exportSalaryCharges',
  async (params: FetchSalaryChargesParams & {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    include_details?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await exportSalaryCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export salary charges');
    }
  }
);

// Import
export const importSalaryChargesAsync = createAsyncThunk(
  'salary/importSalaryCharges',
  async ({ file, options }: {
    file: File;
    options?: {
      skip_duplicates?: boolean;
      auto_calculate?: boolean;
      template_id?: number;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await importSalaryCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import salary charges');
    }
  }
);

// Approval workflow
export const submitSalaryChargeForApprovalAsync = createAsyncThunk(
  'salary/submitSalaryChargeForApproval',
  async ({ id, notes }: { id: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await submitSalaryChargeForApproval(id, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit salary charge for approval');
    }
  }
);

export const approveSalaryChargeAsync = createAsyncThunk(
  'salary/approveSalaryCharge',
  async ({ id, notes }: { id: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await approveSalaryCharge(id, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to approve salary charge');
    }
  }
);

export const rejectSalaryChargeAsync = createAsyncThunk(
  'salary/rejectSalaryCharge',
  async ({ id, notes }: { id: number; notes: string }, { rejectWithValue }) => {
    try {
      const response = await rejectSalaryCharge(id, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reject salary charge');
    }
  }
);

export const fetchPendingSalaryCharges = createAsyncThunk(
  'salary/fetchPendingSalaryCharges',
  async (params: {
    limit?: number;
    offset?: number;
    department?: string;
    approver_id?: number;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const companyId = state.company?.company?.ID || state.user?.company?.ID;
      
      const response = await getPendingSalaryCharges({
        ...params,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pending salary charges');
    }
  }
);

// Salary slice
const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {
    // UI actions
    clearError: (state) => {
      state.error = null;
      state.calculator.error = null;
      state.bulkOperation.error = null;
      state.dashboard.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSelectedSalaryCharge: (state, action: PayloadAction<SalaryCharge | null>) => {
      state.selectedSalaryCharge = action.payload;
    },
    
    // Filters and pagination
    setFilters: (state, action: PayloadAction<Partial<SalaryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        sort_by: "created_at",
        sort_order: "desc",
      };
    },
    
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Form management
    setFormData: (state, action: PayloadAction<SalaryFormData | null>) => {
      state.formData = action.payload;
    },
    
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },
    
    clearFormData: (state) => {
      state.formData = null;
      state.formErrors = {};
      state.isSubmitting = false;
    },
    
    // Selection management
    setSelectedSalaryChargeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedSalaryChargeIds = action.payload;
    },
    
    toggleSalaryChargeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedSalaryChargeIds.indexOf(id);
      if (index === -1) {
        state.selectedSalaryChargeIds.push(id);
      } else {
        state.selectedSalaryChargeIds.splice(index, 1);
      }
    },
    
    clearSelection: (state) => {
      state.selectedSalaryChargeIds = [];
    },
    
    // Calculator
    clearCalculatorResult: (state) => {
      state.calculator.result = null;
      state.calculator.params = null;
      state.calculator.error = null;
    },
    
    // Payroll batch form
    setPayrollBatchForm: (state, action: PayloadAction<Partial<typeof initialState.payrollBatchForm>>) => {
      state.payrollBatchForm = { ...state.payrollBatchForm, ...action.payload };
    },
    
    clearPayrollBatchForm: (state) => {
      state.payrollBatchForm = {
        name: '',
        pay_period_start: '',
        pay_period_end: '',
        employee_ids: [],
        auto_calculate: true,
      };
    },
    
    // Bulk operation
    clearBulkOperationResult: (state) => {
      state.bulkOperation.result = null;
      state.bulkOperation.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch salary charges
    builder
      .addCase(fetchSalaryCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaryCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.salaryCharges = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            total: action.payload.pagination.total,
            pages: action.payload.pagination.pages,
          };
        }
      })
      .addCase(fetchSalaryCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single salary charge
    builder
      .addCase(fetchSalaryCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaryCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSalaryCharge = action.payload || null;
      })
      .addCase(fetchSalaryCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create salary charge
    builder
      .addCase(createSalaryChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(createSalaryChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.salaryCharges.unshift(action.payload);
        }
        state.formData = null;
      })
      .addCase(createSalaryChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update salary charge
    builder
      .addCase(updateSalaryChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(updateSalaryChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload?.ID) {
          const index = state.salaryCharges.findIndex(c => c.ID === action.payload!.ID);
          if (index !== -1) {
            state.salaryCharges[index] = action.payload!;
          }
          if (state.selectedSalaryCharge?.ID === action.payload!.ID) {
            state.selectedSalaryCharge = action.payload!;
          }
        }
      })
      .addCase(updateSalaryChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete salary charge
    builder
      .addCase(deleteSalaryChargeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSalaryChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.salaryCharges = state.salaryCharges.filter(c => c.ID !== action.payload);
          if (state.selectedSalaryCharge?.ID === action.payload) {
            state.selectedSalaryCharge = null;
          }
        }
      })
      .addCase(deleteSalaryChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Calculate salary
    builder
      .addCase(calculateSalaryAsync.pending, (state) => {
        state.calculator.loading = true;
        state.calculator.error = null;
      })
      .addCase(calculateSalaryAsync.fulfilled, (state, action) => {
        state.calculator.loading = false;
        if (action.payload) {
          state.calculator.params = action.payload.params;
          state.calculator.result = action.payload.result || null;
        }
      })
      .addCase(calculateSalaryAsync.rejected, (state, action) => {
        state.calculator.loading = false;
        state.calculator.error = action.payload as string;
      });

    // Bulk operations
    builder
      .addCase(bulkCreateSalaryChargesAsync.pending, (state) => {
        state.bulkOperation.loading = true;
        state.bulkOperation.error = null;
      })
      .addCase(bulkCreateSalaryChargesAsync.fulfilled, (state, action) => {
        state.bulkOperation.loading = false;
        state.bulkOperation.result = action.payload || null;
        if (action.payload?.created_salary_charges) {
          state.salaryCharges = [...action.payload.created_salary_charges, ...state.salaryCharges];
        }
      })
      .addCase(bulkCreateSalaryChargesAsync.rejected, (state, action) => {
        state.bulkOperation.loading = false;
        state.bulkOperation.error = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchSalaryDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchSalaryDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload || null;
      })
      .addCase(fetchSalaryDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload as string;
      });

    // Templates
    builder
      .addCase(fetchSalaryTemplates.pending, (state) => {
        state.templatesLoading = true;
      })
      .addCase(fetchSalaryTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.salaryTemplates = action.payload || [];
      })
      .addCase(fetchSalaryTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.error = action.payload as string;
      });

    // Payroll batches
    builder
      .addCase(createPayrollBatchAsync.pending, (state) => {
        state.batchesLoading = true;
      })
      .addCase(createPayrollBatchAsync.fulfilled, (state, action) => {
        state.batchesLoading = false;
        if (action.payload) {
          state.payrollBatches.unshift(action.payload);
        }
      })
      .addCase(createPayrollBatchAsync.rejected, (state, action) => {
        state.batchesLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPayrollBatches.pending, (state) => {
        state.batchesLoading = true;
      })
      .addCase(fetchPayrollBatches.fulfilled, (state, action) => {
        state.batchesLoading = false;
        state.payrollBatches = action.payload || [];
      })
      .addCase(fetchPayrollBatches.rejected, (state, action) => {
        state.batchesLoading = false;
        state.error = action.payload as string;
      });

    // Approval workflow
    builder
      .addCase(fetchPendingSalaryCharges.pending, (state) => {
        state.approvalsLoading = true;
      })
      .addCase(fetchPendingSalaryCharges.fulfilled, (state, action) => {
        state.approvalsLoading = false;
        state.pendingApprovals = action.payload || [];
      })
      .addCase(fetchPendingSalaryCharges.rejected, (state, action) => {
        state.approvalsLoading = false;
        state.error = action.payload as string;
      });

    // Salary history
    builder
      .addCase(fetchSalaryHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchSalaryHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.salaryHistory = action.payload || [];
      })
      .addCase(fetchSalaryHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  setSelectedSalaryCharge,
  setFilters,
  clearFilters,
  setPagination,
  setFormData,
  setFormErrors,
  clearFormData,
  setSelectedSalaryChargeIds,
  toggleSalaryChargeSelection,
  clearSelection,
  clearCalculatorResult,
  setPayrollBatchForm,
  clearPayrollBatchForm,
  clearBulkOperationResult,
} = salarySlice.actions;

export default salarySlice.reducer;