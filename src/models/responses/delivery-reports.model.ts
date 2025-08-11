import { WooOrder } from "@/models/data/woo-order.model";

export type DeliveredOrderItemRow = {
  id: number;
  woo_order_id: number;
  confirmed_order_item_id: number;
  product_variant_id: number;
  quantity_delivered: number;
  unit_price_at_delivery: number;
  delivered_by_employee_id: number;
  delivered_at: string;
  notes?: string;
  woo_order?: WooOrder;
};

export type DailyTotalsRow = {
  orders_fully_delivered: number;
  orders_partially_delivered: number;
  items_delivered_total: number;
  fees_collected_total: number;
  unpaid_fees: number;
  total: number;
};

export type DailyTotalsResponse = Record<string, DailyTotalsRow>;

export type UnpaidFeeRow = { order_id: number; employee_id?: number | null; amount: number };
