"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Lock, Trophy } from "lucide-react";

import {
  CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import { cn } from "@/lib/utils";
import { IDataGame } from "@/types/types";
import { formatDate } from "./utils";
import { TeamLogo } from "@/components/TeamLogo";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

interface RecentGamesProps {
  games: IDataGame[];
}

export default function RecentGames({ games }: RecentGamesProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const updateIndicators = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
      setSnapCount(carouselApi.scrollSnapList().length);
    };

    updateIndicators();
    carouselApi.on("select", updateIndicators);
    carouselApi.on("reInit", updateIndicators);

    return () => {
      carouselApi.off("select", updateIndicators);
      carouselApi.off("reInit", updateIndicators);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || games.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 4500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [carouselApi, games.length]);

  return (
    <Card className={surfaceCardClassName}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Jogos recentes</CardTitle>
            <CardDescription>
              Leitura rapida dos confrontos mais recentes com status do mercado.
            </CardDescription>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/15"
          >
            <Link href="/games">Todos os jogos</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum jogo encontrado.
          </p>
        ) : (
          <>
            <Carousel
              className="w-full"
              setApi={setCarouselApi}
              opts={{ loop: true }}
            >
              <CarouselContent>
                {games.map((game) => (
                  <CarouselItem
                    key={game.id}
                    className="md:basis-1/2 xl:basis-full 2xl:basis-1/2"
                  >
                    <div className="flex h-full flex-col rounded-[1.4rem] border border-primary/15 bg-background/90 p-4">
                      <p className="flex items-start gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
                        <Trophy className="mt-0.5 size-3.5 shrink-0" />
                        <span className="whitespace-normal wrap-break-word leading-relaxed">
                          {game.competition ?? "Partida cadastrada"}
                        </span>
                      </p>

                      <div className="mt-2 space-y-2 text-lg font-semibold leading-snug">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              teamName={game.homeTeam}
                              logoUrl={game.homeTeamLogo}
                            />
                            <span className="truncate">{game.homeTeam}</span>
                          </div>

                          {typeof game.homeScore === "number" ? (
                            <span className="shrink-0">{game.homeScore}</span>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              teamName={game.awayTeam}
                              logoUrl={game.awayTeamLogo}
                            />
                            <span className="truncate">{game.awayTeam}</span>
                          </div>

                          {typeof game.awayScore === "number" ? (
                            <span className="shrink-0">{game.awayScore}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-primary" />
                          <span>{formatDate(game.gameDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="size-4 text-primary" />
                          <span>
                            Mercado fecha em {formatDate(game.betCloseAt)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-fit rounded-full border px-3 py-1 text-[11px] font-semibold",
                            GAME_STATUS_COLORS[game.status] ?? "",
                          )}
                        >
                          {GAME_STATUS_LABEL[
                            game.status as keyof typeof GAME_STATUS_LABEL
                          ] ?? game.status}
                        </Badge>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {snapCount > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: snapCount }).map((_, index) => {
                  const isActive = selectedIndex === index;

                  return (
                    <button
                      key={`games-indicator-${index}`}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      aria-label={`Ir para slide ${index + 1} de jogos`}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-300",
                        isActive
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-primary/30 hover:bg-primary/50",
                      )}
                    />
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
