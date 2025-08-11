// Redux slice for returns charges
import {
    ReturnAnalytics,
    ReturnPolicy,
    ReturnsCharge,
    YalidineReturnEvent
} from '@/models/data/charges/returns.model';
import {
    bulkApproveReturns,
    bulkProcessRefunds,
    calculateReturnCosts,
    completeInspection,
    createReturnPolicy,
    CreateReturnPolicyData,
    createReturnsCharge,
    CreateReturnsChargeData,
    createYalidineReturn,
    deleteReturnsCharge,
    exportReturnsCharges,
    FetchReturnsChargesParams,
    getFraudDetectionInsights,
    getRefundEstimate,
    getReturnAnalytics,
    getReturnPolicies,
    getReturnsCharge,
    getReturnsCharges,
    getReturnsDashboard,
    getVendorClaimStatus,
    getYalidineReturnEvents,
    importReturnsCharges,
    processRefund,
    ReturnCostCalculationParams,
    ReturnCostCalculationResult,
    ReturnsDashboardData,
    ReturnsDashboardParams,
    submitVendorClaim,
    syncWithYalidine,
    updateReturnPolicy,
    updateReturnsCharge,
    UpdateReturnsChargeData,
    updateReturnStatus,
} from '@/services/returns-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Filters and form interfaces
export interface ReturnsFilters {
  order_id?: number;
  original_sale_id?: number;
  customer_id?: number;
  return_reason?: "defective" | "wrong_item" | "not_as_described" | "customer_changed_mind" | "damaged_in_shipping" | "late_delivery" | "other";
  return_method?: "pickup" | "drop_off" | "mail" | "in_store";
  current_status?: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
  resolution_type?: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
  condition_assessment?: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
  return_initiated_from?: string;
  return_initiated_to?: string;
  return_received_from?: string;
  return_received_to?: string;
  customer_name?: string;
  yalidine_return_id?: string;
  vendor_responsible?: boolean;
  requires_manual_review?: boolean;
  search?: string;
  sort_by?: "return_initiated_date" | "return_received_date" | "total_return_value" | "net_loss" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface PolicyFilters {
  company_id?: number;
  active_only?: boolean;
  effective_date?: string;
}

export interface ReturnsFormData extends CreateReturnsChargeData {}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Main returns state interface
export interface ReturnsState {
  // Data
  returnsCharges: ReturnsCharge[];
  selectedReturnsCharge: ReturnsCharge | null;
  returnPolicies: ReturnPolicy[];
  selectedPolicy: ReturnPolicy | null;
  yalidineEvents: YalidineReturnEvent[];
  
  // UI State
  loading: boolean;
  error: string | null;
  policiesLoading: boolean;
  eventsLoading: boolean;
  analyticsLoading: boolean;
  
  // Cost calculator state
  calculator: {
    params: ReturnCostCalculationParams | null;
    result: ReturnCostCalculationResult | null;
    loading: boolean;
    error: string | null;
  };
  
  // Refund estimation
  refundEstimation: {
    estimate: any | null;
    loading: boolean;
    error: string | null;
  };
  
  // Dashboard data
  dashboard: {
    data: ReturnsDashboardData | null;
    loading: boolean;
    error: string | null;
  };
  
