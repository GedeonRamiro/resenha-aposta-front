import { IDataBet, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface BetsApiResponse extends IPagination {
  data: IDataBet[];
}

export type ApiBetOption = "HOME_WIN" | "DRAW" | "AWAY_WIN";

export type UserBetSummary = {
  id: string;
  userId: string;
  gameId: string;
  option: ApiBetOption;
  createdAt: string;
  updatedAt: string;
};

export type CreateBetPayload = {
  userId: string;
  gameId: string;
  option: ApiBetOption;
};

export type UpdateBetPayload = {
  option: ApiBetOption;
};

export function getBetResultLabel(bet: IDataBet): "GREEN" | "RED" | null {
  if (bet.game.status !== "FINISHED") {
    return null;
  }

  if (typeof bet.isCorrect === "boolean") {
    return bet.isCorrect ? "GREEN" : "RED";
  }

  if (bet.game.homeScore === null || bet.game.awayScore === null) {
    return null;
  }

  const result =
    bet.game.homeScore > bet.game.awayScore
      ? "HOME_WIN"
      : bet.game.homeScore < bet.game.awayScore
        ? "AWAY_WIN"
        : "DRAW";

  return bet.option === result ? "GREEN" : "RED";
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

export async function getBets(
  page: number,
  startDate?: string,
  endDate?: string,
  limit?: number,
): Promise<BetsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }

  if (startDate && endDate) {
    params.set("startDate", startDate);
    params.set("endDate", endDate);
  }

  const url = `${getApiBaseUrl()}/bets?${params.toString()}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch bets");
  return (await response.json()) as BetsApiResponse;
}

export async function getBetById(betId: string): Promise<IDataBet> {
  const response = await fetch(`${getApiBaseUrl()}/bets/${betId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bet ${betId}`);
  }

  return (await response.json()) as IDataBet;
}

export async function getBetsByUser(userId: string): Promise<UserBetSummary[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/bets/user/${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user bets for ${userId}`);
  }

  return (await response.json()) as UserBetSummary[];
}

export async function createBet(payload: CreateBetPayload): Promise<IDataBet> {
  const response = await fetch(`${getApiBaseUrl()}/bets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Failed to create bet");
  }

  return (await response.json()) as IDataBet;
}

export async function updateBetById(
  betId: string,
  payload: UpdateBetPayload,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/bets/${betId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Failed to update bet ${betId}`);
  }
}
