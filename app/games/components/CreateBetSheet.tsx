"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBet, getBetsByUser, updateBetById } from "@/lib/bets";
import { useBackendUser } from "@/lib/useBackendUser";
import { IDataGame } from "@/types/types";
import { TeamLogo } from "@/components/TeamLogo";
import { cn } from "@/lib/utils";

interface CreateBetSheetProps {
  game: IDataGame;
}

type UIBetOption = "1" | "X" | "2";

const UI_TO_API_OPTION = {
  "1": "HOME_WIN",
  X: "DRAW",
  "2": "AWAY_WIN",
} as const;

const API_TO_UI_OPTION = {
  HOME_WIN: "1",
  DRAW: "X",
  AWAY_WIN: "2",
} as const;

export function CreateBetSheet({ game }: CreateBetSheetProps) {
  const router = useRouter();
  const { backendUser, isLoading, isAuthenticated, canPlaceBets } =
    useBackendUser();
  const isKnockoutGame = game.gameType === "KNOCKOUT";
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<UIBetOption | "">("");
  const [loading, setLoading] = useState(false);
  const [existingBetId, setExistingBetId] = useState<string | null>(null);
  const [isCheckingExistingBet, setIsCheckingExistingBet] = useState(false);

  const selectedOptionClassName =
    "border-orange-500/45 bg-orange-500/12 text-orange-700 dark:border-orange-400/45 dark:bg-orange-400/15 dark:text-orange-200";

  useEffect(() => {
    if (!backendUser?.id) {
      setExistingBetId(null);
      return;
    }

    const loadExistingBet = async () => {
      try {
        setIsCheckingExistingBet(true);
        const userBets = await getBetsByUser(backendUser.id);
        const existingBet = userBets.find((bet) => bet.gameId === game.id);
        setExistingBetId(existingBet?.id ?? null);

        const mappedOption = existingBet
          ? API_TO_UI_OPTION[existingBet.option]
          : "";

        setSelectedOption(
          isKnockoutGame && mappedOption === "X" ? "" : mappedOption,
        );
      } catch {
        setExistingBetId(null);
        setSelectedOption("");
      } finally {
        setIsCheckingExistingBet(false);
      }
    };

    void loadExistingBet();
  }, [backendUser?.id, game.id, isKnockoutGame]);

  const handleCreateBet = async () => {
    if (!isAuthenticated) {
      toast.error("Faça login para apostar");
      return;
    }

    if (isLoading || !backendUser?.id) {
      toast.error("Carregando seu usuário, tente novamente em instantes");
      return;
    }

    if (!canPlaceBets) {
      toast.error("Seu perfil ainda não está liberado para apostar.");
      return;
    }

    if (!selectedOption) {
      toast.error("Selecione uma opção");
      return;
    }

    const option = UI_TO_API_OPTION[selectedOption];

    setLoading(true);
    try {
      if (existingBetId) {
        await updateBetById(existingBetId, { option });

        toast.success("Aposta atualizada com sucesso!");
      } else {
        const createdBet = await createBet({
          gameId: game.id,
          option,
        });

        setExistingBetId(createdBet.id);

        toast.success("Aposta criada com sucesso!");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : existingBetId
            ? "Erro ao atualizar aposta"
            : "Erro ao criar aposta",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={existingBetId ? "secondary" : "default"}
          className={
            existingBetId
              ? "w-full border border-orange-500/35 bg-orange-500/12 text-orange-700 hover:bg-orange-500/18 dark:border-orange-400/40 dark:bg-orange-400/15 dark:text-orange-200 dark:hover:bg-orange-400/20"
              : "w-full"
          }
          disabled={isCheckingExistingBet || isLoading}
        >
          {existingBetId ? <Pencil className="size-4" /> : null}
          {isCheckingExistingBet
            ? "Verificando..."
            : existingBetId
              ? "Editar Aposta"
              : "Fazer Aposta"}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>
            {existingBetId ? "Editar Aposta" : "Fazer Aposta"}
          </SheetTitle>
          <SheetDescription>
            {existingBetId
              ? isKnockoutGame
                ? `Atualize quem avança em ${game.homeTeam} x ${game.awayTeam}`
                : `Atualize sua opção para ${game.homeTeam} x ${game.awayTeam}`
              : isKnockoutGame
                ? `Escolha quem avança em ${game.homeTeam} x ${game.awayTeam}`
                : `Escolha sua opção para ${game.homeTeam} x ${game.awayTeam}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Opção</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOption("1")}
                className={cn(
                  "h-auto justify-start gap-2 px-3 py-3",
                  selectedOption === "1"
                    ? selectedOptionClassName
                    : "hover:bg-muted",
                )}
              >
                <TeamLogo
                  teamName={game.homeTeam}
                  logoUrl={game.homeTeamLogo}
                  className="h-7 w-7"
                />
                <span className="truncate">{game.homeTeam}</span>
              </Button>

              {!isKnockoutGame ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOption("X")}
                  className={cn(
                    "h-auto justify-start gap-2 px-3 py-3 sm:order-3 sm:col-span-2",
                    selectedOption === "X"
                      ? selectedOptionClassName
                      : "hover:bg-muted",
                  )}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center text-lg font-bold">
                    X
                  </span>
                  <span className="truncate text-left">Empate</span>
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOption("2")}
                className={cn(
                  "h-auto justify-start gap-2 px-3 py-3",
                  selectedOption === "2"
                    ? selectedOptionClassName
                    : "hover:bg-muted",
                )}
              >
                <TeamLogo
                  teamName={game.awayTeam}
                  logoUrl={game.awayTeamLogo}
                  className="h-7 w-7"
                />
                <span className="truncate">{game.awayTeam}</span>
              </Button>
            </div>
          </div>

          <Button
            onClick={handleCreateBet}
            disabled={
              loading ||
              isLoading ||
              !backendUser ||
              !selectedOption ||
              !canPlaceBets
            }
            className="w-full"
          >
            {loading
              ? existingBetId
                ? "Salvando..."
                : "Criando..."
              : existingBetId
                ? "Salvar Alterações"
                : "Confirmar Aposta"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
