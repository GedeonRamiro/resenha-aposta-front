import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Lock, Trophy } from "lucide-react";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import PaginationShadcn from "@/components/PaginationShadcn";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import { getGames } from "@/lib/games";
import { formatDateTimeBR } from "@/lib/date-time";
import { CreateBetSheet } from "./components/CreateBetSheet";
import { GameAdminActions } from "./components/GameAdminActions";
import { GameInfoModalAction } from "./components/GameInfoModalAction";
import { CreateGameAdminButton } from "./components/CreateGameAdminButton";
import { TeamLogo } from "@/components/TeamLogo";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

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
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {games.data.map((game) => (
          <Card key={game.id} className={surfaceCardClassName}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                {game.competition ? (
                  <p className="flex min-w-0 items-start gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
                    <Trophy className="mt-0.5 size-3.5 shrink-0" />
                    <span className="whitespace-normal wrap-break-word leading-relaxed">
                      {game.competition}
                    </span>
                  </p>
                ) : (
                  <div />
                )}
                <GameInfoModalAction
                  gameId={game.id}
                  initialInfo={game.moreInfo}
                />
              </div>

              <CardTitle className="mt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                      <TeamLogo
                        teamName={game.homeTeam}
                        logoUrl={game.homeTeamLogo}
                      />
                      <span className="block truncate">{game.homeTeam}</span>
                    </div>

                    {typeof game.homeScore === "number" ? (
                      <span className="shrink-0 font-bold text-sm">
                        {game.homeScore}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                      <TeamLogo
                        teamName={game.awayTeam}
                        logoUrl={game.awayTeamLogo}
                      />
                      <span className="block truncate">{game.awayTeam}</span>
                    </div>

                    {typeof game.awayScore === "number" ? (
                      <span className="shrink-0 font-bold text-sm">
                        {game.awayScore}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 flex flex-col">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-primary" />
                    <span>
                      {formatDateTimeBR(game.gameDate, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Lock className="size-4 shrink-0 text-primary" />
                    <span>
                      Mercado fecha em{" "}
                      {formatDateTimeBR(game.betCloseAt, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </p>
                </div>

                <div className="mt-3 text-sm">
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
              </div>
              {game.status === "SCHEDULED" && (
                <div className="w-full mt-4">
                  <CreateBetSheet game={game} />
                </div>
              )}
              <div className="mt-4 flex items-center justify-end gap-2">
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
