"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { GameForm, GameFormValues } from "../../components/game-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import {
  formatOptionalScoreInput,
  getGameById,
  parseOptionalScoreInput,
  updateGameById,
} from "@/lib/games";
import { GameStatus } from "@/enums/game-status";
import { useBackendUser } from "@/lib/useBackendUser";

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canManageGames, isLoading: isAuthLoading } = useBackendUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [initialData, setInitialData] =
    useState<Partial<GameFormValues> | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!canManageGames) router.replace("/games");
  }, [canManageGames, isAuthLoading, router]);

  function formatDateTimeLocal(date: string): string {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  useEffect(() => {
    if (isAuthLoading || !canManageGames) return;
    async function fetchGame() {
      if (!id) {
        setIsFetchingInitial(false);
        return;
      }

      try {
        const data = await getGameById(id);
        setInitialData({
          homeTeamId: data.homeTeamId ?? undefined,
          awayTeamId: data.awayTeamId ?? undefined,
          competitionId: data.competitionId ?? undefined,
          gameDate: formatDateTimeLocal(data.gameDate),
          gameType:
            (data.gameType as "LEAGUE_GROUP" | "KNOCKOUT" | undefined) ??
            "LEAGUE_GROUP",
          moreInfo: data.moreInfo ?? undefined,
          status: data.status as GameStatus,
          homeScore: data.homeScore ?? undefined,
          awayScore: data.awayScore ?? undefined,
          penaltyHomeScore: data.penaltyHomeScore ?? undefined,
          penaltyAwayScore: data.penaltyAwayScore ?? undefined,
          secondLegHomeScore: formatOptionalScoreInput(data.secondLegHomeScore),
          secondLegAwayScore: formatOptionalScoreInput(data.secondLegAwayScore),
        });
      } catch {
        toast.error("Erro ao carregar jogo");
      } finally {
        setIsFetchingInitial(false);
      }
    }

    fetchGame();
  }, [id, canManageGames, isAuthLoading]);

  if (isAuthLoading || !canManageGames) return null;

  async function onSubmit(data: GameFormValues) {
    if (!id || submittingRef.current || isSubmitting) return;

    try {
      const secondLegHomeScore = parseOptionalScoreInput(
        data.secondLegHomeScore,
      );
      const secondLegAwayScore = parseOptionalScoreInput(
        data.secondLegAwayScore,
      );

      submittingRef.current = true;
      setIsSubmitting(true);
      await updateGameById(id, {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        competitionId: data.competitionId,
        gameDate: data.gameDate,
        gameType: data.gameType,
        moreInfo: data.moreInfo,
        status: data.status,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        penaltyHomeScore: data.penaltyHomeScore,
        penaltyAwayScore: data.penaltyAwayScore,
        secondLegHomeScore,
        secondLegAwayScore,
      });
      toast.success("Jogo atualizado!");
      router.push("/games");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Erro ao atualizar jogo";
      toast.error(message);

      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (isFetchingInitial) {
    return (
      <div className="flex justify-center mt-10">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Jogos", href: "/games" },
          { label: "Editar Jogo" },
        ]}
      />
      <TiTleSeparator title="Editar Jogo" />
      <div className="flex justify-center mt-10">
        <GameForm
          initialData={initialData}
          onSubmit={onSubmit}
          loading={isSubmitting}
        />
      </div>
    </>
  );
}
