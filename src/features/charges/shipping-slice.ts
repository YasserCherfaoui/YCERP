// Redux slice for shipping charges
import {
    DeliveryZone,
    FuelSurcharge,
    ProviderPerformance,
    ShippingAnalytics,
    ShippingCharge,
    ShippingRate
} from '@/models/data/charges/shipping.model';
import {
    bulkCalculateShippingCosts,
    bulkUpdateShipmentStatus,
    calculateShippingCosts,
    createDeliveryZone,
    createFuelSurcharge,
    CreateRateData,
    createShippingCharge,
    CreateShippingChargeData,
    createShippingRate,
    CreateZoneData,
    deleteShippingCharge,
    exportShippingCharges,
    FetchShippingChargesParams,
    getDeliveryZones,
    getFuelSurcharges,
    getProviderApiStatus,
    getProviderPerformanceComparison,
    getShippingAnalytics,
    getShippingCharge,
    getShippingCharges,
    getShippingDashboard,
    getShippingRates,
    getShippingRatesForRoute,
    getTrackingUpdates,
    importShippingCharges,
    ShippingCostCalculationParams,
    ShippingCostCalculationResult,
    ShippingDashboardData,
    ShippingDashboardParams,
    syncAllShipmentsWithProvider,
    syncWithProvider,
    TrackingUpdateData,
    updateShipmentStatus,
    updateShippingCharge,
    UpdateShippingChargeData,
    updateShippingRate,
} from '@/services/shipping-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Filters and form interfaces
export interface ShippingFilters {
  order_id?: number;
  delivery_company_id?: number;
  shipping_method?: "standard" | "express" | "overnight" | "same_day" | "pickup";
  current_status?: "pending" | "picked_up" | "in_transit" | "delivered" | "returned" | "lost" | "damaged";
  origin_city?: string;
  destination_city?: string;
  zone_category?: "local" | "regional" | "national" | "international";
  pickup_date_from?: string;
  pickup_date_to?: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  tracking_number?: string;
  provider_name?: string;
  search?: string;
  sort_by?: "pickup_date" | "delivery_date" | "total_cost" | "weight" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface RateFilters {
  provider_id?: number;
  service_type?: string;
  origin_zone?: string;
  destination_zone?: string;
  active_only?: boolean;
}

export interface ZoneFilters {
  type?: string;
  active_only?: boolean;
  search?: string;
}

export interface ShippingFormData extends CreateShippingChargeData {}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Main shipping state interface
export interface ShippingState {
  // Data
  shippingCharges: ShippingCharge[];
  selectedShippingCharge: ShippingCharge | null;
  shippingRates: ShippingRate[];
  selectedRate: ShippingRate | null;
  deliveryZones: DeliveryZone[];
  selectedZone: DeliveryZone | null;
  fuelSurcharges: FuelSurcharge[];
  providerPerformance: ProviderPerformance[];
  
  // UI State
  loading: boolean;
  error: string | null;
  ratesLoading: boolean;
  zonesLoading: boolean;
  surchargesLoading: boolean;
  analyticsLoading: boolean;
  
  // Cost calculator state
  calculator: {
    params: ShippingCostCalculationParams | null;
    result: ShippingCostCalculationResult | null;
    availableRates: ShippingRate[];
    loading: boolean;
    error: string | null;
  };
  
  // Route rates
  routeRates: {
    rates: ShippingRate[];
    loading: boolean;
    error: string | null;
  };
  
  // Dashboard data
  dashboard: {
    data: ShippingDashboardData | null;
    loading: boolean;
    error: string | null;
  };
  
