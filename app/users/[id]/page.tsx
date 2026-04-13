import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { IDataBet, IDataUser } from "@/types/types";
import { getUserById, getUserRoleLabel } from "@/lib/users";
import { formatDateTimeBR } from "@/lib/date-time";
import { UserAdminActions } from "./components/UserAdminActions";
import { UserBetsTable } from "./components/UserBetsTable";

interface IUserDetails extends IDataUser {
  bets: IDataBet[];
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
                <UserBetsTable bets={user.bets} userId={user.id} />
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
