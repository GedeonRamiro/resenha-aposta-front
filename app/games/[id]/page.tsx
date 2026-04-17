import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import Link from "next/link";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { getGameById } from "@/lib/games";
import { formatDateTimeBR } from "@/lib/date-time";
import { CreateBetSheet } from "../components/CreateBetSheet";
import { GameAdminActions } from "../components/GameAdminActions";
import { GenerateInfoButton } from "../components/GenerateInfoButton";
import { TeamLogo } from "@/components/TeamLogo";

export default async function GameDetails({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  let game = null;

  try {
    game = await getGameById(id);
  } catch {
    return (
      <div className="text-center text-muted-foreground">
        Jogo não encontrado.
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center text-muted-foreground">
        Jogo não encontrado.
      </div>
    );
  }

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Jogos", href: "/games" },
          { label: `${game.homeTeam} vs ${game.awayTeam}` },
        ]}
      />
      <TiTleSeparator title="Detalhes do Jogo" />

      <div className="max-w-2xl mx-auto">
        <Card className="bg-card shadow-md border-primary border">
          <CardHeader>
            <CardTitle className="text-2xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamLogo
                      teamName={game.homeTeam}
                      logoUrl={game.homeTeamLogo}
                      className="h-10 w-10"
                    />
                    <span className="truncate">{game.homeTeam}</span>
                  </div>

                  {typeof game.homeScore === "number" ? (
                    <span className="shrink-0 font-bold text-3xl">
                      {game.homeScore}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamLogo
                      teamName={game.awayTeam}
                      logoUrl={game.awayTeamLogo}
                      className="h-10 w-10"
                    />
                    <span className="truncate">{game.awayTeam}</span>
                  </div>

                  {typeof game.awayScore === "number" ? (
                    <span className="shrink-0 font-bold text-3xl">
                      {game.awayScore}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data e Hora
              </label>
              <p className="text-lg">
                {formatDateTimeBR(game.gameDate, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {game.competition && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Liga/Campeonato
                </label>
                <p className="text-lg">{game.competition}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Badge
                variant="outline"
                className={`mt-1 ${
                  GAME_STATUS_COLORS[
                    game.status as keyof typeof GAME_STATUS_COLORS
                  ] ?? ""
                }`}
              >
                {GAME_STATUS_LABEL[
                  game.status as keyof typeof GAME_STATUS_LABEL
                ] ?? game.status}
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Apostas fecham em
              </label>
              <p className="text-lg">
                {formatDateTimeBR(game.betCloseAt, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {game.moreInfo && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Informações
                </label>
                <p className="text-base whitespace-pre-line">{game.moreInfo}</p>
              </div>
            )}

            <GenerateInfoButton
              gameId={game.id}
              initialMoreInfo={game.moreInfo}
            />

            {game.status === "SCHEDULED" && (
              <div className="pt-6">
                <CreateBetSheet game={game} />
              </div>
            )}

            <div className="pt-6 flex gap-2">
              <div className="flex-1">
                <div className="flex justify-start">
                  <GameAdminActions gameId={game.id} showDelete={false} />
                </div>
              </div>
              <Link href="/games" className="flex-1">
                <Button variant="outline" className="w-full">
                  Voltar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
