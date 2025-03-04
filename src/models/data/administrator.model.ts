import { Company } from "./company.model";
import { Franchise } from "./franchise.model";

export interface Administrator {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    full_name: string;
    email: string;
    companies: Company[];
  }

  export interface FranchiseAdministrator {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    administrator_id: number;
    franchise_id: number;
    franchise?: Franchise;
    full_name: string;
    email: string;
  }