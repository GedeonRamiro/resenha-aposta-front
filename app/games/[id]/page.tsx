import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import Link from "next/link";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { getGameById } from "@/lib/games";
import { CreateBetSheet } from "../components/CreateBetSheet";
import { GameAdminActions } from "../components/GameAdminActions";
import { GenerateInfoButton } from "../components/GenerateInfoButton";

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
              {game.homeTeam}{" "}
              <span className="font-bold text-3xl">{game.homeScore}</span> x{" "}
              <span className="font-bold text-3xl">{game.awayScore}</span>{" "}
              {game.awayTeam}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data e Hora
              </label>
              <p className="text-lg">
                {new Date(game.gameDate).toLocaleString("pt-BR", {
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
                {new Date(game.betCloseAt).toLocaleString("pt-BR", {
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
