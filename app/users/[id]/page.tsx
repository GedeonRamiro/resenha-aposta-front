import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import PaginationShadcn from "@/components/PaginationShadcn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { IDataBet, IDataUser } from "@/types/types";
import { getBetsByUserPaginated } from "@/lib/bets";
import { getUserById, getUserRoleLabel } from "@/lib/users";
import { formatDateTimeBR } from "@/lib/date-time";
import { UserAdminActions } from "./components/UserAdminActions";
import { UserBetsTable } from "./components/UserBetsTable";

export default async function UserDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const userId = routeParams.id;
  const currentPage = Number.parseInt(queryParams.page ?? "1", 10);
  const safeCurrentPage =
    Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  let user: IDataUser | null = null;
  let bets: IDataBet[] = [];
  let betsPagination: {
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    lastPage: number | null;
  } | null = null;
  let errorMessage = "";

  try {
    const [userResponse, betsResponse] = await Promise.all([
      getUserById<IDataUser>(userId),
      getBetsByUserPaginated(userId, safeCurrentPage),
    ]);

    user = userResponse;
    bets = betsResponse.data;
    betsPagination = {
      count: betsResponse.count,
      nextPage: betsResponse.nextPage,
      prevPage: betsResponse.prevPage,
      lastPage: betsResponse.lastPage,
    };
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
              {bets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esse usuário ainda não possui apostas.
                </p>
              ) : (
                <UserBetsTable bets={bets} userId={user.id} />
              )}

              {betsPagination && bets.length !== 0 ? (
                <div className="pt-4">
                  <PaginationShadcn
                    count={betsPagination.count}
                    currentPage={safeCurrentPage}
                    nextPage={betsPagination.nextPage}
                    lastPage={betsPagination.lastPage}
                    prevPage={betsPagination.prevPage}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
