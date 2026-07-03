import Link from "next/link";

import { BetVisibility } from "@/app/bets/components/BetVisibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BET_RESULT_COLORS, GAME_STATUS_COLORS } from "@/enums/status-colors";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { getBetResultLabel } from "@/lib/bets";
import { cn } from "@/lib/utils";
import { IDataBet } from "@/types/types";
import { formatDate } from "./utils";
import { UserAvatar } from "@/components/UserAvatar";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

interface RecentBetsProps {
  bets: IDataBet[];
}

function renderGameScore(
  score: number | null,
  secondLegScore: number | null,
  penaltyScore: number | null,
  hasSecondLegResult: boolean,
  hasPenaltyResult: boolean,
) {
  return (
    <span className="inline-flex items-center gap-1 text-sm tabular-nums">
      <span className="inline-flex w-5 justify-center">
        {typeof score === "number" ? score : "-"}
      </span>

      {hasSecondLegResult ? (
        <span className="inline-flex w-5 justify-center">{secondLegScore}</span>
      ) : null}

      {hasPenaltyResult ? (
        <span className="inline-flex min-w-8 justify-center">
          ({penaltyScore})
        </span>
      ) : null}
    </span>
  );
}

function getRandomBets(bets: IDataBet[], count: number): IDataBet[] {
  if (bets.length <= count) return bets;

  const shuffled = [...bets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function RecentBets({ bets }: RecentBetsProps) {
  const displayBets = getRandomBets(bets, 3);
  return (
    <Card className={surfaceCardClassName}>
      <CardHeader>
        <CardTitle>Apostas recentes</CardTitle>
        <CardDescription>
          Palpites recentes com resultado previsto e situacao do mercado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayBets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma aposta encontrada.
          </p>
        ) : (
          displayBets.map((bet) => {
            const betResult = getBetResultLabel(bet);
            const hasSecondLegResult =
              bet.game.gameType === "KNOCKOUT" &&
              typeof bet.game.homeScore === "number" &&
              typeof bet.game.awayScore === "number" &&
              typeof bet.game.secondLegHomeScore === "number" &&
              typeof bet.game.secondLegAwayScore === "number";

            const hasPenaltyResult =
              typeof bet.game.penaltyHomeScore === "number" &&
              typeof bet.game.penaltyAwayScore === "number";

            return (
              <div
                key={bet.id}
                className="rounded-[1.4rem] border border-primary/15 bg-background/90 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={bet.user.name}
                      image={bet.user.image}
                      className="h-8 w-8 shrink-0"
                    />
                    <div>
                      <p className="font-medium">{bet.user.name}</p>
                      <div className="mt-1 space-y-1 text-sm leading-snug text-muted-foreground">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate">
                            {bet.game.homeTeam}
                          </span>
                          {renderGameScore(
                            bet.game.homeScore,
                            bet.game.secondLegHomeScore,
                            bet.game.penaltyHomeScore,
                            hasSecondLegResult,
                            hasPenaltyResult,
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate">
                            {bet.game.awayTeam}
                          </span>
                          {renderGameScore(
                            bet.game.awayScore,
                            bet.game.secondLegAwayScore,
                            bet.game.penaltyAwayScore,
                            hasSecondLegResult,
                            hasPenaltyResult,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-semibold",
                      GAME_STATUS_COLORS[bet.game.status] ?? "",
                    )}
                  >
                    {GAME_STATUS_LABEL[
                      bet.game.status as keyof typeof GAME_STATUS_LABEL
                    ] ?? bet.game.status}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <BetVisibility bet={bet} />
                  {betResult ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-semibold",
                        BET_RESULT_COLORS[betResult] ?? "",
                      )}
                    >
                      {betResult}
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Criada em {formatDate(bet.createdAt)}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full border-primary/15">
          <Link href="/bets">Ver todas as apostas</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
