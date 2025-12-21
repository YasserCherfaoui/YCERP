export interface ManagerStatusCount {
  manager_id: number;
  manager_name: string;
  manager_email: string;
  status_counts: { status: string; count: number }[];
  total_orders: number;
}

export interface ManagerOrderStatusCountData {
  managers: ManagerStatusCount[];
  date_from: string;
  date_to: string;
  wilaya?: string;
  shipping_provider?: string;
  company_id?: number;
}

export interface ManagerOrderStatusCountResponse {
  status: string;
  message: string;
  data: ManagerOrderStatusCountData;
}








