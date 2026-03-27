import PaginationShadcn from "@/components/PaginationShadcn";
import BetsList from "./components/betsList";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import TiTleSeparator from "@/components/TiTleSeparator";
import { getBets } from "@/lib/bets";

export default async function Bets({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;

  const currentPage = parseInt(params.page ?? "1");

  const { startDate, endDate } = params;

  let bets = null;
  let betsError = "";

  try {
    bets = await getBets(currentPage, startDate, endDate);
  } catch (error: unknown) {
    betsError =
      error instanceof Error
        ? error.message
        : "Nao foi possivel carregar as apostas.";
  }

  const hasBets = Boolean(bets && Array.isArray(bets.data));
  const betsData = bets?.data ?? [];

  return (
    <>
      <TiTleSeparator title="Todas as Apostas" />

      <div className="flex justify-between mb-6">
        <DateRangeFilter />
      </div>

      {betsError ? <p className="text-sm text-red-600">{betsError}</p> : null}

      {!hasBets ? (
        <p className="text-sm text-muted-foreground">
          Nao foi possivel carregar os dados de apostas.
        </p>
      ) : betsData.length === 0 ? (
        <div className="text-center text-muted-foreground">
          Nenhuma aposta encontrada para os filtros aplicados.
        </div>
      ) : null}

      <BetsList data={betsData} />

      {hasBets && betsData.length !== 0 && (
        <div className="py-4">
          <PaginationShadcn
            count={bets?.count}
            currentPage={currentPage}
            nextPage={bets?.nextPage}
            lastPage={bets?.lastPage}
            prevPage={bets?.prevPage}
          />
        </div>
      )}
    </>
  );
}
