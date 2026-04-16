"use client";

import { EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BET_OPTION_COLORS } from "@/enums/status-colors";
import { getBetOptionText } from "@/lib/bets";
import { IDataBet } from "@/types/types";

interface BetVisibilityProps {
  bet: IDataBet;
  currentUserId?: string;
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
      {getBetOptionText(bet.option, bet.game)}
    </Badge>
  );
}
