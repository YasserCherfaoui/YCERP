// Redux slice for charges management
import { Charge, ChargeCategory, ChargeStatus, ChargeType } from '@/models/data/charges/charge.model';
import { ChargeAnalytics, ChargesDashboard } from '@/models/responses/charge-response.model';
import {
  approveCharge,
  bulkApproveCharges,
  bulkCreateCharges,
  bulkDeleteCharges,
  bulkRejectCharges,
  bulkUpdateCharges,
  createBoxingCharge,
  createCharge,
  createEmployeeSalaryCharge,
  createExchangeRateCharge,
  createShippingCharge,
  deleteCharge,
  getCharge,
  getCharges,
  getChargeTotals,
  markChargeAsPaid,
  rejectCharge,
  updateCharge
} from '@/services/charges-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Async thunks
export const fetchCharges = createAsyncThunk(
  'charges/fetchCharges',
  async (params: FetchChargesParams, { rejectWithValue }) => {
    try {
      const response = await getCharges(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCharge = createAsyncThunk(
  'charges/fetchCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getCharge(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChargeAsync = createAsyncThunk(
  'charges/createCharge',
  async (chargeData: CreateChargeData, { rejectWithValue }) => {
    try {
      const response = await createCharge(chargeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChargeAsync = createAsyncThunk(
  'charges/updateCharge',
  async ({ id, data }: { id: number; data: UpdateChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateCharge(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChargeAsync = createAsyncThunk(
  'charges/deleteCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteCharge(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveChargeAsync = createAsyncThunk(
  'charges/approveCharge',
  async ({ id, notes }: { id: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await approveCharge(id, notes);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectChargeAsync = createAsyncThunk(
  'charges/rejectCharge',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await rejectCharge(id, reason);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markChargeAsPaidAsync = createAsyncThunk(
  'charges/markChargeAsPaid',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await markChargeAsPaid(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Specialized charge creation thunks
export const createExchangeRateChargeAsync = createAsyncThunk(
  'charges/createExchangeRateCharge',
  async (data: {
    company_id: number;
    title: string;
    description: string;
    source_currency: string;
    target_currency: string;
    source_amount: number;
    target_amount: number;
    exchange_rate: number;
    rate_source: string;
    exchange_loss?: number;
    bank_fees?: number;
    total_cost: number;
  }, { rejectWithValue }) => {
    try {
      const response = await createExchangeRateCharge(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEmployeeSalaryChargeAsync = createAsyncThunk(
  'charges/createEmployeeSalaryCharge',
  async (data: {
    company_id: number;
    employee_name: string;
    employee_position: string;
    base_salary: number;
    allowances?: number;
    overtime_hours?: number;
    overtime_rate?: number;
    overtime_amount?: number;
    payment_method: string;
  }, { rejectWithValue }) => {
    try {
      const response = await createEmployeeSalaryCharge(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBoxingChargeAsync = createAsyncThunk(
  'charges/createBoxingCharge',
  async (data: {
    company_id: number;
    title: string;
    box_type: string;
    box_size: string;
    material_cost: number;
    labor_hours?: number;
    labor_rate?: number;
    labor_cost?: number;
    product_id?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await createBoxingCharge(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createShippingChargeAsync = createAsyncThunk(
  'charges/createShippingCharge',
  async (data: {
    company_id: number;
    title: string;
    shipping_method: string;
    destination: string;
    weight?: number;
    dimensions?: string;
    distance?: number;
    fuel_cost?: number;
    driver_fee?: number;
    insurance_fee?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await createShippingCharge(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Bulk operations
export const bulkCreateChargesAsync = createAsyncThunk(
  'charges/bulkCreateCharges',
  async (charges: CreateChargeData[], { rejectWithValue }) => {
    try {
      const response = await bulkCreateCharges(charges);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkUpdateChargesAsync = createAsyncThunk(
  'charges/bulkUpdateCharges',
  async (updates: { id: number; data: UpdateChargeData }[], { rejectWithValue }) => {
    try {
      const response = await bulkUpdateCharges(updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkDeleteChargesAsync = createAsyncThunk(
  'charges/bulkDeleteCharges',
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await bulkDeleteCharges(ids);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkApproveChargesAsync = createAsyncThunk(
  'charges/bulkApproveCharges',
  async ({ ids, notes }: { ids: number[]; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await bulkApproveCharges(ids, notes);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkRejectChargesAsync = createAsyncThunk(
  'charges/bulkRejectCharges',
  async ({ ids, reason }: { ids: number[]; reason: string }, { rejectWithValue }) => {
    try {
      const response = await bulkRejectCharges(ids, reason);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Analytics and totals
export const fetchChargeTotalsAsync = createAsyncThunk(
  'charges/fetchChargeTotals',
  async (params: {
    company_id?: number;
    start_date?: string;
    end_date?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await getChargeTotals(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChargesDashboard = createAsyncThunk(
  'charges/fetchDashboard',
  async (params: DashboardParams, { rejectWithValue }) => {
    try {
      const response = await getChargeTotals({
        company_id: params.company_id,
        start_date: params.date_from,
        end_date: params.date_to,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChargeAnalytics = createAsyncThunk(
  'charges/fetchAnalytics',
  async (params: AnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await getChargeTotals({
        company_id: params.company_id,
        start_date: params.start_date,
        end_date: params.end_date,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Types for the slice
export interface FetchChargesParams {
  page?: number;
  limit?: number;
  type?: ChargeType;
  status?: ChargeStatus;
  category?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  company_id?: number;
}

export interface CreateChargeData {
  company_id: number;
  type: ChargeType;
  category?: string;
  title: string;
  description?: string;
  amount: number;
  currency: 'DZD' | 'EUR' | 'USD';
  date: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reference_number?: string;
  notes?: string;
  tags?: string[];
  attachment_urls?: string[];
  approval_required?: boolean;
  [key: string]: any; // For specific charge type fields
}

export interface UpdateChargeData extends Partial<CreateChargeData> {
  status?: ChargeStatus;
  approval_notes?: string;
}

export interface DashboardParams {
  period?: 'week' | 'month' | 'quarter' | 'year';
  company_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface AnalyticsParams {
  start_date: string;
  end_date: string;
  charge_types?: ChargeType[];
  company_id?: number;
  include_forecasts?: boolean;
}

export interface ChargeFilters {
  type?: ChargeType;
  status?: ChargeStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  tags?: string[];
  priority?: string;
  created_by?: number;
  approval_required?: boolean;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// State interface
export interface ChargesState {
  // Data
  charges: Charge[];
  selectedCharge: Charge | null;
  categories: ChargeCategory[];
  dashboard: ChargesDashboard | null;
  analytics: ChargeAnalytics | null;
  totals: any;
  
  // UI State
  loading: boolean;
  dashboardLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: ChargeFilters;
  pagination: PaginationState;
  
  // Form state
  formData: CreateChargeData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // View preferences
  viewMode: 'list' | 'grid' | 'calendar';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Bulk operations
  selectedChargeIds: number[];
  bulkOperationInProgress: boolean;
  
  // Cache and sync
  lastFetchTime: string | null;
  lastSyncTime: string | null;
  cacheValid: boolean;
}

// Initial state
const initialState: ChargesState = {
  // Data
  charges: [],
  selectedCharge: null,
  categories: [],
  dashboard: null,
  analytics: null,
  totals: null,
  
  // UI State
  loading: false,
  dashboardLoading: false,
  analyticsLoading: false,
  error: null,
  
  // Filters and pagination
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  },
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // View preferences
  viewMode: 'list',
  sortBy: 'created_at',
  sortOrder: 'desc',
  
  // Bulk operations
  selectedChargeIds: [],
  bulkOperationInProgress: false,
  
  // Cache and sync
  lastFetchTime: null,
  lastSyncTime: null,
  cacheValid: false,
};

// Slice definition
export const chargesSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    // Data management
    setCharges: (state, action: PayloadAction<Charge[]>) => {
      state.charges = action.payload;
      state.cacheValid = true;
      state.lastFetchTime = new Date().toISOString();
    },
    
    addCharge: (state, action: PayloadAction<Charge>) => {
      state.charges.unshift(action.payload);
      state.pagination.total += 1;
    },
    
    updateChargeInList: (state, action: PayloadAction<Charge>) => {
      const index = state.charges.findIndex(c => c.ID === action.payload.ID);
      if (index !== -1) {
        state.charges[index] = action.payload;
      }
      if (state.selectedCharge?.ID === action.payload.ID) {
        state.selectedCharge = action.payload;
      }
    },
    
    removeChargeFromList: (state, action: PayloadAction<number>) => {
      state.charges = state.charges.filter(c => c.ID !== action.payload);
      state.pagination.total -= 1;
      if (state.selectedCharge?.ID === action.payload) {
        state.selectedCharge = null;
      }
    },
    
    setSelectedCharge: (state, action: PayloadAction<Charge | null>) => {
      state.selectedCharge = action.payload;
    },
    
    // UI state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Filters and pagination
    setFilters: (state, action: PayloadAction<ChargeFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
      state.cacheValid = false;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<ChargeFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
      state.cacheValid = false;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
      state.cacheValid = false;
    },
    
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    
    updatePagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Form state management
    setFormData: (state, action: PayloadAction<CreateChargeData | null>) => {
      state.formData = action.payload;
      state.formErrors = {};
    },
    
    updateFormData: (state, action: PayloadAction<Partial<CreateChargeData>>) => {
      if (state.formData) {
        state.formData = { ...state.formData, ...action.payload };
      }
    },
    
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },
    
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'calendar'>) => {
      state.viewMode = action.payload;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.cacheValid = false;
    },
    
    // Bulk operations
    setSelectedChargeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedChargeIds = action.payload;
    },
    
    toggleChargeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedChargeIds.indexOf(id);
      if (index > -1) {
        state.selectedChargeIds.splice(index, 1);
      } else {
        state.selectedChargeIds.push(id);
      }
    },
    
    selectAllCharges: (state) => {
      state.selectedChargeIds = state.charges.map(c => c.ID);
    },
    
    clearSelection: (state) => {
      state.selectedChargeIds = [];
    },
    
    setBulkOperationInProgress: (state, action: PayloadAction<boolean>) => {
      state.bulkOperationInProgress = action.payload;
    },
    
    // Cache management
    invalidateCache: (state) => {
      state.cacheValid = false;
    },
    
    updateLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
    
    // Reset state
    resetChargesState: (state) => {
      Object.assign(state, initialState);
    },
  },
  
  extraReducers: (builder) => {
    // Fetch charges
    builder
      .addCase(fetchCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.cacheValid = true;
        state.lastFetchTime = new Date().toISOString();
      })
      .addCase(fetchCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Fetch single charge
    builder
      .addCase(fetchCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharge.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.selectedCharge = action.payload;
          
          // Update charge in list if it exists
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
        }
      })
      .addCase(fetchCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Create charge
    builder
      .addCase(createChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
          state.pagination.total += 1;
        }
        state.formData = null;
        state.formErrors = {};
      })
      .addCase(createChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    // Update charge
    builder
      .addCase(updateChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        
        if (action.payload) {
          // Update in charges list
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
          
          // Update selected charge
          if (state.selectedCharge?.ID === action.payload?.ID) {
            state.selectedCharge = action.payload;
          }
        }
      })
      .addCase(updateChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    // Delete charge
    builder
      .addCase(deleteChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const chargeId = action.payload;
        state.charges = state.charges.filter(c => c.ID !== chargeId);
        state.pagination.total -= 1;
        
        if (state.selectedCharge?.ID === chargeId) {
          state.selectedCharge = null;
        }
        
        // Remove from selection
        state.selectedChargeIds = state.selectedChargeIds.filter(id => id !== chargeId);
      })
      .addCase(deleteChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Approve charge
    builder
      .addCase(approveChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload) {
          // Update in charges list
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
          
          // Update selected charge
          if (state.selectedCharge?.ID === action.payload?.ID) {
            state.selectedCharge = action.payload;
          }
        }
      })
      .addCase(approveChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Reject charge
    builder
      .addCase(rejectChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload) {
          // Update in charges list
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
          
          // Update selected charge
          if (state.selectedCharge?.ID === action.payload?.ID) {
            state.selectedCharge = action.payload;
          }
        }
      })
      .addCase(rejectChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Mark charge as paid
    builder
      .addCase(markChargeAsPaidAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markChargeAsPaidAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload) {
          // Update in charges list
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
          
          // Update selected charge
          if (state.selectedCharge?.ID === action.payload?.ID) {
            state.selectedCharge = action.payload;
          }
        }
      })
      .addCase(markChargeAsPaidAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Specialized charge creation
    builder
      .addCase(createExchangeRateChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createExchangeRateChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createExchangeRateChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    builder
      .addCase(createEmployeeSalaryChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEmployeeSalaryChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createEmployeeSalaryChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    builder
      .addCase(createBoxingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBoxingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createBoxingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    builder
      .addCase(createShippingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createShippingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createShippingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    // Bulk operations
    builder
      .addCase(bulkCreateChargesAsync.pending, (state) => {
        state.bulkOperationInProgress = true;
        state.error = null;
      })
      .addCase(bulkCreateChargesAsync.fulfilled, (state) => {
        state.bulkOperationInProgress = false;
        // Handle bulk creation results
      })
      .addCase(bulkCreateChargesAsync.rejected, (state, action) => {
        state.bulkOperationInProgress = false;
        state.error = action.payload as string;
      });
    
    builder
      .addCase(bulkApproveChargesAsync.pending, (state) => {
        state.bulkOperationInProgress = true;
        state.error = null;
      })
      .addCase(bulkApproveChargesAsync.fulfilled, (state) => {
        state.bulkOperationInProgress = false;
        state.selectedChargeIds = [];
      })
      .addCase(bulkApproveChargesAsync.rejected, (state, action) => {
        state.bulkOperationInProgress = false;
        state.error = action.payload as string;
      });
    
    builder
      .addCase(bulkRejectChargesAsync.pending, (state) => {
        state.bulkOperationInProgress = true;
        state.error = null;
      })
      .addCase(bulkRejectChargesAsync.fulfilled, (state) => {
        state.bulkOperationInProgress = false;
        state.selectedChargeIds = [];
      })
      .addCase(bulkRejectChargesAsync.rejected, (state, action) => {
        state.bulkOperationInProgress = false;
        state.error = action.payload as string;
      });
    
    // Charge totals
    builder
      .addCase(fetchChargeTotalsAsync.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchChargeTotalsAsync.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.totals = action.payload;
      })
      .addCase(fetchChargeTotalsAsync.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });
    
    // Dashboard
    builder
      .addCase(fetchChargesDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchChargesDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        if (action.payload) {
          state.dashboard = action.payload;
        }
      })
      .addCase(fetchChargesDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload as string;
      });
    
    // Analytics
    builder
      .addCase(fetchChargeAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchChargeAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload) {
          state.analytics = action.payload;
        }
      })
      .addCase(fetchChargeAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setCharges,
  addCharge,
  updateChargeInList,
  removeChargeFromList,
  setSelectedCharge,
  setLoading,
  setError,
  clearError,
  setFilters,
  updateFilters,
  clearFilters,
  setPagination,
  updatePagination,
  setFormData,
  updateFormData,
  setFormErrors,
  clearFormErrors,
  setSubmitting,
  setViewMode,
  setSorting,
  setSelectedChargeIds,
  toggleChargeSelection,
  selectAllCharges,
  clearSelection,
  setBulkOperationInProgress,
  invalidateCache,
  updateLastSyncTime,
  resetChargesState,
} = chargesSlice.actions;

// Export reducer
export default chargesSlice.reducer;