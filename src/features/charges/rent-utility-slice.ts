// Rent and utilities Redux slice for managing rent and utility charges
import {
    CostAlert,
    Property,
    RentUtilityCharge,
    UsageAlert,
    UtilityAnalytics,
    UtilityMeter
} from '@/models/data/charges/rent-utility.model';
import {
    bulkCalculateUsage,
    bulkUpdatePaymentStatus,
    calculateUsage,
    createRentUtilityCharge,
    CreateRentUtilityChargeData,
    deleteRentUtilityCharge,
    exportRentUtilityCharges,
    FetchRentUtilityChargesParams,
    getCostAlerts,
    getProperties,
    getRentUtilityCharge,
    getRentUtilityCharges,
    getRentUtilityDashboard,
    getUsageAlerts,
    getUtilityAnalytics,
    getUtilityMeters,
    importRentUtilityCharges,
    RentUtilityDashboardData,
    updateRentUtilityCharge,
    UpdateRentUtilityChargeData,
    UsageCalculationParams,
    UsageCalculationResult
} from '@/services/rent-utility-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// State interface
interface RentUtilityState {
  // Charges data
  charges: RentUtilityCharge[];
  selectedCharge: RentUtilityCharge | null;
  
  // Properties and meters
  properties: Property[];
  utilityMeters: UtilityMeter[];
  
  // Alerts
  usageAlerts: UsageAlert[];
  costAlerts: CostAlert[];
  
  // Analytics and dashboard
  dashboard: RentUtilityDashboardData | null;
  analytics: UtilityAnalytics | null;
  
  // Usage calculations
  usageCalculations: UsageCalculationResult[];
  selectedUsageCalculation: UsageCalculationResult | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Form state
  formData: Partial<CreateRentUtilityChargeData> | null;
  formErrors: Record<string, string>;
  
  // Filters and pagination
  filters: FetchRentUtilityChargesParams;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  
  // Bulk operations
  selectedCharges: number[];
  bulkLoading: boolean;
  bulkError: string | null;
  
  // Export/Import
  exportLoading: boolean;
  importLoading: boolean;
  importResult: { imported_count: number; errors: string[] } | null;
  
  // Calculator state
  calculatorParams: Partial<UsageCalculationParams> | null;
  calculatorResult: UsageCalculationResult | null;
}

// Initial state
const initialState: RentUtilityState = {
  charges: [],
  selectedCharge: null,
  properties: [],
  utilityMeters: [],
  usageAlerts: [],
  costAlerts: [],
  dashboard: null,
  analytics: null,
  usageCalculations: [],
  selectedUsageCalculation: null,
  loading: false,
  error: null,
  formData: null,
  formErrors: {},
  filters: {
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  selectedCharges: [],
  bulkLoading: false,
  bulkError: null,
  exportLoading: false,
  importLoading: false,
  importResult: null,
  calculatorParams: null,
  calculatorResult: null,
};

// Async thunks

// Fetch rent utility charges
export const fetchRentUtilityChargesAsync = createAsyncThunk(
  'rentUtility/fetchRentUtilityCharges',
  async (params: FetchRentUtilityChargesParams, { rejectWithValue }) => {
    try {
      const response = await getRentUtilityCharges(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch rent utility charges');
    }
  }
);

// Get single rent utility charge
export const fetchRentUtilityChargeAsync = createAsyncThunk(
  'rentUtility/fetchRentUtilityCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getRentUtilityCharge(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch rent utility charge');
    }
  }
);

// Create rent utility charge
export const createRentUtilityChargeAsync = createAsyncThunk(
  'rentUtility/createRentUtilityCharge',
  async (data: CreateRentUtilityChargeData, { rejectWithValue }) => {
    try {
      const response = await createRentUtilityCharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create rent utility charge');
    }
  }
);

// Update rent utility charge
export const updateRentUtilityChargeAsync = createAsyncThunk(
  'rentUtility/updateRentUtilityCharge',
  async ({ id, data }: { id: number; data: UpdateRentUtilityChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateRentUtilityCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update rent utility charge');
    }
  }
);

// Delete rent utility charge
export const deleteRentUtilityChargeAsync = createAsyncThunk(
  'rentUtility/deleteRentUtilityCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteRentUtilityCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete rent utility charge');
    }
  }
);

// Calculate usage
export const calculateUsageAsync = createAsyncThunk(
  'rentUtility/calculateUsage',
  async (params: UsageCalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateUsage(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate usage');
    }
  }
);

