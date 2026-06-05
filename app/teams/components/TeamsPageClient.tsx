"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PaginationShadcn from "@/components/PaginationShadcn";
import TiTleSeparator from "@/components/TiTleSeparator";
import { TeamLogo } from "@/components/TeamLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeams, Team } from "@/lib/teams";
import { useBackendUser } from "@/lib/useBackendUser";
import { TeamAdminActions } from "./TeamAdminActions";
import { TeamFormDialog } from "./TeamFormDialog";

export default function TeamsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading: isAuthLoading } = useBackendUser();

  const currentPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const safeCurrentPage =
    Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  const [teamData, setTeamData] = useState<Team[]>([]);
  const [teamsError, setTeamsError] = useState("");
  const [pagination, setPagination] = useState<{
    count: number;
    nextPage: number | null;
    lastPage: number | null;
    prevPage: number | null;
  } | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) return;

    let mounted = true;

    async function fetchTeams() {
      try {
        setIsFetching(true);
        setTeamsError("");

        const response = await getTeams(safeCurrentPage);
        if (!mounted) return;

        setTeamData(response.data ?? []);
        setPagination({
          count: response.count,
          nextPage: response.nextPage,
          lastPage: response.lastPage,
          prevPage: response.prevPage,
        });
      } catch (error: unknown) {
        if (!mounted) return;

        setTeamData([]);
        setPagination(null);
        setTeamsError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a lista de times.",
        );
      } finally {
        if (mounted) {
          setIsFetching(false);
        }
      }
    }

    fetchTeams();

    return () => {
      mounted = false;
    };
  }, [safeCurrentPage, isAdmin, isAuthLoading]);

  if (isAuthLoading || !isAdmin) {
    return null;
  }

  const hasTeamList = !isFetching;

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {teamData.map((team) => (
                <Card key={team.id} className="transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center">
                    <h3 className="line-clamp-2 text-center text-sm font-medium">
                      {team.name}
                    </h3>
                    <div className="flex min-h-24 items-center justify-center">
                      <TeamLogo
                        teamName={team.name}
                        logoUrl={team.logoUrl}
                        className="h-20 w-20"
                      />
                    </div>

                    <div className="mt-auto">
                      <TeamAdminActions team={team} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {hasTeamList && teamData.length !== 0 ? (
        <div className="py-4">
          <PaginationShadcn
            count={pagination?.count}
            currentPage={safeCurrentPage}
            nextPage={pagination?.nextPage}
            lastPage={pagination?.lastPage}
            prevPage={pagination?.prevPage}
          />
        </div>
      ) : null}
    </>
  );
}
