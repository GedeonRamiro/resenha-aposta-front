import { IDataUser, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface UsersApiResponse extends IPagination {
  data: IDataUser[];
}

export type UserRole = "ADMIN" | "MODERATOR" | "PLAYER" | "PENDING";

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MODERATOR: "Moderador",
  PLAYER: "Jogador",
  PENDING: "Pendente",
};

export function getUserRoleLabel(role?: string | null): string {
  if (!role) {
    return "-";
  }

  if (role in USER_ROLE_LABEL) {
    return USER_ROLE_LABEL[role as UserRole];
  }

  return role;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") {
    return headers;
  }

  const token = window.localStorage.getItem("backendAuthToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getUsers(page: number): Promise<UsersApiResponse> {
  const response = await fetch(`${getApiBaseUrl()}/users?page=${page}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return (await response.json()) as UsersApiResponse;
}

export async function getUserById<T = IDataUser>(userId: string): Promise<T> {
  const response = await fetch(
    `${getApiBaseUrl()}/users/${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error(String(response.status));
  return (await response.json()) as T;
}

export async function updateUserRoleById(
  userId: string,
  role: UserRole,
): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl()}/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details || "Não foi possível atualizar o perfil do usuário",
    );
  }
}
