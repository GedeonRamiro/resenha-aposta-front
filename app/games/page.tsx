import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import PaginationShadcn from "@/components/PaginationShadcn";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import { getGames } from "@/lib/games";
import { CreateBetSheet } from "./components/CreateBetSheet";
import { GameAdminActions } from "./components/GameAdminActions";
import { GameInfoModalAction } from "./components/GameInfoModalAction";
import { CreateGameAdminButton } from "./components/CreateGameAdminButton";

export default async function Games({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;

  const currentPage = parseInt(params.page ?? "1");

  const { startDate, endDate } = params;

  let games = null;

  try {
    games = await getGames(currentPage, startDate, endDate);
  } catch {
    return null;
  }

  if (!Array.isArray(games?.data)) return null;

  return (
    <>
      <TiTleSeparator title="Todos os Jogos" />

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DateRangeFilter />
        <CreateGameAdminButton />
      </div>
      {games.data.length === 0 ? (
        <div className="text-center text-muted-foreground">
          Nenhum jogo encontrado para os filtros aplicados.
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {games.data.map((game) => (
          <Card
            key={game.id}
            className="bg-card shadow-md border-primary border"
          >
            <CardHeader className="space-y-3">
              {game.competition ? (
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
                  {game.competition}
                </p>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <CardTitle>
                  {game.homeTeam}{" "}
                  <span className="font-bold">{game.homeScore}</span> x{" "}
                  <span className="font-bold">{game.awayScore}</span>{" "}
                  {game.awayTeam}
                </CardTitle>
                <GameInfoModalAction
                  gameId={game.id}
                  initialInfo={game.moreInfo}
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 flex flex-col">
                <div></div>
                <div className="text-xs text-muted-foreground mb-2">
                  {new Date(game.gameDate).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div className="text-sm">
                  Status:{" "}
                  <Badge
                    variant="outline"
                    className={GAME_STATUS_COLORS[game.status] ?? ""}
                  >
                    {GAME_STATUS_LABEL[
                      game.status as keyof typeof GAME_STATUS_LABEL
                    ] ?? game.status}
                  </Badge>
                </div>
                <div className="text-xs mt-2">
                  Apostas fecham:{" "}
                  {new Date(game.betCloseAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              {game.status === "SCHEDULED" && (
                <div className="w-full mt-4">
                  <CreateBetSheet game={game} />
                </div>
              )}
              <div className="flex justify-end mt-4">
                <GameAdminActions gameId={game.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {games.data.length !== 0 && (
        <div className="py-4">
          <PaginationShadcn
            count={games.count}
            currentPage={currentPage}
            nextPage={games.nextPage}
            lastPage={games.lastPage}
            prevPage={games.prevPage}
          />
        </div>
      )}
    </>
  );
}
