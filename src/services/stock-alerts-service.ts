import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import {
    AlertStatus,
    LocationType,
    StockAlert,
    StockAlertConfig,
    StockAlertNotification,
    StockAlertsPagination,
} from "@/models/data/stock-alert.model";
import { APIResponse } from "@/models/responses/api-response.model";

// Get alert configuration for a location
export const getAlertConfig = async (
  locationType: LocationType,
  locationId: number
): Promise<APIResponse<StockAlertConfig>> => {
  const query = buildQueryString({
    location_type: locationType,
    location_id: locationId,
  });
  return apiFetch<StockAlertConfig>(`/stock-alerts/config${query}`);
};

// Create or update alert configuration
export const saveAlertConfig = async (
  config: Omit<StockAlertConfig, "id" | "created_at" | "updated_at">
): Promise<APIResponse<StockAlertConfig>> => {
  return apiFetch<StockAlertConfig>("/stock-alerts/config", {
    method: "POST",
    body: JSON.stringify(config),
  });
};

// Get default configuration
export const getDefaultConfig = async (): Promise<
  APIResponse<Omit<StockAlertConfig, "id" | "location_type" | "company_id" | "franchise_id">>
> => {
  return apiFetch("/stock-alerts/config/defaults");
};

// Get active alerts
export const getActiveAlerts = async (params?: {
  company_id?: number;
  franchise_id?: number;
  limit?: number;
  offset?: number;
}): Promise<APIResponse<StockAlert[]> & { pagination?: StockAlertsPagination }> => {
  const query = buildQueryString(params || {});
  return apiFetch<StockAlert[]>(`/stock-alerts/active${query}`);
};

// Get alert history
export const getAlertHistory = async (params?: {
  company_id?: number;
  franchise_id?: number;
  status?: AlertStatus;
  limit?: number;
  offset?: number;
}): Promise<APIResponse<StockAlert[]> & { pagination?: StockAlertsPagination }> => {
  const query = buildQueryString(params || {});
  return apiFetch<StockAlert[]>(`/stock-alerts/history${query}`);
};

// Acknowledge an alert
export const acknowledgeAlert = async (
  alertId: number
): Promise<APIResponse<{ message: string }>> => {
  return apiFetch(`/stock-alerts/${alertId}/acknowledge`, {
    method: "PUT",
  });
};

// Resolve an alert
export const resolveAlert = async (
  alertId: number
): Promise<APIResponse<{ message: string }>> => {
  return apiFetch(`/stock-alerts/${alertId}/resolve`, {
    method: "PUT",
  });
};

// Manual check alerts (admin only)
export const manualCheckAlerts = async (): Promise<
  APIResponse<{ message: string }>
> => {
  return apiFetch("/stock-alerts/check", {
    method: "POST",
  });
};

// Get in-app notifications
export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<APIResponse<StockAlertNotification[]> & { pagination?: StockAlertsPagination }> => {
  const query = buildQueryString(params || {});
  return apiFetch<StockAlertNotification[]>(`/stock-alerts/notifications${query}`);
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: number
): Promise<APIResponse<{ message: string }>> => {
  return apiFetch(`/stock-alerts/notifications/${notificationId}/read`, {
    method: "PUT",
  });
};

// Get unread notification count
export const getUnreadCount = async (): Promise<
  APIResponse<{ unread_count: number }>
> => {
  return apiFetch("/stock-alerts/notifications/unread-count");
};

