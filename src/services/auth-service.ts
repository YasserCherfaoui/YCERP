import { baseUrl } from "@/app/constants";
import { Administrator } from "@/models/data/administrator.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { AuthResponse } from "@/models/responses/auth-response.model";
import { LoginFormSchema, RegisterFormSchema } from "@/schemas/auth";
import {
    browserSupportsWebAuthn,
    startAuthentication,
    startRegistration,
    type PublicKeyCredentialCreationOptionsJSON,
    type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

export interface PasskeySummary {
    id: number;
    name: string;
    created_at: string;
    last_used_at?: string;
    transports: string[];
}

interface PasskeyCeremonyOptions<T> {
    session_id: string;
    options: T;
}

const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
});

async function throwAPIError(response: Response, fallback: string): Promise<never> {
    const errorData: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.message || fallback);
}

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

export const loginWithPasskey = async (): Promise<APIResponse<AuthResponse>> => {
    if (!browserSupportsWebAuthn()) {
        throw new Error("This browser does not support passkeys.");
    }

    const beginResponse = await fetch(`${baseUrl}/administrators/passkeys/login/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!beginResponse.ok) {
        await throwAPIError(beginResponse, "Passkey sign-in failed.");
    }
    const beginBody: APIResponse<PasskeyCeremonyOptions<PublicKeyCredentialRequestOptionsJSON>> = await beginResponse.json();
    if (!beginBody.data) {
        throw new Error("Passkey sign-in failed.");
    }

    const credential = await startAuthentication({ optionsJSON: beginBody.data.options });
    const finishResponse = await fetch(`${baseUrl}/administrators/passkeys/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: beginBody.data.session_id,
            credential,
        }),
    });
    if (!finishResponse.ok) {
        await throwAPIError(finishResponse, "Passkey sign-in failed.");
    }

    return finishResponse.json();
}

export const listPasskeys = async (): Promise<APIResponse<PasskeySummary[]>> => {
    const response = await fetch(`${baseUrl}/administrators/passkeys`, {
        method: 'GET',
        headers: authHeaders(),
    });
    if (!response.ok) {
        await throwAPIError(response, "Failed to load passkeys.");
    }
    return response.json();
}

export const registerPasskey = async (name: string): Promise<APIResponse<PasskeySummary>> => {
    if (!browserSupportsWebAuthn()) {
        throw new Error("This browser does not support passkeys.");
    }

    const beginResponse = await fetch(`${baseUrl}/administrators/passkeys/register/begin`, {
        method: 'POST',
        headers: authHeaders(),
    });
    if (!beginResponse.ok) {
        await throwAPIError(beginResponse, "Could not start passkey registration.");
    }
    const beginBody: APIResponse<PasskeyCeremonyOptions<PublicKeyCredentialCreationOptionsJSON>> = await beginResponse.json();
    if (!beginBody.data) {
        throw new Error("Could not start passkey registration.");
    }

    const credential = await startRegistration({ optionsJSON: beginBody.data.options });
    const finishResponse = await fetch(`${baseUrl}/administrators/passkeys/register/finish`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            session_id: beginBody.data.session_id,
            name,
            credential,
        }),
    });
    if (!finishResponse.ok) {
        await throwAPIError(finishResponse, "Could not register this passkey.");
    }
    return finishResponse.json();
}

export const deletePasskey = async (id: number): Promise<APIResponse<null>> => {
    const response = await fetch(`${baseUrl}/administrators/passkeys/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) {
        await throwAPIError(response, "Could not remove this passkey.");
    }
    return response.json();
}