import type { InventoryShortfallItem } from "../data/missing-variant.model";

export interface APIError {
    code: string;
    description: string;
    details?: {
      shortfalls?: InventoryShortfallItem[];
    };
  }
  
  export interface APIResponse<T> {
    status: string;
    message: string;
    data?: T;
    error?: APIError;
  }