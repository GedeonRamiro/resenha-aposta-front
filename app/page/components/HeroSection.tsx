import LiveMatches from "@/components/liveMatches";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  gamesCount: number;
  betsCount: number;
  rankingCount: number;
  postsCount: number;
}

export default function HeroSection({
  gamesCount,
  betsCount,
  rankingCount,
  postsCount,
}: HeroSectionProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-primary/25 bg-linear-to-br from-primary/20 via-background to-primary/10 p-5 shadow-[0_26px_90px_-46px_rgba(234,88,12,0.72)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <Badge
            variant="outline"
            className="rounded-full border-primary/25 bg-primary/18 px-3 py-1 text-primary hover:bg-primary/20"
          >
            Painel principal
          </Badge>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Resumo enxuto para acompanhar jogos, apostas e o que move o blog.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Um layout mais direto, com destaque para o que importa agora e
              leitura rapida dos dados recentes.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md">
          <div className="rounded-2xl border border-primary/25 bg-background/88 p-4 shadow-[0_16px_40px_-34px_rgba(234,88,12,0.6)] backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
              Em evidencia
            </p>
            <p className="mt-2 text-lg font-semibold">{gamesCount} jogos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {betsCount} apostas registradas no momento.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-background/88 p-4 shadow-[0_16px_40px_-34px_rgba(234,88,12,0.6)] backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/75">
              Comunidade
            </p>
            <p className="mt-2 text-lg font-semibold">
              {rankingCount} no ranking
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {postsCount} posts publicados no blog.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-3">
        <LiveMatches />
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="border border-primary/25 bg-card/95 shadow-[0_18px_45px_-40px_rgba(234,88,12,0.6)] ring-primary/20 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground">Jogos</p>
          <p className="mt-2 text-2xl font-semibold">{gamesCount}</p>
        </div>

        <div className="border border-primary/25 bg-card/95 shadow-[0_18px_45px_-40px_rgba(234,88,12,0.6)] ring-primary/20 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground">Apostas</p>
          <p className="mt-2 text-2xl font-semibold">{betsCount}</p>
        </div>

        <div className="border border-primary/25 bg-card/95 shadow-[0_18px_45px_-40px_rgba(234,88,12,0.6)] ring-primary/20 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Ranking ativo
          </p>
          <p className="mt-2 text-2xl font-semibold">{rankingCount}</p>
        </div>

        <div className="border border-primary/25 bg-card/95 shadow-[0_18px_45px_-40px_rgba(234,88,12,0.6)] ring-primary/20 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground">Blog</p>
          <p className="mt-2 text-2xl font-semibold">{postsCount}</p>
        </div>
      </div>
    </section>
  );
}
