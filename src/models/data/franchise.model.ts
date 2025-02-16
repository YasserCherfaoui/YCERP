import { Administrator } from "./administrator.model";

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
}