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
import { GAME_STATUS_COLORS, BET_RESULT_COLORS } from "@/enums/status-colors";
import { getBetResultLabel } from "@/lib/bets";
import { formatDateBR, formatDateTimeBR } from "@/lib/date-time";
import { IDataBet } from "@/types/types";
import { useBackendUser } from "@/lib/useBackendUser";
import { BetVisibility } from "./BetVisibility";
import { TeamLogo } from "@/components/TeamLogo";

type BetsGroup = {
  game: IDataBet["game"];
  bets: IDataBet[];
};

export default function BetsList({ data }: { data: IDataBet[] }) {
  const { backendUser } = useBackendUser();
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
            <CardTitle>
              {(() => {
                const hasSecondLegResult =
                  group.game.gameType === "KNOCKOUT" &&
                  typeof group.game.homeScore === "number" &&
                  typeof group.game.awayScore === "number" &&
                  typeof group.game.secondLegHomeScore === "number" &&
                  typeof group.game.secondLegAwayScore === "number";

                const hasPenaltyResult =
                  typeof group.game.penaltyHomeScore === "number" &&
                  typeof group.game.penaltyAwayScore === "number";

                return (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <TeamLogo
                          teamName={group.game.homeTeam}
                          logoUrl={group.game.homeTeamLogo}
                        />

                        <span className="truncate">{group.game.homeTeam}</span>
                      </div>

                      <div className="shrink-0 text-right font-bold tabular-nums">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span className="inline-flex w-5 justify-center">
                            {typeof group.game.homeScore === "number"
                              ? group.game.homeScore
                              : "-"}
                          </span>

                          {hasSecondLegResult ? (
                            <span className="inline-flex w-5 justify-center">
                              {group.game.secondLegHomeScore}
                            </span>
                          ) : null}

                          {hasPenaltyResult ? (
                            <span className="inline-flex min-w-8 justify-center">
                              ({group.game.penaltyHomeScore})
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <TeamLogo
                          teamName={group.game.awayTeam}
                          logoUrl={group.game.awayTeamLogo}
                        />

                        <span className="truncate">{group.game.awayTeam}</span>
                      </div>

                      <div className="shrink-0 text-right font-bold tabular-nums">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span className="inline-flex w-5 justify-center">
                            {typeof group.game.awayScore === "number"
                              ? group.game.awayScore
                              : "-"}
                          </span>

                          {hasSecondLegResult ? (
                            <span className="inline-flex w-5 justify-center">
                              {group.game.secondLegAwayScore}
                            </span>
                          ) : null}

                          {hasPenaltyResult ? (
                            <span className="inline-flex min-w-8 justify-center">
                              ({group.game.penaltyAwayScore})
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between ">
                      <p className="text-xs text-muted-foreground">
                        {formatDateTimeBR(group.game.gameDate)}
                      </p>

                      <Badge
                        variant="outline"
                        className={GAME_STATUS_COLORS[group.game.status] ?? ""}
                      >
                        {GAME_STATUS_LABEL[
                          group.game.status as keyof typeof GAME_STATUS_LABEL
                        ] ?? group.game.status}
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table className="w-max min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 w-36 min-w-36 max-w-36 bg-card shadow-[1px_0_0_0_hsl(var(--border))] sm:w-44 sm:min-w-44 sm:max-w-44">
                    Apostador
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Aposta</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {group.bets.map((bet: IDataBet) => {
                  const betResult = getBetResultLabel(bet);

                  return (
                    <TableRow key={bet.id}>
                      <TableCell
                        className="sticky left-0 z-10 w-36 min-w-36 max-w-36 bg-card font-medium shadow-[1px_0_0_0_hsl(var(--border))] sm:w-44 sm:min-w-44 sm:max-w-44"
                        title={bet.user.name}
                      >
                        <span className="block truncate whitespace-nowrap">
                          {bet.user.name}
                        </span>
                      </TableCell>

                      {/*    <TableCell>{formatDateBR(bet.createdAt)}</TableCell> */}
                      <TableCell>{formatDateTimeBR(bet.updatedAt)}</TableCell>

                      <TableCell>
                        <BetVisibility
                          bet={bet}
                          currentUserId={backendUser?.id}
                        />
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
