// Shipping service for managing shipping charges and logistics
import { baseUrl } from '@/app/constants';
import {
    DeliveryZone,
    FuelSurcharge,
    ProviderPerformance,
    ShippingAnalytics,
    ShippingCharge,
    ShippingRate,
    ShippingStatusUpdate,
    ZoneAnalytics
} from "@/models/data/charges/shipping.model";
import { APIResponse } from "@/models/responses/api-response.model";


// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
};

// Fetch parameters for shipping charges
export interface FetchShippingChargesParams {
  limit?: number;
  offset?: number;
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
  company_id?: number;
}

// Create shipping charge data
export interface CreateShippingChargeData {
  order_id?: number;
  delivery_company_id?: number;
  provider_name: string;
  tracking_number?: string;
  shipping_method: "standard" | "express" | "overnight" | "same_day" | "pickup";
  service_type: "door_to_door" | "pickup_point" | "station_to_station";
  
  // Addresses
  origin_address: string;
  origin_city: string;
  origin_postal_code?: string;
  destination_address: string;
  destination_city: string;
  destination_postal_code?: string;
  
  // Package details
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  package_count: number;
  
  // Cost breakdown
  base_shipping_cost: number;
  fuel_surcharge?: number;
  insurance_cost?: number;
  cod_fee?: number;
  packaging_fee?: number;
  handling_fee?: number;
  tax_amount?: number;
  
  // Timing
  pickup_date?: string;
  estimated_delivery_date?: string;
  delivery_window?: string;
  
  // Service features
  insurance_value?: number;
  cash_on_delivery: boolean;
  cod_amount?: number;
  fragile_handling: boolean;
  temperature_controlled: boolean;
  hazardous_materials: boolean;
  high_value_item: boolean;
  special_instructions?: string;
  
  // Return settings
  return_allowed: boolean;
  return_cost?: number;
  return_deadline?: string;
  
  description?: string;
  attachments?: string[];
}

export interface UpdateShippingChargeData extends Partial<CreateShippingChargeData> {
  current_status?: "pending" | "picked_up" | "in_transit" | "delivered" | "returned" | "lost" | "damaged";
  actual_delivery_date?: string;
  delivery_time_hours?: number;
  on_time_delivery?: boolean;
  customer_satisfaction?: number;
}

export interface ShippingCostCalculationParams {
  origin_zone: string;
  destination_zone: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  service_type: string;
  provider_id?: number;
  insurance_value?: number;
  cash_on_delivery?: boolean;
  cod_amount?: number;
  fuel_surcharge_rate?: number;
  special_services?: string[];
}

export interface ShippingCostCalculationResult {
  base_cost: number;
  fuel_surcharge: number;
  insurance_cost: number;
  cod_fee: number;
  handling_fee: number;
  tax_amount: number;
  total_cost: number;
  
  // Rate details
  applicable_rate: ShippingRate;
  zone_multiplier: number;
  weight_cost: number;
  distance_cost?: number;
  volumetric_weight?: number;
  billable_weight: number;
  
  // Timing
  estimated_delivery_days: number;
  estimated_delivery_date: string;
  
  // Service options
  available_services: string[];
  service_fees: Record<string, number>;
  
  // Breakdown
  cost_breakdown: {
    base_rate: number;
    weight_charges: number;
    zone_charges: number;
    fuel_surcharge: number;
    insurance: number;
    cod_fee: number;
    taxes: number;
    other_fees: number;
  };
}

export interface CreateRateData {
  provider_id: number;
  service_type: string;
  origin_zone: string;
  destination_zone: string;
  base_rate: number;
  rate_per_kg: number;
  rate_per_km?: number;
  minimum_charge: number;
  maximum_charge?: number;
  fuel_surcharge_rate: number;
  insurance_rate: number;
  cod_rate?: number;
  max_weight?: number;
  max_dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  estimated_days: number;
  cutoff_time?: string;
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
}

export interface CreateZoneData {
  name: string;
  code: string;
  type: "city" | "region" | "postal_code" | "custom";
  cities: string[];
  postal_codes?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  };
  available_services: string[];
  delivery_days: string[];
  cutoff_times: Record<string, string>;
  zone_multiplier: number;
  base_delivery_fee: number;
  is_rural: boolean;
  accessibility_level: "easy" | "medium" | "difficult";
  is_active: boolean;
}

