import { getApiBaseUrl } from "@/lib/api-base-url";
import { IPagination } from "@/types/types";

export type Team = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TeamsApiResponse = IPagination & {
  data: Team[];
};

export async function getTeams(
  page: number,
  limit = 10,
): Promise<TeamsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/teams?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Falha ao carregar times");
  }

  return (await response.json()) as TeamsApiResponse;
}

export async function getAllTeams(limit = 200): Promise<Team[]> {
  const response = await getTeams(1, limit);
  return response.data;
}

export async function getTeamsSafe(): Promise<Team[]> {
  try {
    return await getAllTeams();
  } catch {
    return [];
  }
}

export type CreateTeamPayload = {
  name: string;
  logoUrl?: string;
};

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

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

export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  const response = await fetch(`${getApiBaseUrl()}/teams`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Falha ao criar time");
  }

  return (await response.json()) as Team;
}

export async function getTeamById(teamId: string): Promise<Team> {
  const response = await fetch(`${getApiBaseUrl()}/teams/${teamId}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar time ${teamId}`);
  }

  return (await response.json()) as Team;
}

export async function updateTeamById(
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<Team> {
  const response = await fetch(`${getApiBaseUrl()}/teams/${teamId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Falha ao atualizar time ${teamId}`);
  }

  return (await response.json()) as Team;
}
