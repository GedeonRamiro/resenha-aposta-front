"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PaginationShadcn from "@/components/PaginationShadcn";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import TiTleSeparator from "@/components/TiTleSeparator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Competition, getCompetitions } from "@/lib/competitions";
import { useBackendUser } from "@/lib/useBackendUser";
import { CompetitionAdminActions } from "./components/CompetitionAdminActions";
import { CompetitionFormDialog } from "./components/CompetitionFormDialog";

export default function CompetitionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading: isAuthLoading } = useBackendUser();

  const currentPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const safeCurrentPage =
    Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  const [competitionData, setCompetitionData] = useState<Competition[]>([]);
  const [competitionsError, setCompetitionsError] = useState("");
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

    async function fetchCompetitions() {
      try {
        setIsFetching(true);
        setCompetitionsError("");

        const response = await getCompetitions(safeCurrentPage);
        if (!mounted) return;

        setCompetitionData(response.data ?? []);
        setPagination({
          count: response.count,
          nextPage: response.nextPage,
          lastPage: response.lastPage,
          prevPage: response.prevPage,
        });
      } catch (error: unknown) {
        if (!mounted) return;

        setCompetitionData([]);
        setPagination(null);
        setCompetitionsError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a lista de competições.",
        );
      } finally {
        if (mounted) {
          setIsFetching(false);
        }
      }
    }

    fetchCompetitions();

    return () => {
      mounted = false;
    };
  }, [safeCurrentPage, isAdmin, isAuthLoading]);

  if (isAuthLoading || !isAdmin) {
    return null;
  }

  const hasCompetitionList = !isFetching;

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {competitionData.map((competition) => (
                <Card
                  key={competition.id}
                  className="transition-all hover:shadow-md"
                >
                  <CardContent className="flex flex-col items-center">
                    <h3 className="line-clamp-2 text-center text-sm font-medium">
                      {competition.name}
                    </h3>

                    <div className="flex min-h-24 items-center justify-center">
                      <CompetitionLogo
                        competitionName={competition.name}
                        logoUrl={competition.logoUrl}
                        className="h-20 w-20"
                      />
                    </div>

                    <div className="mt-auto">
                      <CompetitionAdminActions competition={competition} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {hasCompetitionList && competitionData.length !== 0 ? (
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
