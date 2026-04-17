import { IDataGame, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface GamesApiResponse extends IPagination {
  data: IDataGame[];
}

export type GamePayload = {
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  competition?: string;
  gameDate: string;
  betCloseAt: string;
  moreInfo?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
};

type CreateGamePayload = Pick<
  GamePayload,
  | "homeTeam"
  | "awayTeam"
  | "homeTeamLogo"
  | "awayTeamLogo"
  | "competition"
  | "gameDate"
  | "betCloseAt"
  | "moreInfo"
>;

export type GameUpdatePayload = Partial<GamePayload>;

function toApiIsoDateTime(value: string, fieldName: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} inválida`);
  }

  return parsed.toISOString();
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

function sanitizeCreateGamePayload(payload: GamePayload): CreateGamePayload {
  const competition = payload.competition?.trim();
  const moreInfo = payload.moreInfo?.trim();
  const homeTeamLogo = payload.homeTeamLogo?.trim();
  const awayTeamLogo = payload.awayTeamLogo?.trim();

  return {
    homeTeam: payload.homeTeam,
    awayTeam: payload.awayTeam,
    homeTeamLogo: homeTeamLogo ? homeTeamLogo : undefined,
    awayTeamLogo: awayTeamLogo ? awayTeamLogo : undefined,
    gameDate: toApiIsoDateTime(payload.gameDate, "Data do jogo"),
    betCloseAt: toApiIsoDateTime(payload.betCloseAt, "Data de fechamento"),
    competition: competition ? competition : undefined,
    moreInfo: moreInfo ? moreInfo : undefined,
  };
}

function sanitizeUpdateGamePayload(
  payload: GameUpdatePayload,
): GameUpdatePayload {
  const sanitizedPayload: GameUpdatePayload = {
    ...payload,
  };

  if (payload.gameDate) {
    sanitizedPayload.gameDate = toApiIsoDateTime(
      payload.gameDate,
      "Data do jogo",
    );
  }

  if (payload.betCloseAt) {
    sanitizedPayload.betCloseAt = toApiIsoDateTime(
      payload.betCloseAt,
      "Data de fechamento",
    );
  }

  if (typeof payload.homeTeamLogo === "string") {
    const homeTeamLogo = payload.homeTeamLogo.trim();
    sanitizedPayload.homeTeamLogo = homeTeamLogo ? homeTeamLogo : undefined;
  }

  if (typeof payload.awayTeamLogo === "string") {
    const awayTeamLogo = payload.awayTeamLogo.trim();
    sanitizedPayload.awayTeamLogo = awayTeamLogo ? awayTeamLogo : undefined;
  }

  return sanitizedPayload;
}

export async function getGames(
  page: number,
  startDate?: string,
  endDate?: string,
  limit?: number,
): Promise<GamesApiResponse> {
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

  const url = `${getApiBaseUrl()}/games?${params.toString()}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch games");
  return (await response.json()) as GamesApiResponse;
}

export async function getGameById(gameId: string): Promise<IDataGame> {
  const response = await fetch(`${getApiBaseUrl()}/games/${gameId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to fetch game ${gameId}`);
  return (await response.json()) as IDataGame;
}

export async function createGame(payload: GamePayload): Promise<void> {
  const createPayload = sanitizeCreateGamePayload(payload);

  const response = await fetch(`${getApiBaseUrl()}/games`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Failed to create game");
  }
}

export async function updateGameById(
  gameId: string,
  payload: GameUpdatePayload,
): Promise<void> {
  const updatePayload = sanitizeUpdateGamePayload(payload);

  const response = await fetch(`${getApiBaseUrl()}/games/${gameId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatePayload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Failed to update game ${gameId}`);
  }
}
