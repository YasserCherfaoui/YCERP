import { baseUrl } from "@/app/constants";
import { Administrator } from "@/models/data/administrator.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { AuthResponse } from "@/models/responses/auth-response.model";
import { LoginFormSchema, RegisterFormSchema } from "@/schemas/auth";

export const registerUser = async (userData: RegisterFormSchema): Promise<APIResponse<AuthResponse>> => {
    const response = await fetch(
        `${baseUrl}/administrators`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Register failed.");
    }

    const apiResponse: APIResponse<AuthResponse> = await response.json();
    return apiResponse; // Return the API response
}

export const loginUser = async (userData: LoginFormSchema): Promise<APIResponse<AuthResponse>> => {
    const response = await fetch(`${baseUrl}/administrators/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed.");
    }

    const apiResponse: APIResponse<AuthResponse> = await response.json();
    return apiResponse; // Return the API response
}

export const fetchUser = async (token: string): Promise<APIResponse<Administrator>> => {
    const response = await fetch(`${baseUrl}/administrators/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user.");
    }

    const apiResponse: APIResponse<Administrator> = await response.json();
    return apiResponse;

}