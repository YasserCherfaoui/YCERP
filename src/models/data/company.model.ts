import { Administrator } from "./administrator.model";
import { Franchise } from "./franchise.model";
import { Product } from "./product.model";

export interface Company {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    company_name: string;
    address: string;
    administrators: Administrator[];
    franchises?: Franchise[];
    products?: Product[];
}