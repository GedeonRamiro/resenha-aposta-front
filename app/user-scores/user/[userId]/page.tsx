import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { UserAvatar } from "@/components/UserAvatar";
import { getUserScoreByUser, getUserScores } from "@/lib/user-scores";

export default async function UserScoreDetail({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { userId } = await params;
  const { startDate, endDate } = await searchParams;

  let userScore = null;
  let ranking = null;
  let error = "";

  try {
    [userScore, ranking] = await Promise.all([
      getUserScoreByUser(userId, startDate, endDate),
      getUserScores(startDate, endDate),
    ]);
  } catch {
    error = "Não foi possível carregar os dados do usuário.";
  }

  const position = ranking?.findIndex((r) => r.user.id === userId) ?? -1;
  const hitRate =
    userScore && userScore.bets > 0
      ? ((userScore.points / userScore.bets) * 100).toFixed(1)
      : "0";
  const hitRateNum = Number(hitRate);

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings", href: "/user-scores" },
          { label: userScore?.user.name || "Carregando..." },
        ]}
      />
      <TiTleSeparator
        title={
          userScore
            ? `Detalhes — ${userScore.user.name}`
            : "Detalhes do Apostador"
        }
      />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !userScore ? (
        <p className="text-sm text-muted-foreground text-center">
          Usuário não encontrado no ranking para o período selecionado.
        </p>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Apostador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-center pb-2">
                <UserAvatar
                  name={userScore.user.name}
                  image={userScore.user.image}
                  className="h-14 w-14"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Nome</span>
                <span className="font-medium">{userScore.user.name}</span>
              </div>
              <div className="flex items-center justify-between"></div>
              {position >= 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Posição no ranking
                  </span>
                  <Badge variant="outline">
                    {position === 0
                      ? "🥇 1°"
                      : position === 1
                        ? "🥈 2°"
                        : position === 2
                          ? "🥉 3°"
                          : `${position + 1}°`}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-3xl font-bold text-yellow-500">
                  {userScore.points}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pontos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {userScore.bets}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Apostas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <p
                  className={`text-3xl font-bold ${
                    hitRateNum >= 60
                      ? "text-green-500"
                      : hitRateNum >= 40
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {hitRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aproveitamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barra de aproveitamento */}
          <Card>
            <CardHeader>
              <CardTitle>Aproveitamento Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Acertos</span>
                  <span>
                    {userScore.points} de {userScore.bets} apostas
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all flex items-center justify-end pr-3"
                    style={{
                      width: `${Math.max(Number(hitRate), 2)}%`,
                      backgroundColor:
                        hitRateNum >= 60
                          ? "#22C55E"
                          : hitRateNum >= 40
                            ? "#EAB308"
                            : "#EF4444",
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow">
                      {hitRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparação com média geral */}
              {ranking && ranking.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Comparação com a média geral
                  </p>
                  {(() => {
                    const totalBets = ranking.reduce((s, i) => s + i.bets, 0);
                    const totalPoints = ranking.reduce(
                      (s, i) => s + i.points,
                      0,
                    );
                    const avgRate =
                      totalBets > 0
                        ? ((totalPoints / totalBets) * 100).toFixed(1)
                        : "0";
                    const diff = (hitRateNum - Number(avgRate)).toFixed(1);
                    const positive = hitRateNum >= Number(avgRate);
                    return (
                      <div className="flex items-center justify-between text-sm">
                        <span>Média do grupo: {avgRate}%</span>
                        <Badge
                          variant="outline"
                          className={
                            positive
                              ? "text-green-600 border-green-400"
                              : "text-red-600 border-red-400"
                          }
                        >
                          {positive ? "+" : ""}
                          {diff}%
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
