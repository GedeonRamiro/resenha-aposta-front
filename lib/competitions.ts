import { getApiBaseUrl } from "@/lib/api-base-url";
import { IPagination } from "@/types/types";

export type Competition = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CompetitionsApiResponse = IPagination & {
  data: Competition[];
};

export async function getCompetitions(
  page: number,
  limit = 10,
): Promise<CompetitionsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/competitions?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Falha ao carregar competições");
  }

  return (await response.json()) as CompetitionsApiResponse;
}

export async function getAllCompetitions(limit = 200): Promise<Competition[]> {
  const response = await getCompetitions(1, limit);
  return response.data;
}

export async function getCompetitionsSafe(): Promise<Competition[]> {
  try {
    return await getAllCompetitions();
  } catch {
    return [];
  }
}

export type CreateCompetitionPayload = {
  name: string;
  logoUrl?: string;
};

export type UpdateCompetitionPayload = Partial<CreateCompetitionPayload>;

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

export async function createCompetition(
  payload: CreateCompetitionPayload,
): Promise<Competition> {
  const response = await fetch(`${getApiBaseUrl()}/competitions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Falha ao criar competição");
  }

  return (await response.json()) as Competition;
}

export async function getCompetitionById(
  competitionId: string,
): Promise<Competition> {
  const response = await fetch(
    `${getApiBaseUrl()}/competitions/${competitionId}`,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Falha ao carregar competição ${competitionId}`);
  }

  return (await response.json()) as Competition;
}

export async function updateCompetitionById(
  competitionId: string,
  payload: UpdateCompetitionPayload,
): Promise<Competition> {
  const response = await fetch(
    `${getApiBaseUrl()}/competitions/${competitionId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details || `Falha ao atualizar competição ${competitionId}`,
    );
  }

  return (await response.json()) as Competition;
}
