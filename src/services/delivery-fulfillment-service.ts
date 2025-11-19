import { apiFetch } from "@/lib/api-fetch";
import { WooOrder } from "@/models/data/woo-order.model";
import { DeliveryFulfillmentRequest } from "@/models/requests/delivery-fulfillment-request";
import { DailyTotalsResponse, DeliveredOrderItemRow, UnpaidFeeRow } from "@/models/responses/delivery-reports.model";

export async function submitFulfillment(payload: DeliveryFulfillmentRequest): Promise<WooOrder> {
  const res = await apiFetch<WooOrder>("/delivery/employee/fulfillment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function getDeliveredItems(employeeId: number, dateISO: string): Promise<DeliveredOrderItemRow[]> {
  const res = await apiFetch<DeliveredOrderItemRow[]>(`/delivery/reports/delivered-items?employee_id=${employeeId}&date=${encodeURIComponent(dateISO)}`);
  return res.data || [];
}

export async function getDailyTotals(dateISO: string, employeeId?: number): Promise<DailyTotalsResponse> {
  const qs = new URLSearchParams({ date: dateISO });
  if (employeeId != null) qs.set("employee_id", String(employeeId));
  const res = await apiFetch<DailyTotalsResponse>(`/delivery/reports/daily-totals?${qs.toString()}`);
  return res.data || {};
}

export async function getUnpaidFees(dateISO: string, employeeId?: number): Promise<UnpaidFeeRow[]> {
  const qs = new URLSearchParams({ date: dateISO });
  if (employeeId != null) qs.set("employee_id", String(employeeId));
  const res = await apiFetch<UnpaidFeeRow[]>(`/delivery/reports/unpaid-fees?${qs.toString()}`);
  return res.data || [];
}

export interface DeliveredOrderItem {
  ID: number;
  WooOrderID: number;
  ConfirmedOrderItemID: number;
  ProductVariantID: number;
  QuantityDelivered: number;
  UnitPriceAtDelivery: number;
  DeliveredByEmployeeID: number;
  DeliveredAt: string;
  Notes: string;
}

export async function getDeliveredItemsByOrder(orderId: number): Promise<DeliveredOrderItem[]> {
  const res = await apiFetch<DeliveredOrderItem[]>(`/delivery/orders/${orderId}/delivered-items`);
  return res.data || [];
}