export interface TrackingUpdateData {
  tracking_number: string;
  status: string;
  location?: string;
  description?: string;
  timestamp?: string;
  provider_status_code?: string;
}

export interface ShippingDashboardParams {
  date_from?: string;
  date_to?: string;
  provider_id?: number;
  zone_category?: string;
  company_id?: number;
}

export interface ShippingDashboardData {
  total_shipments: number;
  total_shipping_cost: number;
  average_cost_per_shipment: number;
  total_weight_shipped: number;
  average_delivery_time: number;
  on_time_delivery_rate: number;
  
  // Performance metrics
  delivery_performance: {
    delivered: number;
    in_transit: number;
    pending: number;
    delayed: number;
    lost_or_damaged: number;
  };
  
  // Cost analysis
  cost_breakdown: {
    base_costs: number;
    fuel_surcharges: number;
    insurance_costs: number;
    cod_fees: number;
    other_fees: number;
  };
  
  // Provider performance
  provider_comparison: ProviderPerformance[];
  
  // Geographic analysis
  zone_analytics: ZoneAnalytics[];
  
  // Recent shipments
  recent_shipments: ShippingCharge[];
  
  // Trends
  shipping_trends: Array<{
    date: string;
    shipment_count: number;
    total_cost: number;
    average_delivery_time: number;
    on_time_rate: number;
  }>;
  
  // Issues requiring attention
  delayed_shipments: ShippingCharge[];
  high_cost_shipments: ShippingCharge[];
  customer_complaints: number;
}

export interface ShippingChargeListResponse extends APIResponse<ShippingCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ShippingChargeResponse extends APIResponse<ShippingCharge> {}
export interface ShippingRateListResponse extends APIResponse<ShippingRate[]> {}
export interface ShippingRateResponse extends APIResponse<ShippingRate> {}
export interface DeliveryZoneListResponse extends APIResponse<DeliveryZone[]> {}
export interface DeliveryZoneResponse extends APIResponse<DeliveryZone> {}
export interface FuelSurchargeListResponse extends APIResponse<FuelSurcharge[]> {}
export interface FuelSurchargeResponse extends APIResponse<FuelSurcharge> {}
export interface CostCalculationResponse extends APIResponse<ShippingCostCalculationResult> {}
export interface DashboardResponse extends APIResponse<ShippingDashboardData> {}
export interface AnalyticsResponse extends APIResponse<ShippingAnalytics> {}

// Core CRUD operations for shipping charges
export const getShippingCharges = async (params: FetchShippingChargesParams = {}): Promise<ShippingChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add type filter for shipping charges
  queryParams.append('type', 'shipping');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/api/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

