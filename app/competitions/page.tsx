import PaginationShadcn from "@/components/PaginationShadcn";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import TiTleSeparator from "@/components/TiTleSeparator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCompetitions } from "@/lib/competitions";
import { CompetitionAdminActions } from "./components/CompetitionAdminActions";
import { CompetitionFormDialog } from "./components/CompetitionFormDialog";

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1");

  let competitions = null;
  let competitionsError = "";

  try {
    competitions = await getCompetitions(currentPage);
  } catch (error: unknown) {
    competitionsError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a lista de competições.";
  }

  const hasCompetitionList = Boolean(
    competitions && Array.isArray(competitions.data),
  );
  const competitionData = competitions?.data ?? [];

  return (
    <>
      <TiTleSeparator title="Competições" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Competições cadastradas</CardTitle>
          <CompetitionFormDialog mode="create" />
        </CardHeader>
        <CardContent>
          {competitionsError ? (
            <p className="text-sm text-red-600">{competitionsError}</p>
          ) : null}

          {!hasCompetitionList ? (
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os dados de competições.
            </p>
          ) : competitionData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma competição cadastrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionData.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CompetitionLogo
                          competitionName={competition.name}
                          logoUrl={competition.logoUrl}
                        />
                        <span className="truncate">{competition.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CompetitionAdminActions competition={competition} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {hasCompetitionList && competitionData.length !== 0 ? (
        <div className="py-4">
          <PaginationShadcn
            count={competitions?.count}
            currentPage={currentPage}
            nextPage={competitions?.nextPage}
            lastPage={competitions?.lastPage}
            prevPage={competitions?.prevPage}
          />
        </div>
      ) : null}
    </>
  );
}
