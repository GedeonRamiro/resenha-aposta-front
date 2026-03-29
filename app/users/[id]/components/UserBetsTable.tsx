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
import { BET_RESULT_COLORS, GAME_STATUS_COLORS } from "@/enums/status-colors";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { getBetResultLabel } from "@/lib/bets";
import { formatDateTimeBR } from "@/lib/date-time";
import { IDataBet } from "@/types/types";
import { UserBetActions } from "./UserBetActions";
import { BetVisibility } from "@/app/bets/components/BetVisibility";
import { useBackendUser } from "@/lib/useBackendUser";

interface UserBetsTableProps {
  bets: IDataBet[];
  userId: string;
}

export function UserBetsTable({ bets, userId }: UserBetsTableProps) {
  const { backendUser } = useBackendUser();

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

          return (
            <TableRow key={bet.id}>
              <TableCell className="whitespace-normal wrap-break-word font-medium">
                {bet.game.homeTeam} x {bet.game.awayTeam}
              </TableCell>

              <TableCell>
                <BetVisibility bet={bet} currentUserId={backendUser?.id} />
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
