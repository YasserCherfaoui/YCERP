import { baseUrl } from "@/app/constants";
import { User } from "@/models/data/user.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateUserSchema } from "@/schemas/iam";



export const createUser = async (data: CreateUserSchema): Promise<APIResponse<User>> => {
    const response = await fetch(`${baseUrl}/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("authToken"),

        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product.");
    }
    const user: APIResponse<User> = await response.json();
    return user;

}

export const getUsersByCompany = async (companyID: number): Promise<APIResponse<User[]>> => {
    const response = await fetch(`${baseUrl}/users/${companyID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("authToken"),
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users.");
    }
    const users: APIResponse<User[]> = await response.json();
    return users;
}

export const deleteUser = async (userID: number): Promise<APIResponse<void>> => {
    const response = await fetch(`${baseUrl}/users/${userID}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("authToken"),
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user.");
    }
    const user: APIResponse<void> = await response.json();
    return user;
}