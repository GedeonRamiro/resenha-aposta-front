import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import { getUserScores } from "@/lib/user-scores";
import { PeriodFilters } from "./components/PeriodFilters";
import RankingChart from "./components/RankingChart";
import RankingTable from "./components/RankingTable";
import StatsCards from "./components/StatsCards";
import HitRateChart from "./components/HitRateChart";

export default async function UserScoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: "geral" | "abril" | "maio";
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;
  const { period, startDate, endDate } = params;
  const hasSelectedFilter = Boolean(period || startDate || endDate);

  let ranking: Awaited<ReturnType<typeof getUserScores>> | null = null;
  let error = "";

  if (hasSelectedFilter) {
    try {
      ranking = await getUserScores(startDate, endDate);
    } catch {
      error = "Não foi possível carregar o ranking.";
    }
  }

  const hasData = ranking && ranking.length > 0;

  return (
    <>
      <TiTleSeparator title="Ranking de Apostadores" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-4 w-full">
          <PeriodFilters />
          <DateRangeFilter />
        </div>
      </div>

      {!hasSelectedFilter ? (
        <p className="text-sm text-muted-foreground text-center">
          Selecione um período para carregar o ranking.
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !hasData ? (
        <p className="text-sm text-muted-foreground text-center">
          Nenhum dado de ranking disponível para o período selecionado.
        </p>
      ) : (
        <div className="space-y-8">
          <StatsCards data={ranking!} />
          <RankingChart data={ranking!} />
          <HitRateChart data={ranking!} />
          <RankingTable data={ranking!} />
        </div>
      )}
    </>
  );
}
