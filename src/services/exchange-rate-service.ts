// Exchange rate service for currency conversion tracking
import { baseUrl } from "@/app/constants";
import {
    ExchangeRateAlert,
    ExchangeRateCharge,
    ExchangeRateHistory,
    ExchangeRateSource
} from "@/models/data/charges/exchange-rate.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { format } from "date-fns";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  return response;
};

// Exchange rate charges CRUD - using the dedicated exchange rates endpoint
export const getExchangeRateCharges = async (params: {
  company_id?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<APIResponse<{
  charge: {
    id: number;
    company_id: number;
    type: string;
    category: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
    created_at: string;
  };
  exchange_details: {
    id: number;
    charge_id: number;
    source_currency: string;
    target_currency: string;
    source_amount: number;
    target_amount: number;
    exchange_rate: number;
    rate_source: string;
    exchange_loss: number;
    bank_fees: number;
    total_cost: number;
  };
}[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/charges/exchange-rates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

export const createExchangeRateCharge = async (data: Omit<ExchangeRateCharge, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>): Promise<APIResponse<ExchangeRateCharge>> => {
  // Use the specialized exchange rate endpoint
  const response = await fetch(`${baseUrl}/charges/exchange-rates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Form data interface for creating exchange rate charges
export interface CreateExchangeRateChargeData {
  source_currency: "DZD" | "EUR" | "USD";
  target_currency: "DZD" | "EUR" | "USD";
  source_amount: number;
  target_amount: number;
  exchange_rate: number;
  exchange_date: Date;
  reference_number?: string;
  description?: string;
}

// Service function to create exchange rate charge with proper data mapping
export const createExchangeRateChargeFromForm = async (
  formData: CreateExchangeRateChargeData,
  companyId: number,
  userId: number
): Promise<APIResponse<ExchangeRateCharge>> => {
  const apiData = {
    // Base charge fields
    title: `${formData.source_currency} to ${formData.target_currency} Exchange`,
    description: formData.description || `Currency exchange from ${formData.source_currency} to ${formData.target_currency}`,
    amount: formData.source_amount,
    currency: formData.source_currency,
    type: "exchange_rate" as const,
    status: "pending" as const,
    priority: "medium" as const,
    date: format(formData.exchange_date, 'yyyy-MM-dd'),
    company_id: companyId,
    approval_required: false,
    created_by_id: userId,
    
    // Exchange rate specific fields
    source_currency: formData.source_currency,
    target_currency: formData.target_currency,
    exchange_rate: formData.exchange_rate,
    rate_source: "custom" as const, // Since client buys from black market
    rate_date: format(formData.exchange_date, 'yyyy-MM-dd'),
    source_amount: formData.source_amount,
    target_amount: formData.target_amount,
    fee_amount: 0, // No fees for black market transactions
    
    // Purchase details
    purpose: "other" as const,
    purchase_description: formData.description || `Currency exchange from ${formData.source_currency} to ${formData.target_currency}`,
    vendor_reference: formData.reference_number,
    
    // Rate tracking
    rate_trend: "stable" as const,
    bank_fees: 0,
    transaction_reference: formData.reference_number,
    
    // Risk assessment
    risk_level: "medium" as const,
  };

  return createExchangeRateCharge(apiData);
};

export const updateExchangeRateCharge = async (id: number, data: Partial<ExchangeRateCharge>): Promise<APIResponse<ExchangeRateCharge>> => {
  const response = await fetch(`${baseUrl}/charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Rate calculation utilities
export const calculateExchangeAmount = (
  sourceAmount: number,
  exchangeRate: number,
  feePercentage: number = 0
): {
  targetAmount: number;
  feeAmount: number;
  totalCost: number;
} => {
  const targetAmount = sourceAmount * exchangeRate;
  const feeAmount = sourceAmount * (feePercentage / 100);
  const totalCost = sourceAmount + feeAmount;
  
  return {
    targetAmount: Math.round(targetAmount * 100) / 100,
    feeAmount: Math.round(feeAmount * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
};

export const calculateExchangeLossGain = (
  sourceAmount: number,
  actualRate: number,
  expectedRate: number
): {
  lossGainAmount: number;
  lossGainPercentage: number;
  isGain: boolean;
} => {
  const actualAmount = sourceAmount * actualRate;
  const expectedAmount = sourceAmount * expectedRate;
  const lossGainAmount = actualAmount - expectedAmount;
  const lossGainPercentage = ((actualRate - expectedRate) / expectedRate) * 100;
  const isGain = lossGainAmount > 0;
  
  return {
    lossGainAmount: Math.round(lossGainAmount * 100) / 100,
    lossGainPercentage: Math.round(lossGainPercentage * 100) / 100,
    isGain,
  };
};

// Get current exchange rates from the latest charge record
export const getCurrentExchangeRates = async (
  _currencyPairs: string[] = ["EUR/DZD", "USD/DZD"]
): Promise<APIResponse<Record<string, number>>> => {
  const response = await fetch(`${baseUrl}/charges/exchange-rates/current`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  const data = await response.json();
  
  // Transform the response to match the expected format
  const rates: Record<string, number> = {};
  if (data.data) {
    const { source_currency, target_currency, exchange_rate } = data.data;
    
    // Always create the pair in the expected format (EUR/DZD, USD/DZD)
    // The API might return DZD/EUR, but we need to convert it to EUR/DZD for the UI
    let pair: string;
    let rate: number;
    
    if (source_currency === "DZD" && target_currency === "EUR") {
      // Convert DZD/EUR to EUR/DZD and invert the rate
      pair = "EUR/DZD";
      rate = 1 / exchange_rate; // Invert the rate
    } else if (source_currency === "EUR" && target_currency === "DZD") {
      // Already in correct format
      pair = "EUR/DZD";
      rate = exchange_rate;
    } else if (source_currency === "USD" && target_currency === "DZD") {
      pair = "USD/DZD";
      rate = exchange_rate;
    } else if (source_currency === "DZD" && target_currency === "USD") {
      // Convert DZD/USD to USD/DZD and invert the rate
      pair = "USD/DZD";
      rate = 1 / exchange_rate;
    } else {
      // Default fallback
      pair = `${source_currency}/${target_currency}`;
      rate = exchange_rate;
    }
    
    rates[pair] = rate;
  }
  
  return {
    status: "success",
    message: "Current exchange rates retrieved successfully",
    data: rates
  };
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getExchangeRateFromSource = async (
  _sourceCurrency: string,
  _targetCurrency: string,
  _source: string = "official"
): Promise<APIResponse<{
  rate: number;
  source: string;
  timestamp: string;
  reliability_score: number;
}>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate retrieved successfully",
    data: {
      rate: 150.25,
      source: "official",
      timestamp: "2025-01-15T10:00:00Z",
      reliability_score: 0.95
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('source_currency', sourceCurrency);
  queryParams.append('target_currency', targetCurrency);
  queryParams.append('source', source);
  
  const url = `${baseUrl}/charges/exchange-ratess/rate${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
// Exchange rate sources management
export const getExchangeRateSources = async (): Promise<APIResponse<ExchangeRateSource[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate sources retrieved successfully",
    data: [
      {
        ID: 1,
        name: "Official Bank Rate",
        source_type: "api",
        api_endpoint: "https://api.bank.dz/rates",
        update_frequency: 60,
        is_active: true,
        reliability_score: 95,
        last_updated: "2025-01-15T10:00:00Z"
      },
      {
        ID: 2,
        name: "Market Rate",
        source_type: "api",
        api_endpoint: "https://api.market.com/rates",
        update_frequency: 30,
        is_active: true,
        reliability_score: 88,
        last_updated: "2025-01-15T09:30:00Z"
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-ratess/sources`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const createExchangeRateSource = async (data: Omit<ExchangeRateSource, 'ID' | 'last_updated'>): Promise<APIResponse<ExchangeRateSource>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate source created successfully",
    data: {
      ID: 3,
      ...data,
      last_updated: new Date().toISOString()
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-ratess/sources`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const updateExchangeRateSource = async (id: number, data: Partial<ExchangeRateSource>): Promise<APIResponse<ExchangeRateSource>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate source updated successfully",
    data: {
      ID: id,
      name: "Updated Rate Source",
      source_type: "api",
      api_endpoint: "https://api.bank.dz/rates",
      update_frequency: 60,
      is_active: true,
      reliability_score: 95,
      last_updated: new Date().toISOString(),
      ...data
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-ratess/sources/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const deleteExchangeRateSource = async (_id: number): Promise<APIResponse<void>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate source deleted successfully"
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-rates/sources/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Get exchange rate history
export const getExchangeRateHistory = async (params: {
  source: string;
  target: string;
  days?: number;
}): Promise<APIResponse<{
  source_currency: string;
  target_currency: string;
  days: number;
  history: Array<{
    date: string;
    source_currency: string;
    target_currency: string;
    rate: number;
    rate_source: string;
  }>;
}>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/charges/exchange-rates/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const recordExchangeRateHistory = async (data: Omit<ExchangeRateHistory, 'ID' | 'recorded_at'>): Promise<APIResponse<ExchangeRateHistory>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate history recorded successfully",
    data: {
      ID: 3,
      ...data,
      recorded_at: new Date().toISOString()
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-rates/history`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
// Exchange rate alerts
export const getExchangeRateAlerts = async (companyId?: number): Promise<APIResponse<ExchangeRateAlert[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate alerts retrieved successfully",
    data: [
      {
        ID: 1,
        company_id: companyId || 1,
        currency_pair: "EUR/DZD",
        target_rate: 155.0,
        condition: "above",
        is_active: true,
        notification_method: "email",
        created_by_id: 1,
        triggered_at: undefined
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  if (companyId) queryParams.append('company_id', companyId.toString());
  
  const url = `${baseUrl}/charges/exchange-rates/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const createExchangeRateAlert = async (data: Omit<ExchangeRateAlert, 'ID' | 'triggered_at'>): Promise<APIResponse<ExchangeRateAlert>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate alert created successfully",
    data: {
      ID: 2,
      ...data,
      triggered_at: undefined
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-rates/alerts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const updateExchangeRateAlert = async (id: number, data: Partial<ExchangeRateAlert>): Promise<APIResponse<ExchangeRateAlert>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate alert updated successfully",
    data: {
      ID: id,
      company_id: 1,
      currency_pair: "EUR/DZD",
      target_rate: 155.0,
      condition: "above",
      is_active: true,
      notification_method: "email",
      created_by_id: 1,
      triggered_at: undefined,
      ...data
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-rates/alerts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const deleteExchangeRateAlert = async (_id: number): Promise<APIResponse<void>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate alert deleted successfully"
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/charges/exchange-rates/alerts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// Get exchange rate analytics
export const getExchangeRateAnalytics = async (params: {
  company_id?: number;
  date_from?: string;
  date_to?: string;
} = {}): Promise<APIResponse<{
  summary: {
    total_exchanges: number;
    total_amount_exchanged: number;
    total_fees_paid: number;
    net_loss_gain: number;
    average_rate: number;
    total_source_amount: number;
    total_target_amount: number;
  };
  currency_breakdown: Array<{
    source_currency: string;
    target_currency: string;
    total_amount: number;
    count: number;
    average_rate: number;
  }>;
  rate_source_breakdown: Array<{
    rate_source: string;
    total_amount: number;
    count: number;
    average_rate: number;
  }>;
  date_range: {
    from: string;
    to: string;
  };
}>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/charges/exchange-rates/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const compareExchangeRates = async (
  _sourceCurrency: string,
  _targetCurrency: string,
  _sources: string[] = ["official", "bank", "market"]
): Promise<APIResponse<Record<string, {
  rate: number;
  source: string;
  reliability_score: number;
  last_updated: string;
  fees?: number;
}>>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rates compared successfully",
    data: {
      "official": {
        rate: 150.25,
        source: "official",
        reliability_score: 0.95,
        last_updated: "2025-01-15T10:00:00Z"
      },
      "bank": {
        rate: 150.30,
        source: "bank",
        reliability_score: 0.90,
        last_updated: "2025-01-15T09:30:00Z",
        fees: 0.5
      },
      "market": {
        rate: 150.20,
        source: "market",
        reliability_score: 0.85,
        last_updated: "2025-01-15T09:00:00Z"
      }
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('source_currency', sourceCurrency);
  queryParams.append('target_currency', targetCurrency);
  sources.forEach(source => queryParams.append('sources', source));
  
  const url = `${baseUrl}/charges/exchange-rates/compare${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getExchangeRateForecast = async (
  _sourceCurrency: string,
  _targetCurrency: string,
  _days: number = 30
): Promise<APIResponse<{
  forecasts: Array<{
    date: string;
    predicted_rate: number;
    confidence_level: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  trend_direction: "increasing" | "decreasing" | "stable";
  volatility_prediction: "low" | "medium" | "high";
  factors: string[];
}>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Exchange rate forecast retrieved successfully",
    data: {
      forecasts: [
        {
          date: "2025-01-16",
          predicted_rate: 150.30,
          confidence_level: 0.85,
          lower_bound: 149.80,
          upper_bound: 150.80
        },
        {
          date: "2025-01-17",
          predicted_rate: 150.35,
          confidence_level: 0.80,
          lower_bound: 149.85,
          upper_bound: 150.85
        }
      ],
      trend_direction: "increasing",
      volatility_prediction: "low",
      factors: ["Economic stability", "Central bank policy", "Market sentiment"]
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('source_currency', sourceCurrency);
  queryParams.append('target_currency', targetCurrency);
  queryParams.append('days', days.toString());
  
  const url = `${baseUrl}/charges/exchange-rates/forecast${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const quickConvert = async (
  amount: number,
  _sourceCurrency: string,
  _targetCurrency: string,
  source: string = "official"
): Promise<APIResponse<{
  source_amount: number;
  target_amount: number;
  exchange_rate: number;
  fee_percentage: number;
  fee_amount: number;
  total_cost: number;
  source: string;
  timestamp: string;
}>> => {
  // Mock data for UI testing
  const exchangeRate = 150.25;
  const feePercentage = 0.5;
  const feeAmount = amount * (feePercentage / 100);
  const targetAmount = amount * exchangeRate;
  const totalCost = amount + feeAmount;
  
  return {
    status: "success",
    message: "Currency conversion completed successfully",
    data: {
      source_amount: amount,
      target_amount: targetAmount,
      exchange_rate: exchangeRate,
      fee_percentage: feePercentage,
      fee_amount: feeAmount,
      total_cost: totalCost,
      source: source,
      timestamp: new Date().toISOString()
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('amount', amount.toString());
  queryParams.append('source_currency', sourceCurrency);
  queryParams.append('target_currency', targetCurrency);
  queryParams.append('source', source);
  
  const url = `${baseUrl}/charges/exchange-rates/convert${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};