import { Company } from "./company.model";
import { Franchise } from "./franchise.model";

export type UserRole = "company_moderator" | "franchise_moderator" | "orders_manager";

export interface User {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    role: UserRole;
    full_name: string;
    email: string;
    password: string;
    phone_number: string;
    company_id?: number;
    company?: Company;
    franchise_id?: number;
    franchise?: Franchise;
}