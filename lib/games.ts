import { IDataGame, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface GamesApiResponse extends IPagination {
  data: IDataGame[];
}

export type GamePayload = {
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  competition?: string;
  competitionId?: string;
  gameDate: string;
  gameType?: "LEAGUE_GROUP" | "KNOCKOUT";
  tieId?: string;
  tieLegsCount?: number;
  legNumber?: number;
  moreInfo?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
};

type CreateGamePayload = Pick<
  GamePayload,
  | "homeTeam"
  | "awayTeam"
  | "homeTeamId"
  | "awayTeamId"
  | "homeTeamLogo"
  | "awayTeamLogo"
  | "competition"
  | "competitionId"
  | "gameDate"
  | "gameType"
  | "tieId"
  | "tieLegsCount"
  | "legNumber"
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
  const tieId = payload.tieId?.trim();
  const homeTeamId = payload.homeTeamId?.trim();
  const awayTeamId = payload.awayTeamId?.trim();
  const competitionId = payload.competitionId?.trim();
  const gameType = payload.gameType ?? "LEAGUE_GROUP";

  return {
    homeTeam: payload.homeTeam,
    awayTeam: payload.awayTeam,
    homeTeamId: homeTeamId ? homeTeamId : undefined,
    awayTeamId: awayTeamId ? awayTeamId : undefined,
    homeTeamLogo: homeTeamLogo ? homeTeamLogo : undefined,
    awayTeamLogo: awayTeamLogo ? awayTeamLogo : undefined,
    competitionId: competitionId ? competitionId : undefined,
    gameDate: toApiIsoDateTime(payload.gameDate, "Data do jogo"),
    gameType,
    tieId: gameType === "KNOCKOUT" && tieId ? tieId : undefined,
    tieLegsCount:
      gameType === "KNOCKOUT" ? (payload.tieLegsCount ?? 1) : undefined,
    legNumber: gameType === "KNOCKOUT" ? payload.legNumber : undefined,
    competition: competition ? competition : undefined,
    moreInfo: moreInfo ? moreInfo : undefined,
  };
}

function sanitizeUpdateGamePayload(
  payload: GameUpdatePayload,
): GameUpdatePayload {
  const gameType = payload.gameType;
  const tieId =
    typeof payload.tieId === "string" ? payload.tieId.trim() : undefined;

  const sanitizedPayload: GameUpdatePayload = {
    ...payload,
    tieId: tieId ? tieId : undefined,
    homeTeamId:
      typeof payload.homeTeamId === "string" && payload.homeTeamId.trim()
        ? payload.homeTeamId.trim()
        : undefined,
    awayTeamId:
      typeof payload.awayTeamId === "string" && payload.awayTeamId.trim()
        ? payload.awayTeamId.trim()
        : undefined,
    competitionId:
      typeof payload.competitionId === "string" && payload.competitionId.trim()
        ? payload.competitionId.trim()
        : undefined,
  };

  if (payload.gameDate) {
    sanitizedPayload.gameDate = toApiIsoDateTime(
      payload.gameDate,
      "Data do jogo",
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

  if (gameType && gameType !== "KNOCKOUT") {
    sanitizedPayload.tieId = undefined;
    sanitizedPayload.tieLegsCount = undefined;
    sanitizedPayload.legNumber = undefined;
    sanitizedPayload.penaltyHomeScore = undefined;
    sanitizedPayload.penaltyAwayScore = undefined;
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
