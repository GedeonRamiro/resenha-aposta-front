enum BetOption {
  HOME_WIN = "HOME_WIN",
  DRAW = "DRAW",
  AWAY_WIN = "AWAY_WIN",
}

export const BET_OPTION_LABEL: Record<BetOption, string> = {
  [BetOption.HOME_WIN]: "Vitória Casa",
  [BetOption.DRAW]: "Empate",
  [BetOption.AWAY_WIN]: "Vitória Fora",
};
