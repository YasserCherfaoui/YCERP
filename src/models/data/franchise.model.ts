import { Administrator, FranchiseAdministrator } from "./administrator.model";
import { EntryBill } from "./bill.model";
import { Company } from "./company.model";
import { Inventory } from "./inventory.model";
import { Sale } from "./sale.model";

export interface Franchise {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    address: string;
    city: string;
    state: string;
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