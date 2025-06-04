

type CreateOrdersFromCSVResponse = {
  created: number;
  skipped: number;
  skipped_rows: Array<{ error: string; row: string }>;
}

export type { CreateOrdersFromCSVResponse };
