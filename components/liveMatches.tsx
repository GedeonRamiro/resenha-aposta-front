"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

type LiveMatch = {
  id: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  league: string;
  time: string;
};

export default function LiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/live", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMatches(data);
      } else {
        setMatches([]);
        setError(data?.error || "Erro desconhecido ao buscar partidas ao vivo");
      }
    } catch (error: unknown) {
      setMatches([]);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  console.log(matches.length && "oi");
  return (
    <>
      {loading && (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}
      {error && (
        <div className="w-full border-b py-3 text-center text-sm text-primary">
          {error}
        </div>
      )}
      {matches.length > 0 && (
        <div className="w-full overflow-hidden border-b bg-muted/30 py-2">
          <Carousel className="w-full">
            <CarouselContent className="flex">
              {matches.map((match) => (
                <CarouselItem
                  key={match.id}
                  className="basis-50 sm:basis-42.5 md:basis-47.5 shrink-0"
                >
                  <Card className="h-full">
                    <CardContent className="flex flex-col gap-1 p-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground font-medium">
                        <span className="truncate">{match.league}</span>

                        <span className="flex items-center gap-1 text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          LIVE
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="truncate">{match.home}</span>
                        <span className="font-bold">{match.homeScore}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="truncate">{match.away}</span>
                        <span className="font-bold">{match.awayScore}</span>
                      </div>

                      <div className="flex justify-end text-muted-foreground">
                        {match.time}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      )}
    </>
  );
}
