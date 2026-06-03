import { IDataGame, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface GamesApiResponse extends IPagination {
  data: IDataGame[];
}

export type GamePayload = {
  homeTeamId?: string;
  awayTeamId?: string;
  competitionId?: string;
  gameDate: string;
  gameType?: "LEAGUE_GROUP" | "KNOCKOUT";
  moreInfo?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  secondLegHomeScore?: number;
  secondLegAwayScore?: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
};

type CreateGamePayload = Pick<
  GamePayload,
  | "homeTeamId"
  | "awayTeamId"
  | "competitionId"
  | "gameDate"
  | "gameType"
  | "moreInfo"
  | "homeScore"
  | "awayScore"
  | "secondLegHomeScore"
  | "secondLegAwayScore"
> & {
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
};

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
  const moreInfo = payload.moreInfo?.trim();
  const homeTeamId = payload.homeTeamId?.trim();
  const awayTeamId = payload.awayTeamId?.trim();
  const competitionId = payload.competitionId?.trim();
  const gameType = payload.gameType ?? "LEAGUE_GROUP";
  const isKnockout = gameType === "KNOCKOUT";

  if (!homeTeamId || !awayTeamId || !competitionId) {
    throw new Error("Selecione time da casa, time visitante e competição.");
  }

  return {
    homeTeamId,
    awayTeamId,
    competitionId,
    gameDate: toApiIsoDateTime(payload.gameDate, "Data do jogo"),
    gameType: isKnockout ? "KNOCKOUT" : "LEAGUE_GROUP",
    moreInfo: moreInfo ? moreInfo : undefined,
    homeScore: payload.homeScore,
    awayScore: payload.awayScore,
    secondLegHomeScore: isKnockout ? payload.secondLegHomeScore : undefined,
    secondLegAwayScore: isKnockout ? payload.secondLegAwayScore : undefined,
  };
}

function sanitizeUpdateGamePayload(
  payload: GameUpdatePayload,
): GameUpdatePayload {
  const gameType = payload.gameType;
  const isKnockout = gameType === "KNOCKOUT";

  const sanitizedPayload: GameUpdatePayload = {
    ...payload,
    gameType: isKnockout ? "KNOCKOUT" : gameType,
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

  if (gameType && gameType !== "KNOCKOUT") {
    sanitizedPayload.penaltyHomeScore = undefined;
    sanitizedPayload.penaltyAwayScore = undefined;
    sanitizedPayload.secondLegHomeScore = undefined;
    sanitizedPayload.secondLegAwayScore = undefined;
  }

  if (gameType === "KNOCKOUT") {
    sanitizedPayload.secondLegHomeScore = payload.secondLegHomeScore;
    sanitizedPayload.secondLegAwayScore = payload.secondLegAwayScore;
  }

  return sanitizedPayload;
}

export function parseOptionalScoreInput(value?: string): number | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const score = Number(trimmedValue);

  if (!Number.isInteger(score) || score < 0) {
    throw new Error(
      "O placar deve ser um número inteiro maior ou igual a zero.",
    );
  }

  return score;
}

export function formatOptionalScoreInput(score?: number | null): string {
  if (score === null || score === undefined) {
    return "";
  }

  return String(score);
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
