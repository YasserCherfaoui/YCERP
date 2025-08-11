import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";

type QueryRecord = Record<string, string | number | boolean | null | undefined>;

export function buildQueryString(params: QueryRecord): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) =>
      Array.isArray(value)
        ? (value as unknown[])
            .filter((v) => v !== undefined && v !== null && v !== "")
            .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
            .join("&")
        : `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .filter(Boolean)
    .join("&");
  return query ? `?${query}` : "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });

  // Try to parse the envelope; if parsing fails, throw a generic error
  let envelope: APIResponse<T> | null = null;
  try {
    envelope = (await response.json()) as APIResponse<T>;
  } catch (error) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new Error("Malformed server response");
  }

  if (!response.ok || !envelope || envelope.status === "error") {
    const errorMessage = envelope?.error?.description || envelope?.message || `Request failed`;
    throw new Error(errorMessage);
  }

  return envelope;
}