  // Analytics
  analytics: {
    data: ShippingAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  
  // Tracking
  tracking: {
    updates: Record<string, any[]>; // tracking_number -> updates
    loading: Record<string, boolean>;
    error: string | null;
  };
  
  // Provider status
  providerStatus: {
    statuses: Record<number, any>; // provider_id -> status
    loading: boolean;
    error: string | null;
  };
  
  // Filters and pagination
  filters: ShippingFilters;
  rateFilters: RateFilters;
  zoneFilters: ZoneFilters;
  pagination: PaginationState;
  ratePagination: PaginationState;
  zonePagination: PaginationState;
  
  // Form state
  formData: ShippingFormData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Rate form state
  rateFormData: CreateRateData | null;
  rateFormErrors: Record<string, string>;
  isRateSubmitting: boolean;
  
  // Zone form state
  zoneFormData: CreateZoneData | null;
  zoneFormErrors: Record<string, string>;
  isZoneSubmitting: boolean;
  
  // Selected items for bulk operations
  selectedShippingChargeIds: number[];
  selectedRateIds: number[];
  
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
    updating: boolean;
    calculating: boolean;
    syncing: boolean;
    result: any | null;
    error: string | null;
  };
}

const initialState: ShippingState = {
  // Data
  shippingCharges: [],
  selectedShippingCharge: null,
  shippingRates: [],
  selectedRate: null,
  deliveryZones: [],
  selectedZone: null,
  fuelSurcharges: [],
  providerPerformance: [],
  
  // UI State
  loading: false,
  error: null,
  ratesLoading: false,
  zonesLoading: false,
  surchargesLoading: false,
  analyticsLoading: false,
  
  // Calculator state
  calculator: {
    params: null,
    result: null,
    availableRates: [],
    loading: false,
    error: null,
  },
  
  // Route rates
  routeRates: {
    rates: [],
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
  
  // Tracking
  tracking: {
    updates: {},
    loading: {},
    error: null,
  },
  
  // Provider status
  providerStatus: {
    statuses: {},
    loading: false,
    error: null,
  },
  
  // Filters and pagination
  filters: {
    sort_by: "created_at",
    sort_order: "desc",
  },
  rateFilters: {},
  zoneFilters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  ratePagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  zonePagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // Rate form state
  rateFormData: null,
  rateFormErrors: {},
  isRateSubmitting: false,
  
  // Zone form state
  zoneFormData: null,
  zoneFormErrors: {},
  isZoneSubmitting: false,
  
  // Selected items
  selectedShippingChargeIds: [],
  selectedRateIds: [],
  
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
    updating: false,
    calculating: false,
    syncing: false,
    result: null,
    error: null,
  },
};

// Async thunks

// Shipping Charges
export const fetchShippingCharges = createAsyncThunk(
  'shipping/fetchShippingCharges',
  async (params: FetchShippingChargesParams, { rejectWithValue }) => {
    try {
      const response = await getShippingCharges(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch shipping charges');
    }
  }
);

export const fetchShippingCharge = createAsyncThunk(
  'shipping/fetchShippingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getShippingCharge(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch shipping charge');
    }
  }
);

export const createShippingChargeAsync = createAsyncThunk(
  'shipping/createShippingCharge',
  async (data: CreateShippingChargeData, { rejectWithValue }) => {
    try {
      const response = await createShippingCharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create shipping charge');
    }
  }
);

export const updateShippingChargeAsync = createAsyncThunk(
  'shipping/updateShippingCharge',
  async ({ id, data }: { id: number; data: UpdateShippingChargeData }, { rejectWithValue }) => {
    try {
      const response = await updateShippingCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update shipping charge');
    }
  }
);

export const deleteShippingChargeAsync = createAsyncThunk(
  'shipping/deleteShippingCharge',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteShippingCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete shipping charge');
    }
  }
);

