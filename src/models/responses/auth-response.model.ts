import { Administrator } from "../data/administrator.model";

export interface AuthResponse {
    token: string;
    user: Administrator;
}