  // Analytics
  analytics: {
    data: ReturnAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  
  // Fraud detection
  fraudDetection: {
    insights: any | null;
    loading: boolean;
    error: string | null;
  };
  
  // Inspection workflow
  inspection: {
    currentReturn: ReturnsCharge | null;
    inspectionData: any | null;
    submitting: boolean;
    error: string | null;
  };
  
  // Refund processing
  refundProcessing: {
    currentReturn: ReturnsCharge | null;
    refundData: any | null;
    processing: boolean;
    error: string | null;
  };
  
  // Vendor claims
  vendorClaims: {
    claims: Record<number, any>; // return_id -> claim
    submitting: Record<number, boolean>;
    error: string | null;
  };
  
  // Yalidine integration
  yalidineIntegration: {
    syncing: boolean;
    creating: boolean;
    error: string | null;
  };
  
  // Filters and pagination
  filters: ReturnsFilters;
  policyFilters: PolicyFilters;
  pagination: PaginationState;
  policyPagination: PaginationState;
  
  // Form state
  formData: ReturnsFormData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Policy form state
  policyFormData: CreateReturnPolicyData | null;
  policyFormErrors: Record<string, string>;
  isPolicySubmitting: boolean;
  
  // Selected items for bulk operations
  selectedReturnsChargeIds: number[];
  
  // Import/Export state
  importExport: {
    importing: boolean;
    exporting: boolean;
    importResult: any | null;
    exportResult: any | null;
    error: string | null;
  };
  
  // Bulk operations
  bulkOperations: {
    approving: boolean;
    refunding: boolean;
    result: any | null;
    error: string | null;
  };
}

const initialState: ReturnsState = {
  // Data
  returnsCharges: [],
  selectedReturnsCharge: null,
  returnPolicies: [],
  selectedPolicy: null,
  yalidineEvents: [],
  
  // UI State
  loading: false,
  error: null,
  policiesLoading: false,
  eventsLoading: false,
  analyticsLoading: false,
  
  // Calculator state
  calculator: {
    params: null,
    result: null,
    loading: false,
    error: null,
  },
  
  // Refund estimation
  refundEstimation: {
    estimate: null,
    loading: false,
    error: null,
  },
  
  // Dashboard data
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Analytics
  analytics: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Fraud detection
  fraudDetection: {
    insights: null,
    loading: false,
    error: null,
  },
  
  // Inspection workflow
  inspection: {
    currentReturn: null,
    inspectionData: null,
    submitting: false,
    error: null,
  },
  
  // Refund processing
  refundProcessing: {
    currentReturn: null,
    refundData: null,
    processing: false,
    error: null,
  },
  
  // Vendor claims
  vendorClaims: {
    claims: {},
    submitting: {},
    error: null,
  },
  
  // Yalidine integration
  yalidineIntegration: {
    syncing: false,
    creating: false,
    error: null,
  },
  
  // Filters and pagination
  filters: {
    sort_by: "created_at",
    sort_order: "desc",
  },
  policyFilters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  policyPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // Policy form state
  policyFormData: null,
  policyFormErrors: {},
  isPolicySubmitting: false,
  
  // Selected items
  selectedReturnsChargeIds: [],
  
  // Import/Export
  importExport: {
    importing: false,
    exporting: false,
    importResult: null,
    exportResult: null,
    error: null,
  },
  
  // Bulk operations
  bulkOperations: {
    approving: false,
    refunding: false,
    result: null,
    error: null,
  },
};

// Async thunks

// Returns Charges
export const fetchReturnsCharges = createAsyncThunk(
  'returns/fetchReturnsCharges',
  async (params: FetchReturnsChargesParams, { rejectWithValue }) => {
    try {
      const response = await getReturnsCharges(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch returns charges');
    }
  }
);

export const fetchReturnsCharge = createAsyncThunk(
  'returns/fetchReturnsCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getReturnsCharge(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch returns charge');
    }
  }
);

export const createReturnsChargeAsync = createAsyncThunk(
  'returns/createReturnsCharge',
  async (data: CreateReturnsChargeData, { rejectWithValue }) => {
    try {
      const response = await createReturnsCharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create returns charge');
    }
  }
);

export const updateReturnsChargeAsync = createAsyncThunk(
  'returns/updateReturnsCharge',
  async ({ id, data }: { id: number; data: UpdateReturnsChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateReturnsCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update returns charge');
    }
  }
);

export const deleteReturnsChargeAsync = createAsyncThunk(
  'returns/deleteReturnsCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteReturnsCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete returns charge');
    }
  }
);

