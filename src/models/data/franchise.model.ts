import { Administrator, FranchiseAdministrator } from "./administrator.model";
import { Company } from "./company.model";

export interface Franchise {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    address:string;
    city: string;
    state: string;
    administrators: Administrator[];
    franchise_administrators: FranchiseAdministrator[];
    company_id:number;
    company?:Company;
}
