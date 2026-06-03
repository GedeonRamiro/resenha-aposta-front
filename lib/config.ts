import { getApiBaseUrl } from "@/lib/api-base-url";

export const APP_CONFIG_UPDATED_EVENT = "app-config-updated";

export interface RankingSeason {
  slug: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface AppConfig {
  id: string;
  betCloseMinutesBefore: number;
  rankingSeasons: RankingSeason[];
  updatedAt: string;
}

export interface UpdateConfigPayload {
  betCloseMinutesBefore: number;
  rankingSeasons: RankingSeason[];
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") return headers;

  const token = window.localStorage.getItem("backendAuthToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getConfig(): Promise<AppConfig> {
  const response = await fetch(`${getApiBaseUrl()}/config`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Falha ao buscar configurações");
  return (await response.json()) as AppConfig;
}

export async function updateConfig(
  payload: UpdateConfigPayload,
): Promise<AppConfig> {
  const response = await fetch(`${getApiBaseUrl()}/config`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao salvar configurações");
  return (await response.json()) as AppConfig;
}

export function emitAppConfigUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(APP_CONFIG_UPDATED_EVENT));
}
