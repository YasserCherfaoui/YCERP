// Redux slice for boxing charges
import {
  BoxingCharge,
  MaterialUsageAnalytics,
  PackagingBatch,
  PackagingMaterial,
  PackagingTemplate
} from '@/models/data/charges/boxing.model';
import {
  BoxingCostCalculationParams,
  BoxingCostCalculationResult,
  BoxingDashboardData,
  BoxingDashboardParams,
  calculateBatchPackagingCosts,
  calculateBoxingCosts,
  completeBatchProcessing,
  CreateBatchData,
  createBoxingCharge,
  CreateBoxingChargeData,
  CreateMaterialData,
  createPackagingBatch,
  createPackagingMaterial,
  createPackagingTemplate,
  deleteBoxingCharge,
  deletePackagingMaterial,
  exportBoxingCharges,
  FetchBoxingChargesParams,
  getBoxingCharge,
  getBoxingCharges,
  getBoxingDashboard,
  getMaterialUsageAnalytics,
  getPackagingBatches,
  getPackagingMaterial,
  getPackagingMaterials,
  getPackagingTemplates,
  importBoxingCharges,
  startBatchProcessing,
  submitQualityCheck,
  updateBatchProgress,
  updateBoxingCharge,
  UpdateBoxingChargeData,
  UpdateMaterialData,
  updatePackagingMaterial,
} from '@/services/boxing-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Filters and form interfaces
export interface BoxingFilters {
  product_id?: number;
  packaging_type?: "standard" | "custom" | "gift" | "bulk" | "fragile";
  packaging_size?: "small" | "medium" | "large" | "extra_large" | "custom";
  batch_id?: string;
  packaging_date_from?: string;
  packaging_date_to?: string;
  quality_check_passed?: boolean;
  search?: string;
  sort_by?: "packaging_date" | "batch_size" | "total_cost" | "cost_per_item" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface MaterialFilters {
  material_type?: string;
  low_stock_only?: boolean;
  search?: string;
}

export interface BoxingFormData extends CreateBoxingChargeData {}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Main boxing state interface
export interface BoxingState {
  // Data
  boxingCharges: BoxingCharge[];
  selectedBoxingCharge: BoxingCharge | null;
  packagingMaterials: PackagingMaterial[];
  selectedMaterial: PackagingMaterial | null;
  packagingTemplates: PackagingTemplate[];
  packagingBatches: PackagingBatch[];
  selectedBatch: PackagingBatch | null;
  materialUsageAnalytics: MaterialUsageAnalytics[];
  
  // UI State
  loading: boolean;
  error: string | null;
  materialsLoading: boolean;
  templatesLoading: boolean;
  batchesLoading: boolean;
  analyticsLoading: boolean;
  
  // Calculator state
  calculator: {
    params: BoxingCostCalculationParams | null;
    result: BoxingCostCalculationResult | null;
    loading: boolean;
    error: string | null;
  };
  
  // Material requirements calculation
  materialRequirements: {
    requirements: BoxingCostCalculationResult | null;
    loading: boolean;
    error: string | null;
  };
  
  // Dashboard data
  dashboard: {
    data: BoxingDashboardData | null;
    loading: boolean;
    error: string | null;
  };
  

  
  // Filters and pagination
  filters: BoxingFilters;
  materialFilters: MaterialFilters;
  pagination: PaginationState;
  materialPagination: PaginationState;
  batchPagination: PaginationState;
  
  // Form state
  formData: BoxingFormData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Material form state
  materialFormData: CreateMaterialData | null;
  materialFormErrors: Record<string, string>;
  isMaterialSubmitting: boolean;
  
  // Batch form state
  batchFormData: CreateBatchData | null;
  batchFormErrors: Record<string, string>;
  isBatchSubmitting: boolean;
  
  // Selected items for bulk operations
  selectedBoxingChargeIds: number[];
  selectedMaterialIds: number[];
  
