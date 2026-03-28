import Link from "next/link";

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
import {
  BET_OPTION_COLORS,
  BET_RESULT_COLORS,
  GAME_STATUS_COLORS,
} from "@/enums/status-colors";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { getBetResultLabel } from "@/lib/bets";
import { cn } from "@/lib/utils";
import { IDataBet } from "@/types/types";
import { formatDate, getBetOptionLabel, getInitials } from "./utils";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

interface RecentBetsProps {
  bets: IDataBet[];
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

            return (
              <div
                key={bet.id}
                className="rounded-[1.4rem] border border-primary/15 bg-background/90 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(bet.user.name)}
                    </div>
                    <div>
                      <p className="font-medium">{bet.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bet.game.homeTeam} x {bet.game.awayTeam}
                      </p>
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
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-semibold",
                      BET_OPTION_COLORS[bet.option] ?? "",
                    )}
                  >
                    {getBetOptionLabel(bet)}
                  </Badge>
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
                  <span className="text-xs text-muted-foreground">
                    Criada em {formatDate(bet.createdAt)}
                  </span>
                </div>
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
