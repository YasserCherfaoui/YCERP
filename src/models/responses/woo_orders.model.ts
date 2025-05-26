import { WooOrder } from "@/models/data/woo-order.model";
import { PaginationMeta } from "@/models/responses/company-stats.model";


export interface WooOrdersResponse {
    orders: WooOrder[];
    meta: PaginationMeta;
}