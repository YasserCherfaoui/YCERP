import { Administrator, FranchiseAdministrator } from "./administrator.model";
import { EntryBill } from "./bill.model";
import { Company } from "./company.model";
import { Inventory } from "./inventory.model";
import { Sale } from "./sale.model";

export type FranchiseType = "normal" | "vip";

export const FRANCHISE_TYPES = {
    NORMAL: "normal" as const,
    VIP: "vip" as const,
} as const;

export interface Franchise {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    address: string;
    city: string;
    state: string;
    franchise_type: FranchiseType;
    /** When true, franchise portal shows blocking pending-order alerts. */
    require_order_alert?: boolean;
    company_id: number;
    company?: Company;
    inventory: Inventory;
    sales: Sale[];
    administrators: Administrator[];
    franchise_administrators: FranchiseAdministrator[];
    entry_bills: EntryBill[];
    payments: FranchisePayment[];
}

export interface FranchisePayment {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    franchise_id: number;
    franchise?: Franchise;
    company_id: number;
    company?: Company;
    administrator_id: number;
    administrator?: Administrator;
    amount: number;
    comment: string;
}

export interface FranchiseTransactionLog {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    company_id: number;
    company?: Company;
    franchise_id: number;
    franchise?: Franchise;
    administrator_id: number;
    administrator?: Administrator;
    transaction_type: string;
    reference_id: number;
    reference_type: string;
    amount_change: number;
    total_before: number;
    paid_before: number;
    due_before: number;
    total_after: number;
    paid_after: number;
    due_after: number;
    comment: string;
}

export interface FranchiseTotals {
    totals: {
        total: number;
        paid: number;
        due: number;
    };
    latest_transaction: FranchiseTransactionLog;
    recent_payments: FranchisePayment[];
}

/** GET /franchise/sales/totals/:franchise_id */
export interface FranchiseSalesTotals {
    total_amount: number;
    total_franchise_price: number;
    total_benefit: number;
    total_exchanges_amount: number;
    total_returns_amount: number;
    sales_count?: number;
    sales_amount?: number;
    returns_count?: number;
    returns_amount?: number;
    exchanges_count?: number;
    exchanges_amount?: number;
    refunds_count?: number;
    refunds_amount?: number;
    start_date?: string;
    end_date?: string;
}