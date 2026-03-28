"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import {
  GAME_STATUS_COLORS,
  BET_OPTION_COLORS,
  BET_RESULT_COLORS,
} from "@/enums/status-colors";
import { getBetResultLabel } from "@/lib/bets";
import { formatDateBR, formatDateTimeBR } from "@/lib/date-time";
import { IDataBet } from "@/types/types";

type BetsGroup = {
  game: IDataBet["game"];
  bets: IDataBet[];
};

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

export default function BetsList({ data }: { data: IDataBet[] }) {
  const grouped = Object.values(
    data.reduce<Record<string, BetsGroup>>((acc, bet) => {
      const gameId = bet.game.id;

      if (!acc[gameId]) {
        acc[gameId] = {
          game: bet.game,
          bets: [],
        };
      }

      acc[gameId].bets.push(bet);

      return acc;
    }, {}),
  );

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <Card key={group.game.id}>
          <CardHeader>
            <CardTitle className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0">
                {group.game.homeTeam} {group.game.homeScore} x{" "}
                {group.game.awayScore} {group.game.awayTeam}{" "}
                <p className="text-xs text-muted-foreground">
                  ({formatDateTimeBR(group.game.gameDate)})
                </p>
              </span>

              <Badge
                variant="outline"
                className={`shrink-0 ${GAME_STATUS_COLORS[group.game.status] ?? ""}`}
              >
                {GAME_STATUS_LABEL[
                  group.game.status as keyof typeof GAME_STATUS_LABEL
                ] ?? group.game.status}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table className="w-max min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Apostador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Aposta</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {group.bets.map((bet: IDataBet) => {
                  const betResult = getBetResultLabel(bet);

                  return (
                    <TableRow key={bet.id}>
                      <TableCell className="font-medium whitespace-normal break-all">
                        {bet.user.name}
                      </TableCell>

                      <TableCell>{formatDateBR(bet.createdAt)}</TableCell>

                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={BET_OPTION_COLORS[bet.option] ?? ""}
                        >
                          {getOptionLabel(bet)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {betResult ? (
                          <Badge
                            variant="outline"
                            className={BET_RESULT_COLORS[betResult] ?? ""}
                          >
                            {betResult}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
