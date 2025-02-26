import { FranchiseAdministrator } from "../data/administrator.model";

export interface MyFranchiseAuthResponse {
    token: string;
    user: FranchiseAdministrator;
}