// Cost Calculations
export const calculateReturnCostsAsync = createAsyncThunk(
  'returns/calculateReturnCosts',
  async (params: ReturnCostCalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateReturnCosts(params);
      return { params, result: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate return costs');
    }
  }
);

export const getRefundEstimateAsync = createAsyncThunk(
  'returns/getRefundEstimate',
  async (params: {
    order_id: number;
    returned_items: Array<{
      product_id: number;
      quantity: number;
    }>;
    return_reason: string;
  }, { rejectWithValue }) => {
    try {
      const response = await getRefundEstimate(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get refund estimate');
    }
  }
);

// Status and Processing
export const updateReturnStatusAsync = createAsyncThunk(
  'returns/updateReturnStatus',
  async ({ id, data }: { 
    id: number; 
    data: {
      status: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
      description?: string;
      location?: string;
      photos?: string[];
      internal_notes?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await updateReturnStatus(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update return status');
    }
  }
);

export const completeInspectionAsync = createAsyncThunk(
  'returns/completeInspection',
  async ({ id, data }: { 
    id: number; 
    data: {
      condition_assessment: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
      inspection_notes: string;
      quality_photos?: string[];
      item_conditions: Array<{
        returned_item_id: number;
        condition: string;
        condition_notes?: string;
        resolution: "refund" | "exchange" | "repair" | "keep";
        resolution_value: number;
      }>;
      vendor_responsible: boolean;
      vendor_claim_amount?: number;
      return_to_inventory: boolean;
      new_inventory_status?: "sellable" | "refurbished" | "damaged" | "disposed";
    }
  }, { rejectWithValue }) => {
    try {
      const response = await completeInspection(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to complete inspection');
    }
  }
);

export const processRefundAsync = createAsyncThunk(
  'returns/processRefund',
  async ({ id, data }: { 
    id: number; 
    data: {
      refund_amount: number;
      refund_method: "original_payment" | "store_credit" | "bank_transfer" | "check";
      notes?: string;
      partial_refund_reason?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await processRefund(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process refund');
    }
  }
);

// Policy Management
export const fetchReturnPolicies = createAsyncThunk(
  'returns/fetchReturnPolicies',
  async (params: {
    company_id?: number;
    active_only?: boolean;
    effective_date?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getReturnPolicies(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch return policies');
    }
  }
);

export const createReturnPolicyAsync = createAsyncThunk(
  'returns/createReturnPolicy',
  async (data: CreateReturnPolicyData, { rejectWithValue }) => {
    try {
      const response = await createReturnPolicy(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create return policy');
    }
  }
);

export const updateReturnPolicyAsync = createAsyncThunk(
  'returns/updateReturnPolicy',
  async ({ id, data }: { id: number; data: Partial<CreateReturnPolicyData> }, { rejectWithValue }) => {
    try {
      const response = await updateReturnPolicy(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update return policy');
    }
  }
);

// Yalidine Integration
export const fetchYalidineReturnEvents = createAsyncThunk(
  'returns/fetchYalidineReturnEvents',
  async (params: {
    yalidine_tracking_id?: string;
    event_type?: string;
    date_from?: string;
    date_to?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getYalidineReturnEvents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch yalidine return events');
    }
  }
);

export const syncWithYalidineAsync = createAsyncThunk(
  'returns/syncWithYalidine',
  async (yalidineReturnId: string, { rejectWithValue }) => {
    try {
      const response = await syncWithYalidine(yalidineReturnId);
      return { yalidineReturnId, events: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync with yalidine');
    }
  }
);

export const createYalidineReturnAsync = createAsyncThunk(
  'returns/createYalidineReturn',
  async (data: {
    order_id: number;
    return_reason: string;
    pickup_address: string;
    return_address: string;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
  }, { rejectWithValue }) => {
    try {
      const response = await createYalidineReturn(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create yalidine return');
    }
  }
);

// Analytics
export const fetchReturnsDashboard = createAsyncThunk(
  'returns/fetchReturnsDashboard',
  async (params: ReturnsDashboardParams, { rejectWithValue }) => {
    try {
      const response = await getReturnsDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch returns dashboard');
    }
  }
);

export const fetchReturnAnalytics = createAsyncThunk(
  'returns/fetchReturnAnalytics',
  async (params: {
    date_from?: string;
    date_to?: string;
    return_reason?: string;
    group_by?: 'day' | 'week' | 'month';
  }, { rejectWithValue }) => {
    try {
      const response = await getReturnAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch return analytics');
    }
  }
);

export const fetchFraudDetectionInsights = createAsyncThunk(
  'returns/fetchFraudDetectionInsights',
  async (params: {
    date_from?: string;
    date_to?: string;
    risk_threshold?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await getFraudDetectionInsights(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch fraud detection insights');
    }
  }
);

// Vendor Claims
export const submitVendorClaimAsync = createAsyncThunk(
  'returns/submitVendorClaim',
  async ({ returnId, data }: {
    returnId: number;
    data: {
      vendor_id: number;
      claim_amount: number;
      claim_reason: string;
      supporting_documents?: string[];
      expected_resolution_date?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await submitVendorClaim(returnId, data);
      return { returnId, claim: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit vendor claim');
    }
  }
);

export const getVendorClaimStatusAsync = createAsyncThunk(
  'returns/getVendorClaimStatus',
  async (claimId: string, { rejectWithValue }) => {
    try {
      const response = await getVendorClaimStatus(claimId);
      return { claimId, status: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get vendor claim status');
    }
  }
);

// Import/Export
export const exportReturnsChargesAsync = createAsyncThunk(
  'returns/exportReturnsCharges',
  async (params: FetchReturnsChargesParams & {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    include_items?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await exportReturnsCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export returns charges');
    }
  }
);

export const importReturnsChargesAsync = createAsyncThunk(
  'returns/importReturnsCharges',
  async ({ file, options }: {
    file: File;
    options?: {
      skip_duplicates?: boolean;
      auto_calculate_costs?: boolean;
      default_policy_id?: number;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await importReturnsCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import returns charges');
    }
  }
);

// Bulk Operations
export const bulkApproveReturnsAsync = createAsyncThunk(
  'returns/bulkApproveReturns',
  async (data: {
    return_ids: number[];
    resolution_type: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bulkApproveReturns(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk approve returns');
    }
  }
);

export const bulkProcessRefundsAsync = createAsyncThunk(
  'returns/bulkProcessRefunds',
  async (data: {
    return_ids: number[];
    refund_method: "original_payment" | "store_credit" | "bank_transfer" | "check";
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bulkProcessRefunds(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk process refunds');
    }
  }
);

// Returns slice
const returnsSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    // UI actions
    clearError: (state) => {
      state.error = null;
      state.calculator.error = null;
      state.refundEstimation.error = null;
      state.dashboard.error = null;
      state.analytics.error = null;
      state.fraudDetection.error = null;
      state.inspection.error = null;
      state.refundProcessing.error = null;
      state.vendorClaims.error = null;
      state.yalidineIntegration.error = null;
      state.importExport.error = null;
      state.bulkOperations.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSelectedReturnsCharge: (state, action: PayloadAction<ReturnsCharge | null>) => {
      state.selectedReturnsCharge = action.payload;
    },
    
    setSelectedPolicy: (state, action: PayloadAction<ReturnPolicy | null>) => {
      state.selectedPolicy = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<ReturnsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        sort_by: "created_at",
        sort_order: "desc",
      };
    },
    
    setPolicyFilters: (state, action: PayloadAction<Partial<PolicyFilters>>) => {
      state.policyFilters = { ...state.policyFilters, ...action.payload };
    },
    
    clearPolicyFilters: (state) => {
      state.policyFilters = {};
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setPolicyPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.policyPagination = { ...state.policyPagination, ...action.payload };
    },
    
    // Form management
    setFormData: (state, action: PayloadAction<ReturnsFormData | null>) => {
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
    
    // Policy form management
    setPolicyFormData: (state, action: PayloadAction<CreateReturnPolicyData | null>) => {
      state.policyFormData = action.payload;
    },
    
    setPolicyFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.policyFormErrors = action.payload;
    },
    
    clearPolicyFormData: (state) => {
      state.policyFormData = null;
      state.policyFormErrors = {};
      state.isPolicySubmitting = false;
    },
    
    // Selection management
    setSelectedReturnsChargeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedReturnsChargeIds = action.payload;
    },
    
    toggleReturnsChargeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedReturnsChargeIds.indexOf(id);
      if (index === -1) {
        state.selectedReturnsChargeIds.push(id);
      } else {
        state.selectedReturnsChargeIds.splice(index, 1);
      }
    },
    
    clearReturnsChargeSelection: (state) => {
      state.selectedReturnsChargeIds = [];
    },
    
    // Workflow management
    setInspectionCurrentReturn: (state, action: PayloadAction<ReturnsCharge | null>) => {
      state.inspection.currentReturn = action.payload;
    },
    
    setRefundProcessingCurrentReturn: (state, action: PayloadAction<ReturnsCharge | null>) => {
      state.refundProcessing.currentReturn = action.payload;
    },
    
    // Calculator
    clearCalculatorResult: (state) => {
      state.calculator.result = null;
      state.calculator.params = null;
      state.calculator.error = null;
    },
    
    clearRefundEstimate: (state) => {
      state.refundEstimation.estimate = null;
      state.refundEstimation.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch returns charges
    builder
      .addCase(fetchReturnsCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnsCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.returnsCharges = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            total: action.payload.pagination.total,
            pages: action.payload.pagination.pages,
          };
        }
      })
      .addCase(fetchReturnsCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single returns charge
    builder
      .addCase(fetchReturnsCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnsCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReturnsCharge = action.payload;
      })
      .addCase(fetchReturnsCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create returns charge
    builder
      .addCase(createReturnsChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(createReturnsChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.returnsCharges.unshift(action.payload);
        state.formData = null;
      })
      .addCase(createReturnsChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update returns charge
    builder
      .addCase(updateReturnsChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(updateReturnsChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.returnsCharges.findIndex(c => c.ID === action.payload.ID);
        if (index !== -1) {
          state.returnsCharges[index] = action.payload;
        }
        if (state.selectedReturnsCharge?.ID === action.payload.ID) {
          state.selectedReturnsCharge = action.payload;
        }
      })
      .addCase(updateReturnsChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete returns charge
    builder
      .addCase(deleteReturnsChargeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReturnsChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.returnsCharges = state.returnsCharges.filter(c => c.ID !== action.payload);
        if (state.selectedReturnsCharge?.ID === action.payload) {
          state.selectedReturnsCharge = null;
        }
      })
      .addCase(deleteReturnsChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Calculate return costs
    builder
      .addCase(calculateReturnCostsAsync.pending, (state) => {
        state.calculator.loading = true;
        state.calculator.error = null;
      })
      .addCase(calculateReturnCostsAsync.fulfilled, (state, action) => {
        state.calculator.loading = false;
        state.calculator.params = action.payload.params;
        state.calculator.result = action.payload.result;
      })
      .addCase(calculateReturnCostsAsync.rejected, (state, action) => {
        state.calculator.loading = false;
        state.calculator.error = action.payload as string;
      });

    // Get refund estimate
    builder
      .addCase(getRefundEstimateAsync.pending, (state) => {
        state.refundEstimation.loading = true;
        state.refundEstimation.error = null;
      })
      .addCase(getRefundEstimateAsync.fulfilled, (state, action) => {
        state.refundEstimation.loading = false;
        state.refundEstimation.estimate = action.payload;
      })
      .addCase(getRefundEstimateAsync.rejected, (state, action) => {
        state.refundEstimation.loading = false;
        state.refundEstimation.error = action.payload as string;
      });

    // Return policies
    builder
      .addCase(fetchReturnPolicies.pending, (state) => {
        state.policiesLoading = true;
      })
      .addCase(fetchReturnPolicies.fulfilled, (state, action) => {
        state.policiesLoading = false;
        state.returnPolicies = action.payload.data || [];
      })
      .addCase(fetchReturnPolicies.rejected, (state, action) => {
        state.policiesLoading = false;
        state.error = action.payload as string;
      });

    // Create policy
    builder
      .addCase(createReturnPolicyAsync.pending, (state) => {
        state.isPolicySubmitting = true;
        state.policyFormErrors = {};
      })
      .addCase(createReturnPolicyAsync.fulfilled, (state, action) => {
        state.isPolicySubmitting = false;
        state.returnPolicies.unshift(action.payload);
        state.policyFormData = null;
      })
      .addCase(createReturnPolicyAsync.rejected, (state, action) => {
        state.isPolicySubmitting = false;
        state.error = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchReturnsDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchReturnsDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchReturnsDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload as string;
      });

    // Analytics
    builder
      .addCase(fetchReturnAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchReturnAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics.data = action.payload;
      })
      .addCase(fetchReturnAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analytics.error = action.payload as string;
      });

    // Fraud detection
    builder
      .addCase(fetchFraudDetectionInsights.pending, (state) => {
        state.fraudDetection.loading = true;
        state.fraudDetection.error = null;
      })
      .addCase(fetchFraudDetectionInsights.fulfilled, (state, action) => {
        state.fraudDetection.loading = false;
        state.fraudDetection.insights = action.payload;
      })
      .addCase(fetchFraudDetectionInsights.rejected, (state, action) => {
        state.fraudDetection.loading = false;
        state.fraudDetection.error = action.payload as string;
      });

    // Inspection workflow
    builder
      .addCase(completeInspectionAsync.pending, (state) => {
        state.inspection.submitting = true;
        state.inspection.error = null;
      })
      .addCase(completeInspectionAsync.fulfilled, (state, action) => {
        state.inspection.submitting = false;
        // Update the return in the list
        const index = state.returnsCharges.findIndex(c => c.ID === action.payload.ID);
        if (index !== -1) {
          state.returnsCharges[index] = action.payload;
        }
        if (state.selectedReturnsCharge?.ID === action.payload.ID) {
          state.selectedReturnsCharge = action.payload;
        }
        state.inspection.currentReturn = null;
      })
      .addCase(completeInspectionAsync.rejected, (state, action) => {
        state.inspection.submitting = false;
        state.inspection.error = action.payload as string;
      });

    // Refund processing
    builder
      .addCase(processRefundAsync.pending, (state) => {
        state.refundProcessing.processing = true;
        state.refundProcessing.error = null;
      })
      .addCase(processRefundAsync.fulfilled, (state, action) => {
        state.refundProcessing.processing = false;
        // Update the return in the list
        const index = state.returnsCharges.findIndex(c => c.ID === action.payload.ID);
        if (index !== -1) {
          state.returnsCharges[index] = action.payload;
        }
        if (state.selectedReturnsCharge?.ID === action.payload.ID) {
          state.selectedReturnsCharge = action.payload;
        }
        state.refundProcessing.currentReturn = null;
      })
      .addCase(processRefundAsync.rejected, (state, action) => {
        state.refundProcessing.processing = false;
        state.refundProcessing.error = action.payload as string;
      });

    // Yalidine events
    builder
      .addCase(fetchYalidineReturnEvents.pending, (state) => {
        state.eventsLoading = true;
      })
      .addCase(fetchYalidineReturnEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.yalidineEvents = action.payload;
      })
      .addCase(fetchYalidineReturnEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.error = action.payload as string;
      });

    // Yalidine sync
    builder
      .addCase(syncWithYalidineAsync.pending, (state) => {
        state.yalidineIntegration.syncing = true;
        state.yalidineIntegration.error = null;
      })
      .addCase(syncWithYalidineAsync.fulfilled, (state, action) => {
        state.yalidineIntegration.syncing = false;
        // Update events
        state.yalidineEvents = [...state.yalidineEvents, ...action.payload.events];
      })
      .addCase(syncWithYalidineAsync.rejected, (state, action) => {
        state.yalidineIntegration.syncing = false;
        state.yalidineIntegration.error = action.payload as string;
      });

    // Vendor claims
    builder
      .addCase(submitVendorClaimAsync.pending, (state, action) => {
        const returnId = action.meta.arg.returnId;
        state.vendorClaims.submitting[returnId] = true;
        state.vendorClaims.error = null;
      })
      .addCase(submitVendorClaimAsync.fulfilled, (state, action) => {
        const { returnId, claim } = action.payload;
        state.vendorClaims.submitting[returnId] = false;
        state.vendorClaims.claims[returnId] = claim;
      })
      .addCase(submitVendorClaimAsync.rejected, (state, action) => {
        const returnId = action.meta.arg.returnId;
        state.vendorClaims.submitting[returnId] = false;
        state.vendorClaims.error = action.payload as string;
      });

    // Import/Export
    builder
      .addCase(exportReturnsChargesAsync.pending, (state) => {
        state.importExport.exporting = true;
        state.importExport.error = null;
      })
      .addCase(exportReturnsChargesAsync.fulfilled, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.exportResult = action.payload;
      })
      .addCase(exportReturnsChargesAsync.rejected, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.error = action.payload as string;
      });

    builder
      .addCase(importReturnsChargesAsync.pending, (state) => {
        state.importExport.importing = true;
        state.importExport.error = null;
      })
      .addCase(importReturnsChargesAsync.fulfilled, (state, action) => {
        state.importExport.importing = false;
        state.importExport.importResult = action.payload;
      })
      .addCase(importReturnsChargesAsync.rejected, (state, action) => {
        state.importExport.importing = false;
        state.importExport.error = action.payload as string;
      });

    // Bulk operations
    builder
      .addCase(bulkApproveReturnsAsync.pending, (state) => {
        state.bulkOperations.approving = true;
        state.bulkOperations.error = null;
      })
      .addCase(bulkApproveReturnsAsync.fulfilled, (state, action) => {
        state.bulkOperations.approving = false;
        state.bulkOperations.result = action.payload;
      })
      .addCase(bulkApproveReturnsAsync.rejected, (state, action) => {
        state.bulkOperations.approving = false;
        state.bulkOperations.error = action.payload as string;
      });

    builder
      .addCase(bulkProcessRefundsAsync.pending, (state) => {
        state.bulkOperations.refunding = true;
        state.bulkOperations.error = null;
      })
      .addCase(bulkProcessRefundsAsync.fulfilled, (state, action) => {
        state.bulkOperations.refunding = false;
        state.bulkOperations.result = action.payload;
      })
      .addCase(bulkProcessRefundsAsync.rejected, (state, action) => {
        state.bulkOperations.refunding = false;
        state.bulkOperations.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  setSelectedReturnsCharge,
  setSelectedPolicy,
  setFilters,
  clearFilters,
  setPolicyFilters,
  clearPolicyFilters,
  setPagination,
  setPolicyPagination,
  setFormData,
  setFormErrors,
  clearFormData,
  setPolicyFormData,
  setPolicyFormErrors,
  clearPolicyFormData,
  setSelectedReturnsChargeIds,
  toggleReturnsChargeSelection,
  clearReturnsChargeSelection,
  setInspectionCurrentReturn,
  setRefundProcessingCurrentReturn,
  clearCalculatorResult,
  clearRefundEstimate,
} = returnsSlice.actions;

export default returnsSlice.reducer;