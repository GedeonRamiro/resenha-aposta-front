"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BET_RESULT_BORDER_L_COLORS,
  BET_RESULT_COLORS,
  GAME_STATUS_COLORS,
} from "@/enums/status-colors";
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

type BetsGroup = {
  game: IDataBet["game"];
  bets: IDataBet[];
};

export function UserBetsTable({ bets, userId }: UserBetsTableProps) {
  const { backendUser } = useBackendUser();

  const grouped = Object.values(
    bets.reduce<Record<string, BetsGroup>>((acc, bet) => {
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
    <div className="space-y-4">
      {grouped.map((group) => {
        const isOpen = group.game.status === "SCHEDULED";
        const groupResults = group.bets.map((b) => getBetResultLabel(b));
        const dominantResult = !isOpen
          ? groupResults.includes("RED")
            ? "RED"
            : groupResults.includes("GREEN")
              ? "GREEN"
              : null
          : null;
        const borderClass = dominantResult
          ? `border-l-4 ${BET_RESULT_BORDER_L_COLORS[dominantResult]}`
          : "border-l-4";

        return (
          <Card key={group.game.id} className={borderClass}>
            <CardHeader className="pb-3">
              <CardTitle className="space-y-1">
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    {group.game.homeTeam}{" "}
                    {typeof group.game.homeScore === "number"
                      ? group.game.homeScore
                      : "-"}{" "}
                    x{" "}
                    {typeof group.game.awayScore === "number"
                      ? group.game.awayScore
                      : "-"}{" "}
                    {group.game.awayTeam}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTimeBR(group.game.gameDate)}
                  </p>

                  <Badge
                    variant="outline"
                    className={`w-fit shrink-0 ${GAME_STATUS_COLORS[group.game.status] ?? ""}`}
                  >
                    {GAME_STATUS_LABEL[
                      group.game.status as keyof typeof GAME_STATUS_LABEL
                    ] ?? group.game.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {group.bets.map((bet) => {
                  const betResult = getBetResultLabel(bet);

                  return (
                    <div
                      key={bet.id}
                      className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Aposta:
                          </span>
                          <BetVisibility
                            bet={bet}
                            currentUserId={backendUser?.id}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Resultado:
                          </span>
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
                        </div>

                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-muted-foreground">
                            Data da aposta:
                          </span>
                          <span className="text-foreground">
                            {formatDateTimeBR(bet.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        <UserBetActions
                          betId={bet.id}
                          betUserId={bet.userId}
                          gameStatus={bet.game.status}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