  // Import/Export state
  importExport: {
    importing: boolean;
    exporting: boolean;
    importResult: any | null;
    exportResult: any | null;
    error: string | null;
  };
}

const initialState: BoxingState = {
  // Data
  boxingCharges: [],
  selectedBoxingCharge: null,
  packagingMaterials: [],
  selectedMaterial: null,
  packagingTemplates: [],
  packagingBatches: [],
  selectedBatch: null,
  materialUsageAnalytics: [],
  
  // UI State
  loading: false,
  error: null,
  materialsLoading: false,
  templatesLoading: false,
  batchesLoading: false,
  analyticsLoading: false,
  
  // Calculator state
  calculator: {
    params: null,
    result: null,
    loading: false,
    error: null,
  },
  
  // Material requirements
  materialRequirements: {
    requirements: null,
    loading: false,
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
  materialFilters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  materialPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  batchPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // Material form state
  materialFormData: null,
  materialFormErrors: {},
  isMaterialSubmitting: false,
  
  // Batch form state
  batchFormData: null,
  batchFormErrors: {},
  isBatchSubmitting: false,
  
  // Selected items
  selectedBoxingChargeIds: [],
  selectedMaterialIds: [],
  
  // Import/Export
  importExport: {
    importing: false,
    exporting: false,
    importResult: null,
    exportResult: null,
    error: null,
  },
};

// Async thunks

// Boxing Charges
export const fetchBoxingCharges = createAsyncThunk(
  'boxing/fetchBoxingCharges',
  async (params: FetchBoxingChargesParams, { rejectWithValue }) => {
    try {
      const response = await getBoxingCharges(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch boxing charges');
    }
  }
);

export const fetchBoxingCharge = createAsyncThunk(
  'boxing/fetchBoxingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getBoxingCharge(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch boxing charge');
    }
  }
);

export const createBoxingChargeAsync = createAsyncThunk(
  'boxing/createBoxingCharge',
  async (data: CreateBoxingChargeData, { rejectWithValue }) => {
    try {
      const response = await createBoxingCharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create boxing charge');
    }
  }
);

export const updateBoxingChargeAsync = createAsyncThunk(
  'boxing/updateBoxingCharge',
  async ({ id, data }: { id: number; data: UpdateBoxingChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateBoxingCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update boxing charge');
    }
  }
);

export const deleteBoxingChargeAsync = createAsyncThunk(
  'boxing/deleteBoxingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteBoxingCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete boxing charge');
    }
  }
);

// Cost Calculations
export const calculateBoxingCostsAsync = createAsyncThunk(
  'boxing/calculateBoxingCosts',
  async (params: BoxingCostCalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateBoxingCosts(params);
      return { params, result: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate boxing costs');
    }
  }
);

export const calculateMaterialRequirementsAsync = createAsyncThunk(
  'boxing/calculateMaterialRequirements',
  async (params: {
    batch_size: number;
    material_type: string;
    labor_hours?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await calculateBatchPackagingCosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate material requirements');
    }
  }
);

// Materials
export const fetchPackagingMaterials = createAsyncThunk(
  'boxing/fetchPackagingMaterials',
  async (params: {
    limit?: number;
    offset?: number;
    material_type?: string;
    low_stock_only?: boolean;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getPackagingMaterials(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch packaging materials');
    }
  }
);

export const fetchPackagingMaterial = createAsyncThunk(
  'boxing/fetchPackagingMaterial',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getPackagingMaterial(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch packaging material');
    }
  }
);

