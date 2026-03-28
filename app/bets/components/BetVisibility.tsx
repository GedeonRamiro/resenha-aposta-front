"use client";

import { EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BET_OPTION_COLORS } from "@/enums/status-colors";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { IDataBet } from "@/types/types";

interface BetVisibilityProps {
  bet: IDataBet;
  currentUserId?: string;
}

function getOptionLabel(bet: IDataBet): string {
  if (bet.option === "HOME_WIN") {
    return `Vitória ${bet.game.homeTeam}`;
  }

  if (bet.option === "AWAY_WIN") {
    return `Vitória ${bet.game.awayTeam}`;
  }

  return (
    BET_OPTION_LABEL[bet.option as keyof typeof BET_OPTION_LABEL] ?? bet.option
  );
}

export function BetVisibility({ bet, currentUserId }: BetVisibilityProps) {
  const isScheduled = bet.game.status === "SCHEDULED";
  const isOwnBet = currentUserId === bet.userId;
  const shouldHideBet = isScheduled && !isOwnBet;

  if (shouldHideBet) {
    return (
      <div className="flex items-center gap-2">
        <EyeOff className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Aposta oculta</span>
      </div>
    );
  }

  return (
    <Badge variant="outline" className={BET_OPTION_COLORS[bet.option] ?? ""}>
      {getOptionLabel(bet)}
    </Badge>
  );
}
