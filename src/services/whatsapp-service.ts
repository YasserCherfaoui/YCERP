import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";

export interface TemplateParameter {
    type: "text" | "currency" | "date_time" | "image" | "document" | "video";
    text?: string;
    currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
    };
    date_time?: {
        fallback_value: string;
    };
    image?: {
        link: string;
    };
    document?: {
        link: string;
        filename?: string;
    };
    video?: {
        link: string;
    };
}

export interface TemplateComponent {
    type: "body" | "header" | "button";
    parameters?: TemplateParameter[];
    sub_type?: "url" | "quick_reply";
    index?: number;
}

export interface SendWhatsAppMessageRequest {
    phone_number: string;
    message_type: "text" | "template";
    // For text messages
    message?: string;
    // For template messages
    template_name?: string;
    language_code?: string;
    components?: TemplateComponent[];
}

export interface SendWhatsAppMessageResponse {
    phone_number: string;
    message_type: string;
}

export interface BulkSendWhatsAppMessageRequest {
    phone_numbers: string[];
    message_type: "text" | "template";
    // For text messages
    message?: string;
    // For template messages
    template_name?: string;
    language_code?: string;
    components?: TemplateComponent[];
}

export interface MessageResult {
    phone_number: string;
    success: boolean;
    error?: string;
}

export interface BulkSendWhatsAppMessageResponse {
    total: number;
    success_count: number;
    failure_count: number;
    results: MessageResult[];
}

export interface WhatsAppTemplate {
    name: string;
    language: string;
    status: string;
    category: string;
    components: TemplateComponentInfo[];
}

export interface TemplateComponentInfo {
    type: "BODY" | "HEADER" | "FOOTER" | "BUTTONS";
    text?: string;
    format?: string;
    buttons?: TemplateButton[];
    example?: {
        header_text?: string[];
        header_handle?: string[];
        body_text?: string[][];
    };
}

export interface TemplateButton {
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
    text: string;
    url?: string;
    phone_number?: string;
}

export async function sendWhatsAppMessage(
    data: SendWhatsAppMessageRequest
): Promise<APIResponse<SendWhatsAppMessageResponse>> {
    const response = await fetch(`${baseUrl}/administrators/whatsapp/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send WhatsApp message");
    }

    const apiResponse: APIResponse<SendWhatsAppMessageResponse> = await response.json();
    return apiResponse;
}

export async function getWhatsAppTemplates(): Promise<APIResponse<WhatsAppTemplate[]>> {
    const response = await fetch(`${baseUrl}/administrators/whatsapp/templates`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch WhatsApp templates");
    }

    const apiResponse: APIResponse<WhatsAppTemplate[]> = await response.json();
    return apiResponse;
}

export async function getWhatsAppTemplateDetails(
    templateName: string,
    languageCode: string
): Promise<APIResponse<WhatsAppTemplate>> {
    const response = await fetch(
        `${baseUrl}/administrators/whatsapp/templates/details?template_name=${encodeURIComponent(templateName)}&language_code=${encodeURIComponent(languageCode)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch template details");
    }

    const apiResponse: APIResponse<WhatsAppTemplate> = await response.json();
    return apiResponse;
}

export interface ParameterMapping {
    parameter_index: number;
    path: string;
    component_type?: "header" | "body"; // Optional for backward compatibility, defaults to "body"
}

export interface AvailablePath {
    path: string;
    label: string;
    description: string;
}

export interface WhatsAppSettings {
    id: number;
    company_id: number;
    action: string;
    template_name: string;
    language_code: string;
    enabled: boolean;
    parameter_mappings?: ParameterMapping[];
    created_at: string;
    updated_at: string;
}

export interface UpdateWhatsAppSettingsRequest {
    action: string;
    template_name: string;
    language_code: string;
    enabled: boolean;
    parameter_mappings?: ParameterMapping[];
}

export async function getWhatsAppAvailablePaths(action: string): Promise<APIResponse<AvailablePath[]>> {
    const response = await fetch(
        `${baseUrl}/administrators/whatsapp-settings/available-paths?action=${encodeURIComponent(action)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch available paths");
    }

    const apiResponse: APIResponse<AvailablePath[]> = await response.json();
    return apiResponse;
}

export async function getWhatsAppSettings(companyId: number): Promise<APIResponse<WhatsAppSettings[]>> {
    const response = await fetch(`${baseUrl}/administrators/companies/${companyId}/whatsapp-settings`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch WhatsApp settings");
    }

    const apiResponse: APIResponse<WhatsAppSettings[]> = await response.json();
    return apiResponse;
}

export async function updateWhatsAppSettings(
    companyId: number,
    data: UpdateWhatsAppSettingsRequest
): Promise<APIResponse<WhatsAppSettings>> {
    const response = await fetch(`${baseUrl}/administrators/companies/${companyId}/whatsapp-settings`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update WhatsApp settings");
    }

    const apiResponse: APIResponse<WhatsAppSettings> = await response.json();
    return apiResponse;
}

export async function bulkSendWhatsAppMessage(
    data: BulkSendWhatsAppMessageRequest
): Promise<APIResponse<BulkSendWhatsAppMessageResponse>> {
    const response = await fetch(`${baseUrl}/administrators/whatsapp/bulk-send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send bulk WhatsApp messages");
    }

    const apiResponse: APIResponse<BulkSendWhatsAppMessageResponse> = await response.json();
    return apiResponse;
}