export const getShippingCharge = async (id: number): Promise<ShippingChargeResponse> => {
  const response = await fetch(`${baseUrl}/api/charges/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

export const createShippingCharge = async (data: CreateShippingChargeData): Promise<ShippingChargeResponse> => {
  const response = await fetch(`${baseUrl}/api/charges/shipping`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

export const updateShippingCharge = async (id: number, data: UpdateShippingChargeData): Promise<ShippingChargeResponse> => {
  const response = await fetch(`${baseUrl}/api/charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

export const deleteShippingCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/api/charges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const calculateShippingCosts = async (params: ShippingCostCalculationParams): Promise<CostCalculationResponse> => {
  // Mock data for UI testing
  const baseCost = 5000;
  const fuelSurcharge = baseCost * 0.1;
  const insuranceCost = params.insurance_value ? params.insurance_value * 0.02 : 0;
  const codFee = params.cash_on_delivery && params.cod_amount ? params.cod_amount * 0.05 : 0;
  const handlingFee = 1000;
  const taxAmount = (baseCost + fuelSurcharge + insuranceCost + codFee + handlingFee) * 0.19;
  const totalCost = baseCost + fuelSurcharge + insuranceCost + codFee + handlingFee + taxAmount;
  
  return {
    status: "success",
    message: "Shipping costs calculated successfully",
    data: {
      base_cost: baseCost,
      fuel_surcharge: fuelSurcharge,
      insurance_cost: insuranceCost,
      cod_fee: codFee,
      handling_fee: handlingFee,
      tax_amount: taxAmount,
      total_cost: totalCost,
      applicable_rate: {
        ID: 1,
        provider_id: params.provider_id || 1,
        service_type: params.service_type,
        origin_zone: params.origin_zone,
        destination_zone: params.destination_zone,
        base_rate: baseCost,
        rate_per_kg: 500,
        minimum_charge: 2000,
        fuel_surcharge_rate: 0.1,
        insurance_rate: 0.02,
        estimated_days: 3,
        effective_from: "2025-01-01",
        is_active: true
      },
      zone_multiplier: 1.0,
      weight_cost: params.weight * 500,
      billable_weight: params.weight,
      estimated_delivery_days: 3,
      estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      available_services: ["standard", "express", "overnight"],
      service_fees: {
        express: 2000,
        overnight: 5000
      },
      cost_breakdown: {
        base_rate: baseCost,
        weight_charges: params.weight * 500,
        zone_charges: 0,
        fuel_surcharge: fuelSurcharge,
        insurance: insuranceCost,
        cod_fee: codFee,
        taxes: taxAmount,
        other_fees: handlingFee
      }
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getShippingRatesForRoute = async (params: {
  origin_zone: string;
  destination_zone: string;
  service_type?: string;
  provider_id?: number;
}): Promise<ShippingRateListResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping rates retrieved successfully",
    data: [
      {
        ID: 1,
        provider_id: params.provider_id || 1,
        service_type: params.service_type || "standard",
        origin_zone: params.origin_zone,
        destination_zone: params.destination_zone,
        base_rate: 5000,
        rate_per_kg: 500,
        minimum_charge: 2000,
        fuel_surcharge_rate: 0.1,
        insurance_rate: 0.02,
        estimated_days: 3,
        effective_from: "2025-01-01",
        is_active: true
      },
      {
        ID: 2,
        provider_id: params.provider_id || 2,
        service_type: "express",
        origin_zone: params.origin_zone,
        destination_zone: params.destination_zone,
        base_rate: 8000,
        rate_per_kg: 800,
        minimum_charge: 3000,
        fuel_surcharge_rate: 0.12,
        insurance_rate: 0.025,
        estimated_days: 1,
        effective_from: "2025-01-01",
        is_active: true
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
  
  const url = `${baseUrl}/shipping-charges/rates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getShippingRates = async (params: {
  limit?: number;
  offset?: number;
  provider_id?: number;
  service_type?: string;
  origin_zone?: string;
  destination_zone?: string;
  active_only?: boolean;
} = {}): Promise<ShippingRateListResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping rates retrieved successfully",
    data: [
      {
        ID: 1,
        provider_id: params.provider_id || 1,
        service_type: "standard",
        origin_zone: "Algiers",
        destination_zone: "Oran",
        base_rate: 5000,
        rate_per_kg: 500,
        minimum_charge: 2000,
        fuel_surcharge_rate: 0.1,
        insurance_rate: 0.02,
        estimated_days: 3,
        effective_from: "2025-01-01",
        is_active: true
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
  
  const url = `${baseUrl}/shipping-charges/rates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const createShippingRate = async (data: CreateRateData): Promise<ShippingRateResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping rate created successfully",
    data: {
      ID: 3,
      ...data,
      is_active: true
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/rates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const updateShippingRate = async (id: number, data: Partial<CreateRateData>): Promise<ShippingRateResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping rate updated successfully",
    data: {
      ID: id,
      provider_id: 1,
      service_type: "standard",
      origin_zone: "Algiers",
      destination_zone: "Oran",
      base_rate: 5000,
      rate_per_kg: 500,
      minimum_charge: 2000,
      fuel_surcharge_rate: 0.1,
      insurance_rate: 0.02,
      estimated_days: 3,
      effective_from: "2025-01-01",
      is_active: true,
      ...data
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/rates/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getDeliveryZones = async (_params: {
  limit?: number;
  offset?: number;
  type?: string;
  active_only?: boolean;
  search?: string;
} = {}): Promise<DeliveryZoneListResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Delivery zones retrieved successfully",
    data: [
      {
        ID: 1,
        name: "Algiers Central",
        code: "ALG_CENTRAL",
        type: "city",
        cities: ["Algiers"],
        available_services: ["standard", "express"],
        delivery_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        cutoff_times: {
          standard: "15:00",
          express: "17:00"
        },
        zone_multiplier: 1.0,
        base_delivery_fee: 2000,
        is_rural: false,
        accessibility_level: "easy",
        is_active: true,
        created_at: "2025-01-15T10:00:00Z"
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
  
  const url = `${baseUrl}/shipping-charges/zones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const createDeliveryZone = async (data: CreateZoneData): Promise<DeliveryZoneResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Delivery zone created successfully",
    data: {
      ID: 2,
      ...data,
      is_active: true,
      created_at: new Date().toISOString()
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/zones`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const updateShipmentStatus = async (id: number, _data: TrackingUpdateData): Promise<ShippingChargeResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipment status updated successfully",
    data: {
      ID: id,
      type: "shipping",
      company_id: 1,
      title: "Shipping Charge",
      description: "Updated shipping status",
      amount: 5000,
      currency: "DZD",
      date: new Date().toISOString(),
      status: "pending",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      DeletedAt: null,
      priority: "medium",
      approval_required: true,
      provider_name: "Provider A",
      shipping_method: "standard",
      service_type: "door_to_door",
      origin_address: "123 Main St, Algiers",
      origin_city: "Algiers",
      destination_address: "456 Oak St, Oran",
      destination_city: "Oran",
      origin_zone: "Algiers",
      destination_zone: "Oran",
      zone_category: "national",
      weight: 5,
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
        unit: "cm"
      },
      package_count: 1,
      base_shipping_cost: 5000,
      current_status: "pending",
      status_updates: [],
      cash_on_delivery: false,
      signature_required: false,
      fragile_handling: false,
      temperature_controlled: false,
      hazardous_materials: false,
      high_value_item: false,
      return_allowed: false,
      on_time_delivery: false,
      cost_per_kg: 1000
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getTrackingUpdates = async (_trackingNumber: string): Promise<APIResponse<ShippingStatusUpdate[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Tracking updates retrieved successfully",
    data: [
      {
        ID: 1,
        shipping_charge_id: 1,
        status: "in_transit",
        location: "Algiers Hub",
        description: "Package picked up from origin",
        timestamp: new Date().toISOString(),
        updated_by: "provider",
        provider_status_code: "PICKED_UP"
      },
      {
        ID: 2,
        shipping_charge_id: 1,
        status: "in_transit",
        location: "Oran Hub",
        description: "Package in transit to destination",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_by: "provider",
        provider_status_code: "IN_TRANSIT"
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/tracking/${trackingNumber}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const syncWithProvider = async (_trackingNumber: string): Promise<APIResponse<ShippingStatusUpdate[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Tracking synced with provider successfully",
    data: [
      {
        ID: 3,
        shipping_charge_id: 1,
        status: "delivered",
        location: "Destination",
        description: "Package delivered successfully",
        timestamp: new Date().toISOString(),
        updated_by: "provider",
        provider_status_code: "DELIVERED"
      }
    ]
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/tracking/${trackingNumber}/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getFuelSurcharges = async (params: {
  provider_id?: number;
  active_only?: boolean;
  effective_date?: string;
} = {}): Promise<FuelSurchargeListResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Fuel surcharges retrieved successfully",
    data: [
      {
        ID: 1,
        provider_id: params.provider_id || 1,
        effective_date: "2025-01-01",
        fuel_price_per_liter: 45.5,
        surcharge_percentage: 10,
        calculation_method: "percentage",
        applied_to: "base_rate",
        is_active: true,
        created_at: "2025-01-15T10:00:00Z"
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
  
  const url = `${baseUrl}/shipping-charges/fuel-surcharges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const createFuelSurcharge = async (data: Omit<FuelSurcharge, "ID">): Promise<FuelSurchargeResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Fuel surcharge created successfully",
    data: {
      ID: 2,
      ...data,
      is_active: true,
      created_at: new Date().toISOString()
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/fuel-surcharges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getShippingDashboard = async (_params: ShippingDashboardParams = {}): Promise<DashboardResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping dashboard data retrieved successfully",
    data: {
      total_shipments: 150,
      total_shipping_cost: 750000,
      average_cost_per_shipment: 5000,
      total_weight_shipped: 1500,
      average_delivery_time: 2.5,
      on_time_delivery_rate: 0.95,
      delivery_performance: {
        delivered: 120,
        in_transit: 20,
        pending: 5,
        delayed: 3,
        lost_or_damaged: 2
      },
      cost_breakdown: {
        base_costs: 600000,
        fuel_surcharges: 75000,
        insurance_costs: 30000,
        cod_fees: 15000,
        other_fees: 30000
      },
      provider_comparison: [
        {
          provider_id: 1,
          provider_name: "Provider A",
          shipment_count: 80,
          total_cost: 384000,
          on_time_rate: 0.98,
          damage_rate: 0.02,
          average_rating: 4.5,
          cost_efficiency_score: 0.85
        }
      ],
      zone_analytics: [
        {
          zone_name: "Algiers",
          shipment_count: 50,
          total_cost: 250000,
          average_delivery_time: 2.0,
          success_rate: 0.98
        }
      ],
      recent_shipments: [],
      shipping_trends: [
        {
          date: "2025-01-15",
          shipment_count: 10,
          total_cost: 50000,
          average_delivery_time: 2.5,
          on_time_rate: 0.95
        }
      ],
      delayed_shipments: [],
      high_cost_shipments: [],
      customer_complaints: 2
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/shipping-charges/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getShippingAnalytics = async (_params: {
  date_from?: string;
  date_to?: string;
  provider_id?: number;
  zone_category?: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<AnalyticsResponse> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping analytics retrieved successfully",
    data: {
      period_start: "2025-01-01",
      period_end: "2025-01-31",
      total_shipments: 150,
      total_cost: 750000,
      total_weight: 1500,
      on_time_delivery_rate: 0.95,
      average_delivery_time: 2.5,
      customer_satisfaction_avg: 4.5,
      average_cost_per_shipment: 5000,
      average_cost_per_kg: 500,
      cost_trend: "stable",
      provider_performance: [
        {
          provider_id: 1,
          provider_name: "Provider A",
          shipment_count: 80,
          total_cost: 384000,
          on_time_rate: 0.98,
          damage_rate: 0.02,
          average_rating: 4.5,
          cost_efficiency_score: 0.85
        }
      ],
      top_destinations: [
        {
          zone_name: "Algiers",
          shipment_count: 50,
          total_cost: 250000,
          average_delivery_time: 2.0,
          success_rate: 0.98
        }
      ],
      lost_packages: 1,
      damaged_packages: 1,
      returned_packages: 2,
      complaint_count: 2
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/shipping-charges/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getProviderPerformanceComparison = async (_params: {
  date_from?: string;
  date_to?: string;
  zone_category?: string;
}): Promise<APIResponse<ProviderPerformance[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Provider performance comparison retrieved successfully",
    data: [
      {
        provider_id: 1,
        provider_name: "Provider A",
        shipment_count: 80,
        total_cost: 384000,
        on_time_rate: 0.98,
        damage_rate: 0.02,
        average_rating: 4.5,
        cost_efficiency_score: 0.85
      },
      {
        provider_id: 2,
        provider_name: "Provider B",
        shipment_count: 70,
        total_cost: 364000,
        on_time_rate: 0.92,
        damage_rate: 0.05,
        average_rating: 4.2,
        cost_efficiency_score: 0.78
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
  
  const url = `${baseUrl}/shipping-charges/providers/comparison${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const exportShippingCharges = async (_params: FetchShippingChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_tracking?: boolean;
}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping charges exported successfully",
    data: {
      file_url: "https://api.example.com/exports/shipping_charges_2025_01_15.xlsx",
      file_size: 2048000
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const queryParams = new URLSearchParams();
  queryParams.append('type', 'shipping');
  queryParams.append('format', params.format);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'format') {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${baseUrl}/shipping-charges/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const importShippingCharges = async (_file: File, _options?: {
  skip_duplicates?: boolean;
  auto_calculate_costs?: boolean;
  default_provider?: string;
}): Promise<APIResponse<{ imported_count: number; errors: string[] }>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Shipping charges imported successfully",
    data: {
      imported_count: 25,
      errors: [
        "Row 5: Invalid tracking number format",
        "Row 12: Missing required field 'origin_address'"
      ]
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
  
  const response = await fetch(`${baseUrl}/shipping-charges/import`, {
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

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const bulkUpdateShipmentStatus = async (data: {
  shipment_ids: number[];
  status: string;
  notes?: string;
}): Promise<APIResponse<{ updated_count: number; errors: string[] }>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Bulk shipment status updated successfully",
    data: {
      updated_count: data.shipment_ids.length,
      errors: []
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/bulk-status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const bulkCalculateShippingCosts = async (shipments: ShippingCostCalculationParams[]): Promise<APIResponse<ShippingCostCalculationResult[]>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Bulk shipping costs calculated successfully",
    data: shipments.map((shipment, index) => ({
      base_cost: 5000 + (index * 500),
      fuel_surcharge: 500 + (index * 50),
      insurance_cost: shipment.insurance_value ? shipment.insurance_value * 0.02 : 0,
      cod_fee: shipment.cash_on_delivery && shipment.cod_amount ? shipment.cod_amount * 0.05 : 0,
      handling_fee: 1000,
      tax_amount: 1000 + (index * 100),
      total_cost: 7500 + (index * 650),
      applicable_rate: {
        ID: index + 1,
        provider_id: shipment.provider_id || 1,
        service_type: shipment.service_type,
        origin_zone: shipment.origin_zone,
        destination_zone: shipment.destination_zone,
        base_rate: 5000 + (index * 500),
        rate_per_kg: 500,
        minimum_charge: 2000,
        fuel_surcharge_rate: 0.1,
        insurance_rate: 0.02,
        estimated_days: 3,
        effective_from: "2025-01-01",
        is_active: true
      },
      zone_multiplier: 1.0,
      weight_cost: shipment.weight * 500,
      billable_weight: shipment.weight,
      estimated_delivery_days: 3,
      estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      available_services: ["standard", "express", "overnight"],
      service_fees: {
        express: 2000,
        overnight: 5000
      },
      cost_breakdown: {
        base_rate: 5000 + (index * 500),
        weight_charges: shipment.weight * 500,
        zone_charges: 0,
        fuel_surcharge: 500 + (index * 50),
        insurance: shipment.insurance_value ? shipment.insurance_value * 0.02 : 0,
        cod_fee: shipment.cash_on_delivery && shipment.cod_amount ? shipment.cod_amount * 0.05 : 0,
        taxes: 1000 + (index * 100),
        other_fees: 1000
      }
    }))
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/bulk-calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ shipments }),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const syncAllShipmentsWithProvider = async (_providerId: number): Promise<APIResponse<{ synced_count: number; errors: string[] }>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "All shipments synced with provider successfully",
    data: {
      synced_count: 50,
      errors: [
        "Tracking number ABC123: Provider API timeout",
        "Tracking number XYZ789: Invalid status code"
      ]
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/providers/${providerId}/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};

// UNDOCUMENTED ROUTE - Mock data for UI testing
export const getProviderApiStatus = async (_providerId: number): Promise<APIResponse<{
  status: 'online' | 'offline' | 'degraded';
  last_sync: string;
  error_count: number;
  rate_limit_remaining?: number;
}>> => {
  // Mock data for UI testing
  return {
    status: "success",
    message: "Provider API status retrieved successfully",
    data: {
      status: "online",
      last_sync: new Date().toISOString(),
      error_count: 2,
      rate_limit_remaining: 950
    }
  };
  
  // Original implementation (commented out - undocumented route)
  /*
  const response = await fetch(`${baseUrl}/shipping-charges/providers/${providerId}/status`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
  */
};