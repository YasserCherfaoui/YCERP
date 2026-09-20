export type YalidineParcelLabelStatus =
  | "pending_upload"
  | "ready"
  | "failed"
  | "downloaded";

export interface YalidineParcelLabel {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  created_by_user_id: number;
  woo_order_id: number;
  tracking_number: string;
  gcs_object_path: string;
  status: YalidineParcelLabelStatus;
  upload_error?: string;
  downloaded_at?: string | null;
  downloaded_by_user_id?: number | null;
}

export interface PendingYalidineParcelLabelsResponse {
  labels: YalidineParcelLabel[];
  pending_count: number;
  ready_count: number;
}

export interface DownloadedYalidineLabelGroup {
  date: string;
  count: number;
  labels: YalidineParcelLabel[];
}

export interface DownloadedYalidineParcelLabelsResponse {
  groups: DownloadedYalidineLabelGroup[];
  total: number;
}

export type MergeYalidineParcelLabelsRequest =
  | { pending_all: true }
  | { ids: number[] }
  | { downloaded_date: string };
