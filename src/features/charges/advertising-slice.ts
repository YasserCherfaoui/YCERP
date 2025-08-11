// Advertising Redux slice for managing advertising charges and campaigns
import {
    AdvertisingAccount,
    AdvertisingAnalytics,
    AdvertisingCharge,
    CampaignTemplate,
    TargetAudience
} from '@/models/data/charges/advertising.model';
import {
    AdvertisingDashboardData,
    bulkCalculateROI,
    bulkUpdateCampaignStatus,
    calculateROI,
    CampaignPerformanceAnalysis,
    createAdvertisingCharge,
    CreateAdvertisingChargeData,
    createCampaignFromTemplate,
    createTargetAudience,
    deleteAdvertisingCharge,
    exportAdvertisingCharges,
    FetchAdvertisingChargesParams,
    getAdvertisingAccounts,
    getAdvertisingAnalytics,
    getAdvertisingCharge,
    getAdvertisingCharges,
    getAdvertisingDashboard,
    getCampaignPerformanceAnalysis,
    getCampaignTemplates,
    getTargetAudiences,
    importAdvertisingCharges,
    ROICalculationParams,
    ROICalculationResult,
    syncWithPlatform,
    updateAdvertisingCharge,
    UpdateAdvertisingChargeData
} from '@/services/advertising-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// State interface
interface AdvertisingState {
  // Charges data
  charges: AdvertisingCharge[];
  selectedCharge: AdvertisingCharge | null;
  
  // Campaign management
  campaigns: AdvertisingCharge[];
  campaignTemplates: CampaignTemplate[];
  targetAudiences: TargetAudience[];
  
  // Platform accounts
  advertisingAccounts: AdvertisingAccount[];
  
  // Analytics and dashboard
  dashboard: AdvertisingDashboardData | null;
  analytics: AdvertisingAnalytics | null;
  
  // ROI calculations
  roiCalculations: ROICalculationResult[];
  selectedROICalculation: ROICalculationResult | null;
  
  // Performance analysis
  campaignPerformance: CampaignPerformanceAnalysis[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Form state
  formData: Partial<CreateAdvertisingChargeData> | null;
  formErrors: Record<string, string>;
  
  // Filters and pagination
  filters: FetchAdvertisingChargesParams;
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
  
  // Sync status
  syncStatus: {
    syncing: boolean;
    lastSync: string | null;
    syncError: string | null;
  };
}

// Initial state
const initialState: AdvertisingState = {
  charges: [],
  selectedCharge: null,
  campaigns: [],
  campaignTemplates: [],
  targetAudiences: [],
  advertisingAccounts: [],
  dashboard: null,
  analytics: null,
  roiCalculations: [],
  selectedROICalculation: null,
  campaignPerformance: [],
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
  syncStatus: {
    syncing: false,
    lastSync: null,
    syncError: null,
  },
};

// Async thunks

// Fetch advertising charges
export const fetchAdvertisingChargesAsync = createAsyncThunk(
  'advertising/fetchAdvertisingCharges',
  async (params: FetchAdvertisingChargesParams, { rejectWithValue }) => {
    try {
      const response = await getAdvertisingCharges(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch advertising charges');
    }
  }
);

// Get single advertising charge
export const fetchAdvertisingChargeAsync = createAsyncThunk(
  'advertising/fetchAdvertisingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getAdvertisingCharge(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch advertising charge');
    }
  }
);

// Create advertising charge
export const createAdvertisingChargeAsync = createAsyncThunk(
  'advertising/createAdvertisingCharge',
  async (data: CreateAdvertisingChargeData, { rejectWithValue }) => {
    try {
      const response = await createAdvertisingCharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create advertising charge');
    }
  }
);

// Update advertising charge
export const updateAdvertisingChargeAsync = createAsyncThunk(
  'advertising/updateAdvertisingCharge',
  async ({ id, data }: { id: number; data: UpdateAdvertisingChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateAdvertisingCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update advertising charge');
    }
  }
);

// Delete advertising charge
export const deleteAdvertisingChargeAsync = createAsyncThunk(
  'advertising/deleteAdvertisingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAdvertisingCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete advertising charge');
    }
  }
);

// Calculate ROI
export const calculateROIAsync = createAsyncThunk(
  'advertising/calculateROI',
  async (params: ROICalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateROI(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate ROI');
    }
  }
);

