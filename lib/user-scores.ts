import { IDataUser } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

export interface RankingItem {
  user: IDataUser;
  points: number;
  bets: number;
}

function buildDateParams(startDate?: string, endDate?: string): string {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export async function getUserScores(
  startDate?: string,
  endDate?: string,
): Promise<RankingItem[]> {
  const url = `${getApiBaseUrl()}/user-scores${buildDateParams(startDate, endDate)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch user scores");
  return (await response.json()) as RankingItem[];
}

export async function getUserScoreByUser(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<RankingItem> {
  const url = `${getApiBaseUrl()}/user-scores/user/${userId}${buildDateParams(startDate, endDate)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch user score");
  return (await response.json()) as RankingItem;
}