// Get properties
export const fetchPropertiesAsync = createAsyncThunk(
  'rentUtility/fetchProperties',
  async (params: { active_only?: boolean; property_type?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getProperties(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch properties');
    }
  }
);

// Get utility meters
export const fetchUtilityMetersAsync = createAsyncThunk(
  'rentUtility/fetchUtilityMeters',
  async (params: { property_id?: number; meter_type?: string; active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getUtilityMeters(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch utility meters');
    }
  }
);

// Get usage alerts
export const fetchUsageAlertsAsync = createAsyncThunk(
  'rentUtility/fetchUsageAlerts',
  async (params: { property_id?: number; utility_type?: string; active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getUsageAlerts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch usage alerts');
    }
  }
);

// Get cost alerts
export const fetchCostAlertsAsync = createAsyncThunk(
  'rentUtility/fetchCostAlerts',
  async (params: { property_id?: number; active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getCostAlerts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cost alerts');
    }
  }
);

// Get rent utility dashboard
export const fetchRentUtilityDashboardAsync = createAsyncThunk(
  'rentUtility/fetchRentUtilityDashboard',
  async (params: { date_from?: string; date_to?: string; utility_type?: string; property_id?: number; company_id?: number }, { rejectWithValue }) => {
    try {
      const response = await getRentUtilityDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch rent utility dashboard');
    }
  }
);

// Get utility analytics
export const fetchUtilityAnalyticsAsync = createAsyncThunk(
  'rentUtility/fetchUtilityAnalytics',
  async (params: { property_id: number; date_from?: string; date_to?: string; utility_type?: string }, { rejectWithValue }) => {
    try {
      const response = await getUtilityAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch utility analytics');
    }
  }
);

// Export rent utility charges
export const exportRentUtilityChargesAsync = createAsyncThunk(
  'rentUtility/exportRentUtilityCharges',
  async (params: FetchRentUtilityChargesParams & { format: 'pdf' | 'excel' | 'csv' | 'json'; include_meter_readings?: boolean }, { rejectWithValue }) => {
    try {
      const response = await exportRentUtilityCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export rent utility charges');
    }
  }
);

// Import rent utility charges
export const importRentUtilityChargesAsync = createAsyncThunk(
  'rentUtility/importRentUtilityCharges',
  async ({ file, options }: { file: File; options?: any }, { rejectWithValue }) => {
    try {
      const response = await importRentUtilityCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import rent utility charges');
    }
  }
);

// Bulk update payment status
export const bulkUpdatePaymentStatusAsync = createAsyncThunk(
  'rentUtility/bulkUpdatePaymentStatus',
  async (data: { charge_ids: number[]; payment_status: "paid" | "overdue" | "disputed"; payment_date?: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await bulkUpdatePaymentStatus(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk update payment status');
    }
  }
);

// Bulk calculate usage
export const bulkCalculateUsageAsync = createAsyncThunk(
  'rentUtility/bulkCalculateUsage',
  async (charges: UsageCalculationParams[], { rejectWithValue }) => {
    try {
      const response = await bulkCalculateUsage(charges);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk calculate usage');
    }
  }
);

// Create the slice
const rentUtilitySlice = createSlice({
  name: 'rentUtility',
  initialState,
  reducers: {
    // Clear state
    clearRentUtilityState: (state) => {
      state.charges = [];
      state.selectedCharge = null;
      state.properties = [];
      state.utilityMeters = [];
      state.usageAlerts = [];
      state.costAlerts = [];
      state.dashboard = null;
      state.analytics = null;
      state.usageCalculations = [];
      state.selectedUsageCalculation = null;
      state.error = null;
    },

    // Set selected charge
    setSelectedCharge: (state, action: PayloadAction<RentUtilityCharge | null>) => {
      state.selectedCharge = action.payload;
    },

    // Set form data
    setFormData: (state, action: PayloadAction<Partial<CreateRentUtilityChargeData> | null>) => {
      state.formData = action.payload;
    },

    // Set form errors
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },

    // Clear form errors
    clearFormErrors: (state) => {
      state.formErrors = {};
    },

    // Set filters
    setFilters: (state, action: PayloadAction<FetchRentUtilityChargesParams>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
    },

    // Set selected charges
    setSelectedCharges: (state, action: PayloadAction<number[]>) => {
      state.selectedCharges = action.payload;
    },

    // Toggle charge selection
    toggleChargeSelection: (state, action: PayloadAction<number>) => {
      const chargeId = action.payload;
      const index = state.selectedCharges.indexOf(chargeId);
      if (index > -1) {
        state.selectedCharges.splice(index, 1);
      } else {
        state.selectedCharges.push(chargeId);
      }
    },

    // Clear selected charges
    clearSelectedCharges: (state) => {
      state.selectedCharges = [];
    },

    // Set usage calculation
    setSelectedUsageCalculation: (state, action: PayloadAction<UsageCalculationResult | null>) => {
      state.selectedUsageCalculation = action.payload;
    },

    // Set calculator params
    setCalculatorParams: (state, action: PayloadAction<Partial<UsageCalculationParams> | null>) => {
      state.calculatorParams = action.payload;
    },

    // Set calculator result
    setCalculatorResult: (state, action: PayloadAction<UsageCalculationResult | null>) => {
      state.calculatorResult = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear bulk error
    clearBulkError: (state) => {
      state.bulkError = null;
    },

    // Clear import result
    clearImportResult: (state) => {
      state.importResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rent utility charges
      .addCase(fetchRentUtilityChargesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentUtilityChargesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchRentUtilityChargesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get single rent utility charge
      .addCase(fetchRentUtilityChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentUtilityChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCharge = action.payload;
      })
      .addCase(fetchRentUtilityChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create rent utility charge
      .addCase(createRentUtilityChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRentUtilityChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges.unshift(action.payload);
        state.formData = null;
        state.formErrors = {};
      })
      .addCase(createRentUtilityChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update rent utility charge
      .addCase(updateRentUtilityChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRentUtilityChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.charges.findIndex(charge => charge.ID === action.payload.ID);
        if (index !== -1) {
          state.charges[index] = action.payload;
        }
        if (state.selectedCharge?.ID === action.payload.ID) {
          state.selectedCharge = action.payload;
        }
      })
      .addCase(updateRentUtilityChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete rent utility charge
      .addCase(deleteRentUtilityChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRentUtilityChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = state.charges.filter(charge => charge.ID !== action.payload);
        if (state.selectedCharge?.ID === action.payload) {
          state.selectedCharge = null;
        }
      })
      .addCase(deleteRentUtilityChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Calculate usage
      .addCase(calculateUsageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateUsageAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.usageCalculations.push(action.payload);
        state.selectedUsageCalculation = action.payload;
        state.calculatorResult = action.payload;
      })
      .addCase(calculateUsageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch properties
      .addCase(fetchPropertiesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertiesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchPropertiesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch utility meters
      .addCase(fetchUtilityMetersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUtilityMetersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.utilityMeters = action.payload;
      })
      .addCase(fetchUtilityMetersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch usage alerts
      .addCase(fetchUsageAlertsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsageAlertsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.usageAlerts = action.payload;
      })
      .addCase(fetchUsageAlertsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch cost alerts
      .addCase(fetchCostAlertsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCostAlertsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.costAlerts = action.payload;
      })
      .addCase(fetchCostAlertsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch rent utility dashboard
      .addCase(fetchRentUtilityDashboardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentUtilityDashboardAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchRentUtilityDashboardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch utility analytics
      .addCase(fetchUtilityAnalyticsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUtilityAnalyticsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchUtilityAnalyticsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Export rent utility charges
      .addCase(exportRentUtilityChargesAsync.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportRentUtilityChargesAsync.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportRentUtilityChargesAsync.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload as string;
      })

      // Import rent utility charges
      .addCase(importRentUtilityChargesAsync.pending, (state) => {
        state.importLoading = true;
        state.error = null;
      })
      .addCase(importRentUtilityChargesAsync.fulfilled, (state, action) => {
        state.importLoading = false;
        state.importResult = action.payload;
      })
      .addCase(importRentUtilityChargesAsync.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload as string;
      })

      // Bulk update payment status
      .addCase(bulkUpdatePaymentStatusAsync.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
      })
      .addCase(bulkUpdatePaymentStatusAsync.fulfilled, (state, action) => {
        state.bulkLoading = false;
        state.selectedCharges = [];
      })
      .addCase(bulkUpdatePaymentStatusAsync.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload as string;
      })

      // Bulk calculate usage
      .addCase(bulkCalculateUsageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCalculateUsageAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.usageCalculations = action.payload;
      })
      .addCase(bulkCalculateUsageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearRentUtilityState,
  setSelectedCharge,
  setFormData,
  setFormErrors,
  clearFormErrors,
  setFilters,
  clearFilters,
  setSelectedCharges,
  toggleChargeSelection,
  clearSelectedCharges,
  setSelectedUsageCalculation,
  setCalculatorParams,
  setCalculatorResult,
  clearError,
  clearBulkError,
  clearImportResult,
} = rentUtilitySlice.actions;

export default rentUtilitySlice.reducer; 