"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { GameForm, GameFormValues } from "../../components/game-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { getGameById, updateGameById } from "@/lib/games";
import { GameStatus } from "@/enums/game-status";

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [initialData, setInitialData] =
    useState<Partial<GameFormValues> | null>(null);
  const submittingRef = useRef(false);

  function formatDateTimeLocal(date: string): string {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  useEffect(() => {
    async function fetchGame() {
      if (!id) {
        setIsFetchingInitial(false);
        return;
      }

      try {
        const data = await getGameById(id);
        setInitialData({
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          homeTeamLogo: data.homeTeamLogo ?? undefined,
          awayTeamLogo: data.awayTeamLogo ?? undefined,
          competition: data.competition ?? undefined,
          gameDate: formatDateTimeLocal(data.gameDate),
          betCloseAt: formatDateTimeLocal(data.betCloseAt),
          moreInfo: data.moreInfo ?? undefined,
          status: data.status as GameStatus,
          homeScore: data.homeScore ?? undefined,
          awayScore: data.awayScore ?? undefined,
        });
      } catch {
        toast.error("Erro ao carregar jogo");
      } finally {
        setIsFetchingInitial(false);
      }
    }

    fetchGame();
  }, [id]);

  async function onSubmit(data: GameFormValues) {
    if (!id || submittingRef.current || isSubmitting) return;

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      await updateGameById(id, data);
      toast.success("Jogo atualizado!");
      router.push("/games");
    } catch {
      toast.error("Erro ao atualizar jogo");

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
