import { apiFetch, buildQueryString } from "@/lib/api-fetch";
import { DeliveryEmployeePayment } from "@/models/data/delivery.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateDeliveryPaymentSchema } from "@/schemas/delivery";

export async function createDeliveryEmployeePayment(
  data: CreateDeliveryPaymentSchema
): Promise<APIResponse<DeliveryEmployeePayment>> {
  return apiFetch<DeliveryEmployeePayment>("/delivery/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listDeliveryEmployeePayments(params: {
  employee_id: number;
  start?: string;
  end?: string;
}): Promise<APIResponse<DeliveryEmployeePayment[]>> {
  const { employee_id, ...query } = params;
  const qs = buildQueryString(query as Record<string, string | number | undefined>);
  return apiFetch<DeliveryEmployeePayment[]>(`/delivery/employees/${employee_id}/payments${qs}`);
}

export interface EmployeePaymentsSumResponse {
  total_amount: number;
  count: number;
}

export async function getEmployeePaymentsSum(params: {
  company_id: number;
  start: string;
  end: string;
}): Promise<APIResponse<EmployeePaymentsSumResponse>> {
  const qs = buildQueryString(params as Record<string, string | number>);
  return apiFetch<EmployeePaymentsSumResponse>(`/delivery/reports/employee-payments-sum${qs}`);
}