// Get campaign performance analysis
export const getCampaignPerformanceAsync = createAsyncThunk(
  'advertising/getCampaignPerformance',
  async (campaignId: string, { rejectWithValue }) => {
    try {
      const response = await getCampaignPerformanceAnalysis(campaignId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get campaign performance');
    }
  }
);

// Get campaign templates
export const fetchCampaignTemplatesAsync = createAsyncThunk(
  'advertising/fetchCampaignTemplates',
  async (params: { platform?: string; active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getCampaignTemplates(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch campaign templates');
    }
  }
);

// Create campaign from template
export const createCampaignFromTemplateAsync = createAsyncThunk(
  'advertising/createCampaignFromTemplate',
  async ({ templateId, data }: { templateId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await createCampaignFromTemplate(templateId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create campaign from template');
    }
  }
);

// Get target audiences
export const fetchTargetAudiencesAsync = createAsyncThunk(
  'advertising/fetchTargetAudiences',
  async (params: { active_only?: boolean; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getTargetAudiences(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch target audiences');
    }
  }
);

// Create target audience
export const createTargetAudienceAsync = createAsyncThunk(
  'advertising/createTargetAudience',
  async (data: Omit<TargetAudience, "ID">, { rejectWithValue }) => {
    try {
      const response = await createTargetAudience(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create target audience');
    }
  }
);

// Get advertising accounts
export const fetchAdvertisingAccountsAsync = createAsyncThunk(
  'advertising/fetchAdvertisingAccounts',
  async (params: { platform?: string; active_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getAdvertisingAccounts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch advertising accounts');
    }
  }
);

// Sync with platform
export const syncWithPlatformAsync = createAsyncThunk(
  'advertising/syncWithPlatform',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const response = await syncWithPlatform(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync with platform');
    }
  }
);

// Get advertising dashboard
export const fetchAdvertisingDashboardAsync = createAsyncThunk(
  'advertising/fetchAdvertisingDashboard',
  async (params: { date_from?: string; date_to?: string; platform?: string; campaign_objective?: string; company_id?: number }, { rejectWithValue }) => {
    try {
      const response = await getAdvertisingDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch advertising dashboard');
    }
  }
);

// Get advertising analytics
export const fetchAdvertisingAnalyticsAsync = createAsyncThunk(
  'advertising/fetchAdvertisingAnalytics',
  async (params: { date_from?: string; date_to?: string; platform?: string; campaign_objective?: string; group_by?: 'day' | 'week' | 'month' | 'campaign' }, { rejectWithValue }) => {
    try {
      const response = await getAdvertisingAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch advertising analytics');
    }
  }
);

// Export advertising charges
export const exportAdvertisingChargesAsync = createAsyncThunk(
  'advertising/exportAdvertisingCharges',
  async (params: FetchAdvertisingChargesParams & { format: 'pdf' | 'excel' | 'csv' | 'json'; include_analytics?: boolean }, { rejectWithValue }) => {
    try {
      const response = await exportAdvertisingCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export advertising charges');
    }
  }
);

// Import advertising charges
export const importAdvertisingChargesAsync = createAsyncThunk(
  'advertising/importAdvertisingCharges',
  async ({ file, options }: { file: File; options?: any }, { rejectWithValue }) => {
    try {
      const response = await importAdvertisingCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import advertising charges');
    }
  }
);

// Bulk update campaign status
export const bulkUpdateCampaignStatusAsync = createAsyncThunk(
  'advertising/bulkUpdateCampaignStatus',
  async (data: { campaign_ids: string[]; status: "active" | "paused" | "cancelled"; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await bulkUpdateCampaignStatus(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk update campaign status');
    }
  }
);

// Bulk calculate ROI
export const bulkCalculateROIAsync = createAsyncThunk(
  'advertising/bulkCalculateROI',
  async (campaignIds: string[], { rejectWithValue }) => {
    try {
      const response = await bulkCalculateROI(campaignIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk calculate ROI');
    }
  }
);

// Create the slice
const advertisingSlice = createSlice({
  name: 'advertising',
  initialState,
  reducers: {
    // Clear state
    clearAdvertisingState: (state) => {
      state.charges = [];
      state.selectedCharge = null;
      state.campaigns = [];
      state.dashboard = null;
      state.analytics = null;
      state.roiCalculations = [];
      state.selectedROICalculation = null;
      state.campaignPerformance = [];
      state.error = null;
    },

    // Set selected charge
    setSelectedCharge: (state, action: PayloadAction<AdvertisingCharge | null>) => {
      state.selectedCharge = action.payload;
    },

    // Set form data
    setFormData: (state, action: PayloadAction<Partial<CreateAdvertisingChargeData> | null>) => {
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
    setFilters: (state, action: PayloadAction<FetchAdvertisingChargesParams>) => {
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

    // Set ROI calculation
    setSelectedROICalculation: (state, action: PayloadAction<ROICalculationResult | null>) => {
      state.selectedROICalculation = action.payload;
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
      // Fetch advertising charges
      .addCase(fetchAdvertisingChargesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingChargesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAdvertisingChargesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get single advertising charge
      .addCase(fetchAdvertisingChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCharge = action.payload;
      })
      .addCase(fetchAdvertisingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create advertising charge
      .addCase(createAdvertisingChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdvertisingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges.unshift(action.payload);
        state.formData = null;
        state.formErrors = {};
      })
      .addCase(createAdvertisingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update advertising charge
      .addCase(updateAdvertisingChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertisingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.charges.findIndex(charge => charge.ID === action.payload.ID);
        if (index !== -1) {
          state.charges[index] = action.payload;
        }
        if (state.selectedCharge?.ID === action.payload.ID) {
          state.selectedCharge = action.payload;
        }
      })
      .addCase(updateAdvertisingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete advertising charge
      .addCase(deleteAdvertisingChargeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertisingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = state.charges.filter(charge => charge.ID !== action.payload);
        if (state.selectedCharge?.ID === action.payload) {
          state.selectedCharge = null;
        }
      })
      .addCase(deleteAdvertisingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Calculate ROI
      .addCase(calculateROIAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateROIAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.roiCalculations.push(action.payload);
        state.selectedROICalculation = action.payload;
      })
      .addCase(calculateROIAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get campaign performance
      .addCase(getCampaignPerformanceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCampaignPerformanceAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.campaignPerformance.push(action.payload);
        }
      })
      .addCase(getCampaignPerformanceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch campaign templates
      .addCase(fetchCampaignTemplatesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignTemplatesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.campaignTemplates = action.payload || [];
      })
      .addCase(fetchCampaignTemplatesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create campaign from template
      .addCase(createCampaignFromTemplateAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaignFromTemplateAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.charges.unshift(action.payload);
        }
      })
      .addCase(createCampaignFromTemplateAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch target audiences
      .addCase(fetchTargetAudiencesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTargetAudiencesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.targetAudiences = action.payload || [];
      })
      .addCase(fetchTargetAudiencesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create target audience
      .addCase(createTargetAudienceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTargetAudienceAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.targetAudiences.push(action.payload);
        }
      })
      .addCase(createTargetAudienceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch advertising accounts
      .addCase(fetchAdvertisingAccountsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingAccountsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisingAccounts = action.payload || [];
      })
      .addCase(fetchAdvertisingAccountsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sync with platform
      .addCase(syncWithPlatformAsync.pending, (state) => {
        state.syncStatus.syncing = true;
        state.syncStatus.syncError = null;
      })
      .addCase(syncWithPlatformAsync.fulfilled, (state, action) => {
        state.syncStatus.syncing = false;
        if (action.payload) {
          state.syncStatus.lastSync = action.payload.last_sync;
        }
      })
      .addCase(syncWithPlatformAsync.rejected, (state, action) => {
        state.syncStatus.syncing = false;
        state.syncStatus.syncError = action.payload as string;
      })

      // Fetch advertising dashboard
      .addCase(fetchAdvertisingDashboardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingDashboardAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload || null;
      })
      .addCase(fetchAdvertisingDashboardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch advertising analytics
      .addCase(fetchAdvertisingAnalyticsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingAnalyticsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload || null;
      })
      .addCase(fetchAdvertisingAnalyticsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Export advertising charges
      .addCase(exportAdvertisingChargesAsync.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportAdvertisingChargesAsync.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportAdvertisingChargesAsync.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload as string;
      })

      // Import advertising charges
      .addCase(importAdvertisingChargesAsync.pending, (state) => {
        state.importLoading = true;
        state.error = null;
      })
      .addCase(importAdvertisingChargesAsync.fulfilled, (state, action) => {
        state.importLoading = false;
        state.importResult = action.payload || null;
      })
      .addCase(importAdvertisingChargesAsync.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload as string;
      })

      // Bulk update campaign status
      .addCase(bulkUpdateCampaignStatusAsync.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
      })
      .addCase(bulkUpdateCampaignStatusAsync.fulfilled, (state) => {
        state.bulkLoading = false;
        state.selectedCharges = [];
      })
      .addCase(bulkUpdateCampaignStatusAsync.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload as string;
      })

      // Bulk calculate ROI
      .addCase(bulkCalculateROIAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCalculateROIAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.roiCalculations = action.payload || [];
      })
      .addCase(bulkCalculateROIAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAdvertisingState,
  setSelectedCharge,
  setFormData,
  setFormErrors,
  clearFormErrors,
  setFilters,
  clearFilters,
  setSelectedCharges,
  toggleChargeSelection,
  clearSelectedCharges,
  setSelectedROICalculation,
  clearError,
  clearBulkError,
  clearImportResult,
} = advertisingSlice.actions;

export default advertisingSlice.reducer; 