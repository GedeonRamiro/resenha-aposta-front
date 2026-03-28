import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import {
  BET_OPTION_COLORS,
  BET_RESULT_COLORS,
  GAME_STATUS_COLORS,
} from "@/enums/status-colors";
import { getBetResultLabel } from "@/lib/bets";
import { IDataBet, IDataUser } from "@/types/types";
import { getUserById, getUserRoleLabel } from "@/lib/users";
import { formatDateTimeBR } from "@/lib/date-time";
import { UserAdminActions } from "./components/UserAdminActions";
import { UserBetActions } from "./components/UserBetActions";

interface IUserDetails extends IDataUser {
  bets: IDataBet[];
}

function getBetOptionLabel(bet: IDataBet): string {
  if (bet.option === "HOME_WIN") {
    return `Vitória ${bet.game.homeTeam}`;
  }

  if (bet.option === "AWAY_WIN") {
    return `Vitória ${bet.game.awayTeam}`;
  }

  return (
    BET_OPTION_LABEL[bet.option as keyof typeof BET_OPTION_LABEL] ?? bet.option
  );
}

export default async function UserDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const routeParams = await params;
  const userId = routeParams.id;

  let user: IUserDetails | null = null;
  let errorMessage = "";

  try {
    user = await getUserById<IUserDetails>(userId);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "404") {
      errorMessage = "Usuário não encontrado.";
    } else {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados do usuário.";
    }
  }

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Apostadores", href: "/users" },
          { label: user?.name || "Carregando..." },
        ]}
      />
      <TiTleSeparator title="Detalhes do Usuário" />

      {errorMessage ? (
        <Card className="border-red-600/30">
          <CardHeader>
            <CardTitle>Erro ao buscar usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      {user ? (
        <div className="space-y-6">
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle>Informações adicionais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="md:col-span-2 flex items-center gap-3">
                <UserAvatar
                  name={user.name}
                  image={user.image}
                  className="h-12 w-12"
                />
                <div>
                  <p className="font-semibold">Foto do perfil</p>
                </div>
              </div>

              <p>
                <span className="font-semibold">Nome:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Perfil:</span>{" "}
                {getUserRoleLabel(user.role)}
              </p>
              <p>
                <span className="font-semibold">Provider:</span>{" "}
                {user.provider ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Criado em:</span>{" "}
                {formatDateTimeBR(user.createdAt)}
              </p>
              <p>
                <span className="font-semibold">Atualizado em:</span>{" "}
                {formatDateTimeBR(user.updatedAt)}
              </p>

              <UserAdminActions userId={user.id} currentRole={user.role} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apostas do usuário</CardTitle>
            </CardHeader>
            <CardContent>
              {user.bets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esse usuário ainda não possui apostas.
                </p>
              ) : (
                <Table className="min-w-215">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-45">Jogo</TableHead>
                      <TableHead>Opção</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Placar</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Data da aposta</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.bets.map((bet) => (
                      <TableRow key={bet.id}>
                        {(() => {
                          const betResult = getBetResultLabel(bet);

                          return (
                            <>
                              <TableCell className="whitespace-normal wrap-break-word font-medium">
                                {bet.game.homeTeam} x {bet.game.awayTeam}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    BET_OPTION_COLORS[bet.option] ?? ""
                                  }
                                >
                                  {getBetOptionLabel(bet)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    GAME_STATUS_COLORS[bet.game.status] ?? ""
                                  }
                                >
                                  {GAME_STATUS_LABEL[
                                    bet.game
                                      .status as keyof typeof GAME_STATUS_LABEL
                                  ] ?? bet.game.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {bet.game.homeScore} x {bet.game.awayScore}
                              </TableCell>
                              <TableCell>
                                {betResult ? (
                                  <Badge
                                    variant="outline"
                                    className={
                                      BET_RESULT_COLORS[betResult] ?? ""
                                    }
                                  >
                                    {betResult}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDateTimeBR(bet.updatedAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <UserBetActions
                                  betId={bet.id}
                                  betUserId={bet.userId}
                                  gameStatus={bet.game.status}
                                />
                              </TableCell>
                            </>
                          );
                        })()}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
