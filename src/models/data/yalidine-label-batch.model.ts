export type YalidineLabelBatchStatus =
  | "pending_upload"
  | "ready"
  | "failed"
  | "downloaded";

export interface YalidineLabelBatch {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  created_by_user_id: number;
  gcs_object_path: string;
  import_id?: number | null;
  parcel_count: number;
  tracking_numbers: string[];
  woo_order_ids: number[];
  status: YalidineLabelBatchStatus;
  upload_error?: string;
  downloaded_at?: string | null;
  downloaded_by_user_id?: number | null;
}

export interface PendingYalidineLabelBatchesResponse {
  batches: YalidineLabelBatch[];
  pending_count: number;
  ready_count: number;
}
