import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IDataGame, IPagination } from "@/types/types";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { Separator } from "@/components/ui/separator";
import PaginationShadcn from "@/components/PaginationShadcn";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import Link from "next/link";
import { ConfirmAction } from "@/components/ConfirmAction";

interface GamesApiResponse extends IPagination {
  data: IDataGame[];
  [key: string]: any;
}

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

  const startDate = params.startDate;
  const endDate = params.endDate;
  const isExistingFilter = !!startDate && !!endDate;

  const url = isExistingFilter
    ? `${process.env.NEXT_PUBLIC_API_URL}/games?startDate=${startDate}&endDate=${endDate}&page=${currentPage}`
    : `${process.env.NEXT_PUBLIC_API_URL}/games?page=${currentPage}`;

  let games: GamesApiResponse | null = null;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    console.log("Resposta da API:", response);
    games = await response.json();
  } catch (error: unknown) {
    console.error(
      "Erro ao buscar jogos:",
      error instanceof Error ? error.message : error,
    );
  }
  if (!games || !Array.isArray(games?.data)) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 pb-6">
        <Separator className="flex-1" />
        <span className="text-lg font-semibold text-primary">
          Todos os Jogos
        </span>
        <Separator className="flex-1" />
      </div>

      <div className="flex justify-between mb-6">
        <DateRangeFilter />
        <Link href="/games/create">
          <Button>Criar Jogos</Button>
        </Link>
      </div>
      {games.data.length === 0 ? (
        <div className="text-center text-muted-foreground">
          Nenhum jogo encontrado para os filtros aplicados.
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {games?.data.map((game) => (
          <Card
            key={game.id}
            className="bg-card shadow-md border-primary border"
          >
            <CardHeader>
              <CardTitle>
                {game.homeTeam}{" "}
                <span className="font-bold">{game.homeScore}</span> x{" "}
                <span className="font-bold">{game.awayScore}</span>{" "}
                {game.awayTeam}
              </CardTitle>
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
                  <span
                    className={
                      "font-medium " +
                      (game.status === "FINISHED"
                        ? "text-primary"
                        : game.status === "CLOSED"
                          ? "text-red-600"
                          : game.status === "SCHEDULED"
                            ? "text-green-600"
                            : "")
                    }
                  >
                    {GAME_STATUS_LABEL[
                      game.status as keyof typeof GAME_STATUS_LABEL
                    ] ?? game.status}
                  </span>
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
                <>
                  <div className="mt-4 grid grid-cols-3 gap-2 items-end">
                    <Button variant="outline" className="w-full">
                      1
                    </Button>
                    <Button variant="outline" className="w-full">
                      X
                    </Button>
                    <Button variant="outline" className="w-full">
                      2
                    </Button>
                  </div>
                  <Button className="w-full mt-4">Enviar Aposta</Button>
                </>
              )}
              <div className="flex justify-end mt-4">
                <Link href={`/games/${game.id}/edit`}>
                  <Button variant={"link"} className="">
                    Editar
                  </Button>
                </Link>
                <ConfirmAction
                  id={game.id}
                  endpoint="/games"
                  title="Excluir jogo?"
                  description="Esse jogo será removido permanentemente."
                />
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
