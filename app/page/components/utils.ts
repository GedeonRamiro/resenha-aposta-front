import { IDataBet } from "@/types/types";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { formatDateTimeBR } from "@/lib/date-time";

export function formatDate(date: string): string {
  return formatDateTimeBR(date);
}

export function getBetOptionLabel(bet: IDataBet): string {
  if (bet.option === "HOME_WIN") {
    return `Vitoria ${bet.game.homeTeam}`;
  }

  if (bet.option === "AWAY_WIN") {
    return `Vitoria ${bet.game.awayTeam}`;
  }

  return (
    BET_OPTION_LABEL[bet.option as keyof typeof BET_OPTION_LABEL] ?? bet.option
  );
}

export function getExcerpt(content: string, limit = 120): string {
  const plainText = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= limit) {
    return plainText;
  }

  return `${plainText.slice(0, limit).trimEnd()}...`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
