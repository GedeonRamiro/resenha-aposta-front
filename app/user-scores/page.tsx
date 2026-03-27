import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import { getUserScores } from "@/lib/user-scores";
import RankingChart from "./components/RankingChart";
import RankingTable from "./components/RankingTable";
import StatsCards from "./components/StatsCards";
import HitRateChart from "./components/HitRateChart";

export default async function UserScoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;
  const { startDate, endDate } = params;

  let ranking: Awaited<ReturnType<typeof getUserScores>> | null = null;
  let error = "";

  try {
    ranking = await getUserScores(startDate, endDate);
  } catch {
    error = "Não foi possível carregar o ranking.";
  }

  const hasData = ranking && ranking.length > 0;

  return (
    <>
      <TiTleSeparator title="Ranking de Apostadores" />

      <div className="flex justify-between items-center mb-6">
        <DateRangeFilter />
      </div>

      {error ? (
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
