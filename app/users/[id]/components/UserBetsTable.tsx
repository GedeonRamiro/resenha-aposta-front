"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BET_OPTION_COLORS,
  BET_RESULT_COLORS,
  GAME_STATUS_COLORS,
} from "@/enums/status-colors";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { getBetResultLabel } from "@/lib/bets";
import { formatDateTimeBR } from "@/lib/date-time";
import { IDataBet } from "@/types/types";
import { UserBetActions } from "./UserBetActions";
import { EyeOff } from "lucide-react";

interface UserBetsTableProps {
  bets: IDataBet[];
  userId: string;
}

function getBetOptionLabel(bet: IDataBet): string {
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

export function UserBetsTable({ bets, userId }: UserBetsTableProps) {
  return (
    <Table className="min-w-215">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-45">Jogo</TableHead>
          <TableHead>Opção</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Placar</TableHead>
          <TableHead>Resultado</TableHead>
          <TableHead>Data da aposta</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bets.map((bet) => {
          const betResult = getBetResultLabel(bet);
          const isScheduled = bet.game.status === "SCHEDULED";
          const shouldHideBet = isScheduled;

          return (
            <TableRow key={bet.id}>
              <TableCell className="whitespace-normal wrap-break-word font-medium">
                {bet.game.homeTeam} x {bet.game.awayTeam}
              </TableCell>
              <TableCell>
                {shouldHideBet ? (
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Oculta
                    </span>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className={BET_OPTION_COLORS[bet.option] ?? ""}
                  >
                    {getBetOptionLabel(bet)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={GAME_STATUS_COLORS[bet.game.status] ?? ""}
                >
                  {GAME_STATUS_LABEL[
                    bet.game.status as keyof typeof GAME_STATUS_LABEL
                  ] ?? bet.game.status}
                </Badge>
              </TableCell>
              <TableCell>
                {bet.game.homeScore} x {bet.game.awayScore}
              </TableCell>
              <TableCell>
                {betResult ? (
                  <Badge
                    variant="outline"
                    className={BET_RESULT_COLORS[betResult] ?? ""}
                  >
                    {betResult}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{formatDateTimeBR(bet.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <UserBetActions
                  betId={bet.id}
                  betUserId={bet.userId}
                  gameStatus={bet.game.status}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