// Cost Calculations
export const calculateShippingCostsAsync = createAsyncThunk(
  'shipping/calculateShippingCosts',
  async (params: ShippingCostCalculationParams, { rejectWithValue }) => {
    try {
      const response = await calculateShippingCosts(params);
      return { params, result: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to calculate shipping costs');
    }
  }
);

export const getRouteRatesAsync = createAsyncThunk(
  'shipping/getRouteRates',
  async (params: {
    origin_zone: string;
    destination_zone: string;
    service_type?: string;
    provider_id?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await getShippingRatesForRoute(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get route rates');
    }
  }
);

// Rates
export const fetchShippingRates = createAsyncThunk(
  'shipping/fetchShippingRates',
  async (params: {
    limit?: number;
    offset?: number;
    provider_id?: number;
    service_type?: string;
    origin_zone?: string;
    destination_zone?: string;
    active_only?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getShippingRates(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch shipping rates');
    }
  }
);

export const createShippingRateAsync = createAsyncThunk(
  'shipping/createShippingRate',
  async (data: CreateRateData, { rejectWithValue }) => {
    try {
      const response = await createShippingRate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create shipping rate');
    }
  }
);

export const updateShippingRateAsync = createAsyncThunk(
  'shipping/updateShippingRate',
  async ({ id, data }: { id: number; data: Partial<CreateRateData> }, { rejectWithValue }) => {
    try {
      const response = await updateShippingRate(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update shipping rate');
    }
  }
);

// Zones
export const fetchDeliveryZones = createAsyncThunk(
  'shipping/fetchDeliveryZones',
  async (params: {
    limit?: number;
    offset?: number;
    type?: string;
    active_only?: boolean;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getDeliveryZones(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch delivery zones');
    }
  }
);

export const createDeliveryZoneAsync = createAsyncThunk(
  'shipping/createDeliveryZone',
  async (data: CreateZoneData, { rejectWithValue }) => {
    try {
      const response = await createDeliveryZone(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create delivery zone');
    }
  }
);

// Status and Tracking
export const updateShipmentStatusAsync = createAsyncThunk(
  'shipping/updateShipmentStatus',
  async ({ id, data }: { id: number; data: TrackingUpdateData }, { rejectWithValue }) => {
    try {
      const response = await updateShipmentStatus(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update shipment status');
    }
  }
);

export const getTrackingUpdatesAsync = createAsyncThunk(
  'shipping/getTrackingUpdates',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await getTrackingUpdates(trackingNumber);
      return { trackingNumber, updates: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get tracking updates');
    }
  }
);

export const syncWithProviderAsync = createAsyncThunk(
  'shipping/syncWithProvider',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await syncWithProvider(trackingNumber);
      return { trackingNumber, updates: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync with provider');
    }
  }
);

// Fuel Surcharges
export const fetchFuelSurcharges = createAsyncThunk(
  'shipping/fetchFuelSurcharges',
  async (params: {
    provider_id?: number;
    active_only?: boolean;
    effective_date?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await getFuelSurcharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch fuel surcharges');
    }
  }
);

export const createFuelSurchargeAsync = createAsyncThunk(
  'shipping/createFuelSurcharge',
  async (data: Omit<FuelSurcharge, "ID">, { rejectWithValue }) => {
    try {
      const response = await createFuelSurcharge(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create fuel surcharge');
    }
  }
);

// Analytics
export const fetchShippingDashboard = createAsyncThunk(
  'shipping/fetchShippingDashboard',
  async (params: ShippingDashboardParams, { rejectWithValue }) => {
    try {
      const response = await getShippingDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch shipping dashboard');
    }
  }
);

export const fetchShippingAnalytics = createAsyncThunk(
  'shipping/fetchShippingAnalytics',
  async (params: {
    date_from?: string;
    date_to?: string;
    provider_id?: number;
    zone_category?: string;
    group_by?: 'day' | 'week' | 'month';
  }, { rejectWithValue }) => {
    try {
      const response = await getShippingAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch shipping analytics');
    }
  }
);

export const fetchProviderPerformanceAsync = createAsyncThunk(
  'shipping/fetchProviderPerformance',
  async (params: {
    date_from?: string;
    date_to?: string;
    zone_category?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await getProviderPerformanceComparison(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch provider performance');
    }
  }
);

// Provider Status
export const getProviderApiStatusAsync = createAsyncThunk(
  'shipping/getProviderApiStatus',
  async (providerId: number, { rejectWithValue }) => {
    try {
      const response = await getProviderApiStatus(providerId);
      return { providerId, status: response.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get provider API status');
    }
  }
);

// Import/Export
export const exportShippingChargesAsync = createAsyncThunk(
  'shipping/exportShippingCharges',
  async (params: FetchShippingChargesParams & {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    include_tracking?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await exportShippingCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to export shipping charges');
    }
  }
);

export const importShippingChargesAsync = createAsyncThunk(
  'shipping/importShippingCharges',
  async ({ file, options }: {
    file: File;
    options?: {
      skip_duplicates?: boolean;
      auto_calculate_costs?: boolean;
      default_provider?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await importShippingCharges(file, options);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import shipping charges');
    }
  }
);

// Bulk Operations
export const bulkUpdateShipmentStatusAsync = createAsyncThunk(
  'shipping/bulkUpdateShipmentStatus',
  async (data: {
    shipment_ids: number[];
    status: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bulkUpdateShipmentStatus(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk update shipment status');
    }
  }
);

export const bulkCalculateShippingCostsAsync = createAsyncThunk(
  'shipping/bulkCalculateShippingCosts',
  async (shipments: ShippingCostCalculationParams[], { rejectWithValue }) => {
    try {
      const response = await bulkCalculateShippingCosts(shipments);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk calculate shipping costs');
    }
  }
);

export const syncAllShipmentsWithProviderAsync = createAsyncThunk(
  'shipping/syncAllShipmentsWithProvider',
  async (providerId: number, { rejectWithValue }) => {
    try {
      const response = await syncAllShipmentsWithProvider(providerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync all shipments with provider');
    }
  }
);

// Shipping slice
const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    // UI actions
    clearError: (state) => {
      state.error = null;
      state.calculator.error = null;
      state.routeRates.error = null;
      state.dashboard.error = null;
      state.analytics.error = null;
      state.tracking.error = null;
      state.providerStatus.error = null;
      state.importExport.error = null;
      state.bulkOperations.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSelectedShippingCharge: (state, action: PayloadAction<ShippingCharge | null>) => {
      state.selectedShippingCharge = action.payload;
    },
    
    setSelectedRate: (state, action: PayloadAction<ShippingRate | null>) => {
      state.selectedRate = action.payload;
    },
    
    setSelectedZone: (state, action: PayloadAction<DeliveryZone | null>) => {
      state.selectedZone = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<ShippingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        sort_by: "created_at",
        sort_order: "desc",
      };
    },
    
    setRateFilters: (state, action: PayloadAction<Partial<RateFilters>>) => {
      state.rateFilters = { ...state.rateFilters, ...action.payload };
    },
    
    clearRateFilters: (state) => {
      state.rateFilters = {};
    },
    
    setZoneFilters: (state, action: PayloadAction<Partial<ZoneFilters>>) => {
      state.zoneFilters = { ...state.zoneFilters, ...action.payload };
    },
    
    clearZoneFilters: (state) => {
      state.zoneFilters = {};
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setRatePagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.ratePagination = { ...state.ratePagination, ...action.payload };
    },
    
    setZonePagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.zonePagination = { ...state.zonePagination, ...action.payload };
    },
    
    // Form management
    setFormData: (state, action: PayloadAction<ShippingFormData | null>) => {
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
    
    // Rate form management
    setRateFormData: (state, action: PayloadAction<CreateRateData | null>) => {
      state.rateFormData = action.payload;
    },
    
    setRateFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.rateFormErrors = action.payload;
    },
    
    clearRateFormData: (state) => {
      state.rateFormData = null;
      state.rateFormErrors = {};
      state.isRateSubmitting = false;
    },
    
    // Zone form management
    setZoneFormData: (state, action: PayloadAction<CreateZoneData | null>) => {
      state.zoneFormData = action.payload;
    },
    
    setZoneFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.zoneFormErrors = action.payload;
    },
    
    clearZoneFormData: (state) => {
      state.zoneFormData = null;
      state.zoneFormErrors = {};
      state.isZoneSubmitting = false;
    },
    
    // Selection management
    setSelectedShippingChargeIds: (state, action: PayloadAction<number[]>) => {
      state.selectedShippingChargeIds = action.payload;
    },
    
    toggleShippingChargeSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedShippingChargeIds.indexOf(id);
      if (index === -1) {
        state.selectedShippingChargeIds.push(id);
      } else {
        state.selectedShippingChargeIds.splice(index, 1);
      }
    },
    
    clearShippingChargeSelection: (state) => {
      state.selectedShippingChargeIds = [];
    },
    
    setSelectedRateIds: (state, action: PayloadAction<number[]>) => {
      state.selectedRateIds = action.payload;
    },
    
    toggleRateSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const index = state.selectedRateIds.indexOf(id);
      if (index === -1) {
        state.selectedRateIds.push(id);
      } else {
        state.selectedRateIds.splice(index, 1);
      }
    },
    
    clearRateSelection: (state) => {
      state.selectedRateIds = [];
    },
    
    // Calculator
    clearCalculatorResult: (state) => {
      state.calculator.result = null;
      state.calculator.params = null;
      state.calculator.error = null;
    },
    
    clearRouteRates: (state) => {
      state.routeRates.rates = [];
      state.routeRates.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch shipping charges
    builder
      .addCase(fetchShippingCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingCharges = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            total: action.payload.pagination.total,
            pages: action.payload.pagination.pages,
          };
        }
      })
      .addCase(fetchShippingCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single shipping charge
    builder
      .addCase(fetchShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedShippingCharge = action.payload;
      })
      .addCase(fetchShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create shipping charge
    builder
      .addCase(createShippingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(createShippingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.shippingCharges.unshift(action.payload);
        state.formData = null;
      })
      .addCase(createShippingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update shipping charge
    builder
      .addCase(updateShippingChargeAsync.pending, (state) => {
        state.isSubmitting = true;
        state.formErrors = {};
      })
      .addCase(updateShippingChargeAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.shippingCharges.findIndex(c => c.ID === action.payload.ID);
        if (index !== -1) {
          state.shippingCharges[index] = action.payload;
        }
        if (state.selectedShippingCharge?.ID === action.payload.ID) {
          state.selectedShippingCharge = action.payload;
        }
      })
      .addCase(updateShippingChargeAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete shipping charge
    builder
      .addCase(deleteShippingChargeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteShippingChargeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingCharges = state.shippingCharges.filter(c => c.ID !== action.payload);
        if (state.selectedShippingCharge?.ID === action.payload) {
          state.selectedShippingCharge = null;
        }
      })
      .addCase(deleteShippingChargeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Calculate shipping costs
    builder
      .addCase(calculateShippingCostsAsync.pending, (state) => {
        state.calculator.loading = true;
        state.calculator.error = null;
      })
      .addCase(calculateShippingCostsAsync.fulfilled, (state, action) => {
        state.calculator.loading = false;
        state.calculator.params = action.payload.params;
        state.calculator.result = action.payload.result;
      })
      .addCase(calculateShippingCostsAsync.rejected, (state, action) => {
        state.calculator.loading = false;
        state.calculator.error = action.payload as string;
      });

    // Get route rates
    builder
      .addCase(getRouteRatesAsync.pending, (state) => {
        state.routeRates.loading = true;
        state.routeRates.error = null;
      })
      .addCase(getRouteRatesAsync.fulfilled, (state, action) => {
        state.routeRates.loading = false;
        state.routeRates.rates = action.payload;
      })
      .addCase(getRouteRatesAsync.rejected, (state, action) => {
        state.routeRates.loading = false;
        state.routeRates.error = action.payload as string;
      });

    // Shipping rates
    builder
      .addCase(fetchShippingRates.pending, (state) => {
        state.ratesLoading = true;
      })
      .addCase(fetchShippingRates.fulfilled, (state, action) => {
        state.ratesLoading = false;
        state.shippingRates = action.payload.data || [];
      })
      .addCase(fetchShippingRates.rejected, (state, action) => {
        state.ratesLoading = false;
        state.error = action.payload as string;
      });

    // Create rate
    builder
      .addCase(createShippingRateAsync.pending, (state) => {
        state.isRateSubmitting = true;
        state.rateFormErrors = {};
      })
      .addCase(createShippingRateAsync.fulfilled, (state, action) => {
        state.isRateSubmitting = false;
        state.shippingRates.unshift(action.payload);
        state.rateFormData = null;
      })
      .addCase(createShippingRateAsync.rejected, (state, action) => {
        state.isRateSubmitting = false;
        state.error = action.payload as string;
      });

    // Delivery zones
    builder
      .addCase(fetchDeliveryZones.pending, (state) => {
        state.zonesLoading = true;
      })
      .addCase(fetchDeliveryZones.fulfilled, (state, action) => {
        state.zonesLoading = false;
        state.deliveryZones = action.payload.data || [];
      })
      .addCase(fetchDeliveryZones.rejected, (state, action) => {
        state.zonesLoading = false;
        state.error = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchShippingDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchShippingDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchShippingDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload as string;
      });

    // Analytics
    builder
      .addCase(fetchShippingAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchShippingAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics.data = action.payload;
      })
      .addCase(fetchShippingAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analytics.error = action.payload as string;
      });

    // Provider performance
    builder
      .addCase(fetchProviderPerformanceAsync.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchProviderPerformanceAsync.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.providerPerformance = action.payload;
      })
      .addCase(fetchProviderPerformanceAsync.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });

    // Tracking updates
    builder
      .addCase(getTrackingUpdatesAsync.pending, (state, action) => {
        const trackingNumber = action.meta.arg;
        state.tracking.loading[trackingNumber] = true;
        state.tracking.error = null;
      })
      .addCase(getTrackingUpdatesAsync.fulfilled, (state, action) => {
        const { trackingNumber, updates } = action.payload;
        state.tracking.loading[trackingNumber] = false;
        state.tracking.updates[trackingNumber] = updates;
      })
      .addCase(getTrackingUpdatesAsync.rejected, (state, action) => {
        const trackingNumber = action.meta.arg;
        state.tracking.loading[trackingNumber] = false;
        state.tracking.error = action.payload as string;
      });

    // Import/Export
    builder
      .addCase(exportShippingChargesAsync.pending, (state) => {
        state.importExport.exporting = true;
        state.importExport.error = null;
      })
      .addCase(exportShippingChargesAsync.fulfilled, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.exportResult = action.payload;
      })
      .addCase(exportShippingChargesAsync.rejected, (state, action) => {
        state.importExport.exporting = false;
        state.importExport.error = action.payload as string;
      });

    builder
      .addCase(importShippingChargesAsync.pending, (state) => {
        state.importExport.importing = true;
        state.importExport.error = null;
      })
      .addCase(importShippingChargesAsync.fulfilled, (state, action) => {
        state.importExport.importing = false;
        state.importExport.importResult = action.payload;
      })
      .addCase(importShippingChargesAsync.rejected, (state, action) => {
        state.importExport.importing = false;
        state.importExport.error = action.payload as string;
      });

    // Bulk operations
    builder
      .addCase(bulkUpdateShipmentStatusAsync.pending, (state) => {
        state.bulkOperations.updating = true;
        state.bulkOperations.error = null;
      })
      .addCase(bulkUpdateShipmentStatusAsync.fulfilled, (state, action) => {
        state.bulkOperations.updating = false;
        state.bulkOperations.result = action.payload;
      })
      .addCase(bulkUpdateShipmentStatusAsync.rejected, (state, action) => {
        state.bulkOperations.updating = false;
        state.bulkOperations.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  setSelectedShippingCharge,
  setSelectedRate,
  setSelectedZone,
  setFilters,
  clearFilters,
  setRateFilters,
  clearRateFilters,
  setZoneFilters,
  clearZoneFilters,
  setPagination,
  setRatePagination,
  setZonePagination,
  setFormData,
  setFormErrors,
  clearFormData,
  setRateFormData,
  setRateFormErrors,
  clearRateFormData,
  setZoneFormData,
  setZoneFormErrors,
  clearZoneFormData,
  setSelectedShippingChargeIds,
  toggleShippingChargeSelection,
  clearShippingChargeSelection,
  setSelectedRateIds,
  toggleRateSelection,
  clearRateSelection,
  clearCalculatorResult,
  clearRouteRates,
} = shippingSlice.actions;

export default shippingSlice.reducer;