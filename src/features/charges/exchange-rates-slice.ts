// Redux slice for exchange rates management
import {
    ExchangeRateAlert,
    ExchangeRateCharge,
    ExchangeRateHistory,
    ExchangeRateSource
} from '@/models/data/charges/exchange-rate.model';
import * as exchangeRateService from '@/services/exchange-rate-service';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Async thunks
export const fetchExchangeRateCharges = createAsyncThunk(
  'exchangeRates/fetchCharges',
  async (params: Parameters<typeof exchangeRateService.getExchangeRateCharges>[0], { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getExchangeRateCharges(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createExchangeRateCharge = createAsyncThunk(
  'exchangeRates/createCharge',
  async (data: Parameters<typeof exchangeRateService.createExchangeRateCharge>[0], { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.createExchangeRateCharge(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExchangeRateCharge = createAsyncThunk(
  'exchangeRates/updateCharge',
  async ({ id, data }: { id: number; data: Partial<ExchangeRateCharge> }, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.updateExchangeRateCharge(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentRates = createAsyncThunk(
  'exchangeRates/fetchCurrentRates',
  async (currencyPairs: string[] = ["EUR/DZD", "USD/DZD"], { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getCurrentExchangeRates(currencyPairs);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLiveRate = createAsyncThunk(
  'exchangeRates/fetchLiveRate',
  async (params: { sourceCurrency: string; targetCurrency: string; source?: string }, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getExchangeRateFromSource(
        params.sourceCurrency, 
        params.targetCurrency, 
        params.source
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExchangeRateSources = createAsyncThunk(
  'exchangeRates/fetchSources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getExchangeRateSources();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExchangeRateHistory = createAsyncThunk(
  'exchangeRates/fetchHistory',
  async (params: {
    source: string;
    target: string;
    days?: number;
  }, { rejectWithValue }) => {
    try {
      console.log('Fetching exchange rate history with params:', params);
      
      // Fetch both directions to get all available data
      const promises = [
        exchangeRateService.getExchangeRateHistory(params),
        exchangeRateService.getExchangeRateHistory({
          source: params.target,
          target: params.source,
          days: params.days
        })
      ];
      
      const [primaryResponse, reverseResponse] = await Promise.all(promises);
      console.log('Primary history API response:', primaryResponse);
      console.log('Reverse history API response:', reverseResponse);
      
      // Combine and transform the history data
      const primaryHistory = primaryResponse.data?.history || [];
      const reverseHistory = reverseResponse.data?.history || [];
      
      console.log('Primary history array:', primaryHistory);
      console.log('Reverse history array:', reverseHistory);
      
      let allHistory: ExchangeRateHistory[] = [];
      let idCounter = 1;
      
      // Add primary direction data
      primaryHistory.forEach((item: any) => {
        allHistory.push({
          ID: idCounter++,
          source_currency: item.source_currency,
          target_currency: item.target_currency,
          rate: item.rate,
          source: item.rate_source,
          recorded_at: item.date
        });
      });
      
      // Add reverse direction data with inverted rates
      reverseHistory.forEach((item: any) => {
        allHistory.push({
          ID: idCounter++,
          source_currency: item.target_currency, // Swap currencies
          target_currency: item.source_currency,
          rate: 1 / item.rate, // Invert the rate
          source: item.rate_source,
          recorded_at: item.date
        });
      });
      
      // Sort by date (newest first)
      allHistory.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
      
      console.log('Combined and transformed history:', allHistory);
      return allHistory;
    } catch (error: any) {
      console.error('Error fetching history:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExchangeRateAlerts = createAsyncThunk(
  'exchangeRates/fetchAlerts',
  async (companyId: number | undefined, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getExchangeRateAlerts(companyId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createExchangeRateAlert = createAsyncThunk(
  'exchangeRates/createAlert',
  async (data: Parameters<typeof exchangeRateService.createExchangeRateAlert>[0], { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.createExchangeRateAlert(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExchangeRateAnalytics = createAsyncThunk(
  'exchangeRates/fetchAnalytics',
  async (params: {
    company_id?: number;
    date_from?: string;
    date_to?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.getExchangeRateAnalytics(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const compareRates = createAsyncThunk(
  'exchangeRates/compareRates',
  async (params: { sourceCurrency: string; targetCurrency: string; sources?: string[] }, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.compareExchangeRates(
        params.sourceCurrency,
        params.targetCurrency,
        params.sources
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const quickConvert = createAsyncThunk(
  'exchangeRates/quickConvert',
  async (params: { amount: number; sourceCurrency: string; targetCurrency: string; source?: string }, { rejectWithValue }) => {
    try {
      const response = await exchangeRateService.quickConvert(
        params.amount,
        params.sourceCurrency,
        params.targetCurrency,
        params.source
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Types
export interface ExchangeRateFilters {
  source_currency?: string;
  target_currency?: string;
  rate_source?: string;
  date_from?: string;
  date_to?: string;
  purpose?: string;
  amount_min?: number;
  amount_max?: number;
}

export interface ConversionCalculation {
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: number;
  feeAmount: number;
  totalCost: number;
  lossGainAmount?: number;
  lossGainPercentage?: number;
  isGain?: boolean;
}

// State interface
export interface ExchangeRatesState {
  // Exchange rate charges
  charges: ExchangeRateCharge[];
  selectedCharge: ExchangeRateCharge | null;
  
  // Current rates and sources
  currentRates: Record<string, number>;
  rateSources: ExchangeRateSource[];
  selectedSource: ExchangeRateSource | null;
  
  // Rate history and analytics
  rateHistory: ExchangeRateHistory[];
  analytics: any | null;
  
  // Alerts
  alerts: ExchangeRateAlert[];
  
  // Live rate data
  liveRate: {
    rate: number;
    source: string;
    timestamp: string;
    reliability_score: number;
  } | null;
  
  // Rate comparison
  rateComparison: Record<string, any> | null;
  
  // Quick conversion
  quickConversion: {
    source_amount: number;
    target_amount: number;
    exchange_rate: number;
    fee_amount: number;
    total_cost: number;
    source: string;
    timestamp: string;
  } | null;
  
  // Calculator state
  calculator: {
    sourceAmount: number;
    sourceCurrency: string;
    targetCurrency: string;
    selectedSource: string;
    calculation: ConversionCalculation | null;
  };
  
  // UI state
  loading: boolean;
  sourcesLoading: boolean;
  historyLoading: boolean;
  analyticsLoading: boolean;
  alertsLoading: boolean;
  error: string | null;
  
  // Filters
  filters: ExchangeRateFilters;
  
  // Form state
  formData: Partial<ExchangeRateCharge> | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Real-time updates
  lastRateUpdate: string | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number; // seconds
}

// Initial state
const initialState: ExchangeRatesState = {
  // Exchange rate charges
  charges: [],
  selectedCharge: null,
  
  // Current rates and sources
  currentRates: {},
  rateSources: [],
  selectedSource: null,
  
  // Rate history and analytics
  rateHistory: [],
  analytics: null,
  
  // Alerts
  alerts: [],
  
  // Live rate data
  liveRate: null,
  
  // Rate comparison
  rateComparison: null,
  
  // Quick conversion
  quickConversion: null,
  
  // Calculator state
  calculator: {
    sourceAmount: 0,
    sourceCurrency: 'DZD',
    targetCurrency: 'EUR',
    selectedSource: 'official',
    calculation: null,
  },
  
  // UI state
  loading: false,
  sourcesLoading: false,
  historyLoading: false,
  analyticsLoading: false,
  alertsLoading: false,
  error: null,
  
  // Filters
  filters: {},
  
  // Form state
  formData: null,
  formErrors: {},
  isSubmitting: false,
  
  // Real-time updates
  lastRateUpdate: null,
  autoRefreshEnabled: false,
  refreshInterval: 300, // 5 minutes
};

// Slice definition
export const exchangeRatesSlice = createSlice({
  name: 'exchangeRates',
  initialState,
  reducers: {
    // Charges management
    setSelectedCharge: (state, action: PayloadAction<ExchangeRateCharge | null>) => {
      state.selectedCharge = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<ExchangeRateFilters>) => {
      state.filters = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<ExchangeRateFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Calculator
    updateCalculator: (state, action: PayloadAction<Partial<typeof initialState.calculator>>) => {
      state.calculator = { ...state.calculator, ...action.payload };
    },
    
    setCalculatorResult: (state, action: PayloadAction<ConversionCalculation>) => {
      state.calculator.calculation = action.payload;
    },
    
    resetCalculator: (state) => {
      state.calculator = initialState.calculator;
    },
    
    // Form state
    setFormData: (state, action: PayloadAction<Partial<ExchangeRateCharge> | null>) => {
      state.formData = action.payload;
      state.formErrors = {};
    },
    
    updateFormData: (state, action: PayloadAction<Partial<ExchangeRateCharge>>) => {
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
    
    // Source selection
    setSelectedSource: (state, action: PayloadAction<ExchangeRateSource | null>) => {
      state.selectedSource = action.payload;
    },
    
    // Real-time updates
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefreshEnabled = action.payload;
    },
    
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    
    updateLastRateUpdate: (state) => {
      state.lastRateUpdate = new Date().toISOString();
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetExchangeRatesState: (state) => {
      Object.assign(state, initialState);
    },
  },
  
  extraReducers: (builder) => {
    // Fetch exchange rate charges
    builder
      .addCase(fetchExchangeRateCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRateCharges.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the new API response structure to match ExchangeRateCharge interface
        let chargesArray: ExchangeRateCharge[] = [];
        
        if (action.payload && Array.isArray(action.payload)) {
          chargesArray = action.payload.map((item: any) => {
            const { charge, exchange_details } = item;
            return {
              ID: charge.id,
              CreatedAt: charge.created_at,
              UpdatedAt: charge.created_at, // Using created_at as fallback
              DeletedAt: null,
              company_id: charge.company_id,
              type: charge.type,
              title: charge.title,
              description: charge.description,
              amount: charge.amount,
              currency: charge.currency,
              status: charge.status,
              priority: "medium" as const,
              date: charge.date,
              approval_required: false,
              created_by_id: 0,
              
              // Exchange rate specific fields
              source_currency: exchange_details.source_currency,
              target_currency: exchange_details.target_currency,
              source_amount: exchange_details.source_amount,
              target_amount: exchange_details.target_amount,
              exchange_rate: exchange_details.exchange_rate,
              rate_source: exchange_details.rate_source,
              rate_date: charge.date,
              fee_amount: exchange_details.bank_fees,
              loss_gain_amount: exchange_details.exchange_loss,
              
              // Additional fields with defaults
              purpose: "other" as const,
              purchase_description: charge.description,
              vendor_reference: "",
              rate_trend: "stable" as const,
              bank_fees: exchange_details.bank_fees,
              transaction_reference: "",
              risk_level: "medium" as const,
            } as ExchangeRateCharge;
          });
        }
        
        state.charges = chargesArray;
      })
      .addCase(fetchExchangeRateCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Create exchange rate charge
    builder
      .addCase(createExchangeRateCharge.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createExchangeRateCharge.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          // Ensure charges is an array before unshifting
          if (!Array.isArray(state.charges)) {
            state.charges = [];
          }
          state.charges.unshift(action.payload);
        }
        state.formData = null;
        state.formErrors = {};
      })
      .addCase(createExchangeRateCharge.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    // Update exchange rate charge
    builder
      .addCase(updateExchangeRateCharge.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateExchangeRateCharge.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          // Ensure charges is an array before finding index
          if (!Array.isArray(state.charges)) {
            state.charges = [];
          }
          const index = state.charges.findIndex(c => c.ID === action.payload?.ID);
          if (index !== -1) {
            state.charges[index] = action.payload;
          }
          if (state.selectedCharge?.ID === action.payload.ID) {
            state.selectedCharge = action.payload;
          }
        }
      })
      .addCase(updateExchangeRateCharge.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
    
    // Fetch current rates
    builder
      .addCase(fetchCurrentRates.fulfilled, (state, action) => {
        state.currentRates = action.payload || {};
        state.lastRateUpdate = new Date().toISOString();
      })
      .addCase(fetchCurrentRates.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Fetch live rate
    builder
      .addCase(fetchLiveRate.fulfilled, (state, action) => {
        if (action.payload) {
          state.liveRate = action.payload;
        }
        state.lastRateUpdate = new Date().toISOString();
      })
      .addCase(fetchLiveRate.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Fetch rate sources
    builder
      .addCase(fetchExchangeRateSources.pending, (state) => {
        state.sourcesLoading = true;
      })
      .addCase(fetchExchangeRateSources.fulfilled, (state, action) => {
        state.sourcesLoading = false;
        state.rateSources = action.payload || [];
      })
      .addCase(fetchExchangeRateSources.rejected, (state, action) => {
        state.sourcesLoading = false;
        state.error = action.payload as string;
      });
    
    // Fetch rate history
    builder
      .addCase(fetchExchangeRateHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchExchangeRateHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.rateHistory = action.payload || [];
      })
      .addCase(fetchExchangeRateHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });
    
    // Fetch alerts
    builder
      .addCase(fetchExchangeRateAlerts.pending, (state) => {
        state.alertsLoading = true;
      })
      .addCase(fetchExchangeRateAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = action.payload || [];
      })
      .addCase(fetchExchangeRateAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.error = action.payload as string;
      });
    
    // Create alert
    builder
      .addCase(createExchangeRateAlert.fulfilled, (state, action) => {
        if (action.payload) {
          state.alerts.push(action.payload);
        }
      });
    
    // Fetch analytics
    builder
      .addCase(fetchExchangeRateAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchExchangeRateAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchExchangeRateAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });
    
    // Compare rates
    builder
      .addCase(compareRates.fulfilled, (state, action) => {
        if (action.payload) {
          state.rateComparison = action.payload;
        }
      })
      .addCase(compareRates.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Quick convert
    builder
      .addCase(quickConvert.fulfilled, (state, action) => {
        if (action.payload) {
          state.quickConversion = action.payload;
        }
      })
      .addCase(quickConvert.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedCharge,
  setFilters,
  updateFilters,
  clearFilters,
  updateCalculator,
  setCalculatorResult,
  resetCalculator,
  setFormData,
  updateFormData,
  setFormErrors,
  clearFormErrors,
  setSelectedSource,
  setAutoRefresh,
  setRefreshInterval,
  updateLastRateUpdate,
  setError,
  clearError,
  resetExchangeRatesState,
} = exchangeRatesSlice.actions;

// Export reducer
export default exchangeRatesSlice.reducer;