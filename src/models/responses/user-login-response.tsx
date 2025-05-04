import { User } from "@/models/data/user.model";



export interface UserLoginResponse {
   token: string;
   user: User;
}