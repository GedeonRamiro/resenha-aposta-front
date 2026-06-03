import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { IDataBet, IDataGame, IPagination } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface BetsApiResponse extends IPagination {
  data: IDataBet[];
}

export interface UserBetsApiResponse extends IPagination {
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
  gameId: string;
  option: ApiBetOption;
};

export type UpdateBetPayload = {
  option: ApiBetOption;
};

function getGameResultFromGame(
  game: Pick<
    IDataGame,
    | "gameType"
    | "homeScore"
    | "awayScore"
    | "secondLegHomeScore"
    | "secondLegAwayScore"
    | "penaltyHomeScore"
    | "penaltyAwayScore"
  >,
): ApiBetOption | null {
  const hasSecondLegHome = typeof game.secondLegHomeScore === "number";
  const hasSecondLegAway = typeof game.secondLegAwayScore === "number";

  if (game.gameType === "KNOCKOUT" && hasSecondLegHome !== hasSecondLegAway) {
    return null;
  }

  const homeScore =
    game.gameType === "KNOCKOUT" && hasSecondLegHome
      ? game.homeScore !== null
        ? game.homeScore + (game.secondLegHomeScore as number)
        : null
      : game.homeScore;
  const awayScore =
    game.gameType === "KNOCKOUT" && hasSecondLegAway
      ? game.awayScore !== null
        ? game.awayScore + (game.secondLegAwayScore as number)
        : null
      : game.awayScore;

  if (homeScore === null || awayScore === null) {
    return null;
  }

  if (homeScore > awayScore) {
    return "HOME_WIN";
  }

  if (awayScore > homeScore) {
    return "AWAY_WIN";
  }

  if (
    game.gameType === "KNOCKOUT" &&
    typeof game.penaltyHomeScore === "number" &&
    typeof game.penaltyAwayScore === "number" &&
    game.penaltyHomeScore !== game.penaltyAwayScore
  ) {
    return game.penaltyHomeScore > game.penaltyAwayScore
      ? "HOME_WIN"
      : "AWAY_WIN";
  }

  return "DRAW";
}

export function getBetOptionText(
  option: string,
  game: Pick<IDataGame, "homeTeam" | "awayTeam">,
): string {
  if (option === "HOME_WIN") {
    return game.homeTeam;
  }

  if (option === "AWAY_WIN") {
    return game.awayTeam;
  }

  return BET_OPTION_LABEL[option as keyof typeof BET_OPTION_LABEL] ?? option;
}

export function getBetResultLabel(bet: IDataBet): "GREEN" | "RED" | null {
  if (bet.game.status !== "FINISHED") {
    return null;
  }

  const result = getGameResultFromGame(bet.game);

  if (!result) {
    return null;
  }

  if (typeof bet.isCorrect === "boolean") {
    return bet.isCorrect ? "GREEN" : "RED";
  }

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

export async function getBetsByUserPaginated(
  userId: string,
  page: number,
  limit?: number,
): Promise<UserBetsApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }

  const response = await fetch(
    `${getApiBaseUrl()}/bets/user/${encodeURIComponent(userId)}/paginated?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return (await response.json()) as UserBetsApiResponse;
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
