import { apiFetch } from "@/lib/api-fetch";

export type EmployeeCollectionsResponse = {
  sum_total_collected: number;
  sum_net: number;
  sum_delivery_cost: number;
};

export async function getEmployeeCollections(params: { start?: string; end?: string; employee_id: number }): Promise<EmployeeCollectionsResponse> {
  const qs = new URLSearchParams();
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  qs.set("employee_id", String(params.employee_id));
  const res = await apiFetch<EmployeeCollectionsResponse>(`/delivery/reports/employee-collections?${qs.toString()}`);
  return res.data as EmployeeCollectionsResponse;
}