export const createPackagingMaterialAsync = createAsyncThunk(
  'boxing/createPackagingMaterial',
  async (data: CreateMaterialData, { rejectWithValue }) => {
    try {
      const response = await createPackagingMaterial(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create packaging material');
    }
  }
);

export const updatePackagingMaterialAsync = createAsyncThunk(
  'boxing/updatePackagingMaterial',
  async ({ id, data }: { id: number; data: UpdateMaterialData }, { rejectWithValue }) => {
    try {
      const response = await updatePackagingMaterial(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update packaging material');
    }
  }
);

export const deletePackagingMaterialAsync = createAsyncThunk(
  'boxing/deletePackagingMaterial',
  async (id: number, { rejectWithValue }) => {
    try {
      await deletePackagingMaterial(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete packaging material');
    }
  }
);

// Templates
export const fetchPackagingTemplates = createAsyncThunk(
  'boxing/fetchPackagingTemplates',
  async (params: {
    limit?: number;
    offset?: number;
    product_category?: string;
    active_only?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getPackagingTemplates(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch packaging templates');
    }
  }
);

export const createPackagingTemplateAsync = createAsyncThunk(
  'boxing/createPackagingTemplate',
  async (data: Omit<PackagingTemplate, "ID">, { rejectWithValue }) => {
    try {
      const response = await createPackagingTemplate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create packaging template');
    }
  }
);

// Batches
export const fetchPackagingBatches = createAsyncThunk(
  'boxing/fetchPackagingBatches',
  async (params: {
    limit?: number;
    offset?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getPackagingBatches(params);
      return {
        batches: response.data?.data || [],
        pagination: response.data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        }
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch packaging batches');
    }
  }
);

export const createPackagingBatchAsync = createAsyncThunk(
  'boxing/createPackagingBatch',
  async (data: CreateBatchData, { rejectWithValue }) => {
    try {
      const response = await createPackagingBatch(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create packaging batch');
    }
  }
);

export const startBatchProcessingAsync = createAsyncThunk(
  'boxing/startBatchProcessing',
  async (batchId: string, { rejectWithValue }) => {
    try {
      const response = await startBatchProcessing(batchId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start batch processing');
    }
  }
);

export const completeBatchProcessingAsync = createAsyncThunk(
  'boxing/completeBatchProcessing',
  async ({ batchId, data }: { 
    batchId: string; 
    data: {
      actual_duration: number;
      quality_notes?: string;
      defect_count: number;
      rework_count: number;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await completeBatchProcessing(batchId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to complete batch processing');
    }
  }
);

export const updateBatchProgressAsync = createAsyncThunk(
  'boxing/updateBatchProgress',
  async ({ batchId, data }: { 
    batchId: string; 
    data: {
      completed_items: Array<{
        product_id: number;
        product_variant_id?: number;
        completed_quantity: number;
      }>;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await updateBatchProgress(batchId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update batch progress');
    }
  }
);

// Analytics
export const fetchBoxingDashboard = createAsyncThunk(
  'boxing/fetchBoxingDashboard',
  async (params: BoxingDashboardParams, { rejectWithValue }) => {
    try {
      const response = await getBoxingDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch boxing dashboard');
    }
  }
);

export const fetchMaterialUsageAnalytics = createAsyncThunk(
  'boxing/fetchMaterialUsageAnalytics',
  async (params: {
    material_id?: number;
    date_from?: string;
    date_to?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await getMaterialUsageAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch material usage analytics');
    }
  }
);



// Quality Control
export const submitQualityCheckAsync = createAsyncThunk(
  'boxing/submitQualityCheck',
  async ({ boxingChargeId, data }: { 
    boxingChargeId: number; 
    data: {
      quality_check_passed: boolean;
      quality_notes?: string;
      defect_rate?: number;
      rework_required: boolean;
      inspector_id: number;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await submitQualityCheck(boxingChargeId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit quality check');
    }
  }
);

// Import/Export
export const exportBoxingChargesAsync = createAsyncThunk(
  'boxing/exportBoxingCharges',
  async (params: FetchBoxingChargesParams & {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    include_materials?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await exportBoxingCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export boxing charges');
    }
  }
);

export const importBoxingChargesAsync = createAsyncThunk(
  'boxing/importBoxingCharges',
  async ({ file, options }: {
    file: File;
    options?: {
      skip_duplicates?: boolean;
      auto_calculate_costs?: boolean;
      default_packaging_type?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await importBoxingCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import boxing charges');
    }
  }
);

// Boxing slice
const boxingSlice = createSlice({
  name: 'boxing',
  initialState,
  reducers: {
    // UI actions
    clearError: (state) => {
      state.error = null;
      state.calculator.error = null;
      state.materialRequirements.error = null;
      state.dashboard.error = null;

      state.importExport.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSelectedBoxingCharge: (state, action: PayloadAction<BoxingCharge | null>) => {
      state.selectedBoxingCharge = action.payload;
    },
    
    setSelectedMaterial: (state, action: PayloadAction<PackagingMaterial | null>) => {
      state.selectedMaterial = action.payload;
    },
    
    setSelectedBatch: (state, action: PayloadAction<PackagingBatch | null>) => {
      state.selectedBatch = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<BoxingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        sort_by: "created_at",
        sort_order: "desc",
      };
    },
    
    setMaterialFilters: (state, action: PayloadAction<Partial<MaterialFilters>>) => {
      state.materialFilters = { ...state.materialFilters, ...action.payload };
    },
    
    clearMaterialFilters: (state) => {
      state.materialFilters = {};
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setMaterialPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.materialPagination = { ...state.materialPagination, ...action.payload };
    },
    
    setBatchPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.batchPagination = { ...state.batchPagination, ...action.payload };
    },
    
    // Form management
    setFormData: (state, action: PayloadAction<BoxingFormData | null>) => {
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
    
    // Material form management
    setMaterialFormData: (state, action: PayloadAction<CreateMaterialData | null>) => {
      state.materialFormData = action.payload;
    },
    
    setMaterialFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.materialFormErrors = action.payload;
    },
    
    clearMaterialFormData: (state) => {
      state.materialFormData = null;
      state.materialFormErrors = {};
      state.isMaterialSubmitting = false;
    },
    
    // Batch form management
    setBatchFormData: (state, action: PayloadAction<CreateBatchData | null>) => {
      state.batchFormData = action.payload;
    },
    
    setBatchFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.batchFormErrors = action.payload;
    },
    
    clearBatchFormData: (state) => {
      state.batchFormData = null;
      state.batchFormErrors = {};
      state.isBatchSubmitting = false;
    },
    
    // Selection management
    setSelectedBoxingChargeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedBoxingChargeIds = action.payload;
    },
    
    toggleBoxingChargeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedBoxingChargeIds.indexOf(id);
      if (index === -1) {
        state.selectedBoxingChargeIds.push(id);
      } else {
        state.selectedBoxingChargeIds.splice(index, 1);
      }
    },
    
    clearBoxingChargeSelection: (state) => {
      state.selectedBoxingChargeIds = [];
    },
    
    setSelectedMaterialIds: (state, action: PayloadAction<number[]>) => {
      state.selectedMaterialIds = action.payload;
    },
    
    toggleMaterialSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedMaterialIds.indexOf(id);
      if (index === -1) {
        state.selectedMaterialIds.push(id);
      } else {
        state.selectedMaterialIds.splice(index, 1);
      }
    },
    
    clearMaterialSelection: (state) => {
      state.selectedMaterialIds = [];
    },
    
    // Calculator
    clearCalculatorResult: (state) => {
      state.calculator.result = null;
      state.calculator.params = null;
      state.calculator.error = null;
    },
    
    clearMaterialRequirements: (state) => {
      state.materialRequirements.requirements = null;
      state.materialRequirements.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch boxing charges
    builder
      .addCase(fetchBoxingCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoxingCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.boxingCharges = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            total: action.payload.pagination.total,
            pages: action.payload.pagination.pages,
          };
        }
      })
      .addCase(fetchBoxingCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single boxing charge
    builder
      .addCase(fetchBoxingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoxingCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBoxingCharge = action.payload || null;
      })
      .addCase(fetchBoxingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create boxing charge
    builder
      .addCase(createBoxingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(createBoxingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.boxingCharges.unshift(action.payload);
        }
        state.formData = null;
      })
      .addCase(createBoxingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update boxing charge
    builder
      .addCase(updateBoxingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(updateBoxingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          const index = state.boxingCharges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.boxingCharges[index] = action.payload;
          }
          if (state.selectedBoxingCharge?.ID === action.payload?.ID) {
            state.selectedBoxingCharge = action.payload;
          }
        }
      })
      .addCase(updateBoxingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete boxing charge
    builder
      .addCase(deleteBoxingChargeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBoxingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.boxingCharges = state.boxingCharges.filter(c => c.ID !== action.payload);
        if (state.selectedBoxingCharge?.ID === action.payload) {
          state.selectedBoxingCharge = null;
        }
      })
      .addCase(deleteBoxingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Calculate boxing costs
    builder
      .addCase(calculateBoxingCostsAsync.pending, (state) => {
        state.calculator.loading = true;
        state.calculator.error = null;
      })
      .addCase(calculateBoxingCostsAsync.fulfilled, (state, action) => {
        state.calculator.loading = false;
        if (action.payload) {
          state.calculator.params = action.payload.params;
          state.calculator.result = action.payload.result || null;
        }
      })
      .addCase(calculateBoxingCostsAsync.rejected, (state, action) => {
        state.calculator.loading = false;
        state.calculator.error = action.payload as string;
      });

    // Calculate material requirements
    builder
      .addCase(calculateMaterialRequirementsAsync.pending, (state) => {
        state.materialRequirements.loading = true;
        state.materialRequirements.error = null;
      })
      .addCase(calculateMaterialRequirementsAsync.fulfilled, (state, action) => {
        state.materialRequirements.loading = false;
        state.materialRequirements.requirements = action.payload || null;
      })
      .addCase(calculateMaterialRequirementsAsync.rejected, (state, action) => {
        state.materialRequirements.loading = false;
        state.materialRequirements.error = action.payload as string;
      });

    // Packaging materials
    builder
      .addCase(fetchPackagingMaterials.pending, (state) => {
        state.materialsLoading = true;
      })
      .addCase(fetchPackagingMaterials.fulfilled, (state, action) => {
        state.materialsLoading = false;
        state.packagingMaterials = action.payload.data || [];
      })
      .addCase(fetchPackagingMaterials.rejected, (state, action) => {
        state.materialsLoading = false;
        state.error = action.payload as string;
      });

    // Create material
    builder
      .addCase(createPackagingMaterialAsync.pending, (state) => {
        state.isMaterialSubmitting = true;
        state.materialFormErrors = {};
      })
      .addCase(createPackagingMaterialAsync.fulfilled, (state, action) => {
        state.isMaterialSubmitting = false;
        if (action.payload) {
          state.packagingMaterials.unshift(action.payload);
        }
        state.materialFormData = null;
      })
      .addCase(createPackagingMaterialAsync.rejected, (state, action) => {
        state.isMaterialSubmitting = false;
        state.error = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchBoxingDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchBoxingDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload || null;
      })
      .addCase(fetchBoxingDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload as string;
      });

    // Templates
    builder
      .addCase(fetchPackagingTemplates.pending, (state) => {
        state.templatesLoading = true;
      })
      .addCase(fetchPackagingTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.packagingTemplates = action.payload || [];
      })
      .addCase(fetchPackagingTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.error = action.payload as string;
      });

    // Batches
    builder
      .addCase(fetchPackagingBatches.pending, (state) => {
        state.batchesLoading = true;
      })
      .addCase(fetchPackagingBatches.fulfilled, (state, action) => {
        state.batchesLoading = false;
        state.packagingBatches = action.payload.batches || [];
        if (action.payload.pagination) {
          state.batchPagination = {
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            total: action.payload.pagination.total,
            pages: action.payload.pagination.pages,
          };
        }
      })
      .addCase(fetchPackagingBatches.rejected, (state, action) => {
        state.batchesLoading = false;
        state.error = action.payload as string;
      });

    // Material usage analytics
    builder
      .addCase(fetchMaterialUsageAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchMaterialUsageAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.materialUsageAnalytics = action.payload || [];
      })
      .addCase(fetchMaterialUsageAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });



    // Import/Export
    builder
      .addCase(exportBoxingChargesAsync.pending, (state) => {
        state.importExport.exporting = true;
        state.importExport.error = null;
      })
      .addCase(exportBoxingChargesAsync.fulfilled, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.exportResult = action.payload;
      })
      .addCase(exportBoxingChargesAsync.rejected, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.error = action.payload as string;
      });

    builder
      .addCase(importBoxingChargesAsync.pending, (state) => {
        state.importExport.importing = true;
        state.importExport.error = null;
      })
      .addCase(importBoxingChargesAsync.fulfilled, (state, action) => {
        state.importExport.importing = false;
        state.importExport.importResult = action.payload;
      })
      .addCase(importBoxingChargesAsync.rejected, (state, action) => {
        state.importExport.importing = false;
        state.importExport.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  setSelectedBoxingCharge,
  setSelectedMaterial,
  setSelectedBatch,
  setFilters,
  clearFilters,
  setMaterialFilters,
  clearMaterialFilters,
  setPagination,
  setMaterialPagination,
  setBatchPagination,
  setFormData,
  setFormErrors,
  clearFormData,
  setMaterialFormData,
  setMaterialFormErrors,
  clearMaterialFormData,
  setBatchFormData,
  setBatchFormErrors,
  clearBatchFormData,
  setSelectedBoxingChargeIds,
  toggleBoxingChargeSelection,
  clearBoxingChargeSelection,
  setSelectedMaterialIds,
  toggleMaterialSelection,
  clearMaterialSelection,
  clearCalculatorResult,
  clearMaterialRequirements,
} = boxingSlice.actions;

export default boxingSlice.reducer;