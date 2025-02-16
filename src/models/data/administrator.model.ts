import { Company } from "./company.model";

export interface Administrator {
    id: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    full_name: string;
    email: string;
    companies: Company[];
  }