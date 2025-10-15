import { InventoryItem } from "./inventory.model";

export type AlertType = "out_of_stock" | "low_stock" | "reorder_point" | "overstock";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type LocationType = "company" | "franchise";

export interface StockAlert {
  id: number;
  inventory_item_id: number;
  alert_type: AlertType;
  threshold: number;
  current_quantity: number;
  status: AlertStatus;
  notified_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  company_id?: number | null;
  franchise_id?: number | null;
  location_type: LocationType;
  created_at: string;
  updated_at: string;
  inventory_item?: InventoryItem;
}

export interface StockAlertConfig {
  id?: number;
  location_type: LocationType;
  company_id?: number | null;
  franchise_id?: number | null;
  low_stock_threshold: number;
  reorder_point: number;
  overstock_threshold?: number | null;
  enable_email_alerts: boolean;
  enable_in_app_alerts: boolean;
  email_recipients: string[] | string;
  created_at?: string;
  updated_at?: string;
}

export interface StockAlertNotification {
  id: number;
  stock_alert_id: number;
  recipient_type: string;
  recipient_id: number;
  recipient_email: string;
  notification_type: "in_app" | "email";
  status: "pending" | "sent" | "failed";
  sent_at?: string | null;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
  stock_alert?: StockAlert;
}

export interface StockAlertsPagination {
  total: number;
  limit: number;
  offset: number;
}

