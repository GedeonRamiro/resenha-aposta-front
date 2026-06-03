import PaginationShadcn from "@/components/PaginationShadcn";
import TiTleSeparator from "@/components/TiTleSeparator";
import { TeamLogo } from "@/components/TeamLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeams } from "@/lib/teams";
import { TeamAdminActions } from "./components/TeamAdminActions";
import { TeamFormDialog } from "./components/TeamFormDialog";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1");

  let teams = null;
  let teamsError = "";

  try {
    teams = await getTeams(currentPage);
  } catch (error: unknown) {
    teamsError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a lista de times.";
  }

  const hasTeamList = Boolean(teams && Array.isArray(teams.data));
  const teamData = teams?.data ?? [];

  return (
    <>
      <TiTleSeparator title="Times" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Times cadastrados</CardTitle>
          <TeamFormDialog mode="create" />
        </CardHeader>

        <CardContent>
          {teamsError ? (
            <p className="text-sm text-red-600">{teamsError}</p>
          ) : null}

          {!hasTeamList ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os dados de times.
            </p>
          ) : teamData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum time cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TeamLogo teamName={team.name} logoUrl={team.logoUrl} />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {team.logoUrl ? "Disponível" : "Não informado"}
                    </TableCell>
                    <TableCell>
                      <TeamAdminActions team={team} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {hasTeamList && teamData.length !== 0 ? (
        <div className="py-4">
          <PaginationShadcn
            count={teams?.count}
            currentPage={currentPage}
            nextPage={teams?.nextPage}
            lastPage={teams?.lastPage}
            prevPage={teams?.prevPage}
          />
        </div>
      ) : null}
    </>
  );
}
