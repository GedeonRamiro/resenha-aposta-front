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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createBet,
  getBetsByUser,
  updateBetById,
  type UserBetSummary,
} from "@/lib/bets";
import { useBackendUser } from "@/lib/useBackendUser";
import { IDataGame } from "@/types/types";

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

const userBetsCache = new Map<string, UserBetSummary[]>();
const userBetsPromiseCache = new Map<string, Promise<UserBetSummary[]>>();

async function getCachedUserBets(userId: string): Promise<UserBetSummary[]> {
  const cached = userBetsCache.get(userId);
  if (cached) {
    return cached;
  }

  const inFlight = userBetsPromiseCache.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const request = getBetsByUser(userId)
    .then((bets) => {
      userBetsCache.set(userId, bets);
      return bets;
    })
    .finally(() => {
      userBetsPromiseCache.delete(userId);
    });

  userBetsPromiseCache.set(userId, request);
  return request;
}

export function CreateBetSheet({ game }: CreateBetSheetProps) {
  const router = useRouter();
  const { backendUser, isLoading, isAuthenticated } = useBackendUser();
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<UIBetOption | "">("");
  const [loading, setLoading] = useState(false);
  const [existingBetId, setExistingBetId] = useState<string | null>(null);
  const [isCheckingExistingBet, setIsCheckingExistingBet] = useState(false);
  const isPendingUser = backendUser?.role === "PENDING";

  useEffect(() => {
    if (!backendUser?.id) {
      setExistingBetId(null);
      return;
    }

    const loadExistingBet = async () => {
      try {
        setIsCheckingExistingBet(true);
        const userBets = await getCachedUserBets(backendUser.id);
        const existingBet = userBets.find((bet) => bet.gameId === game.id);
        setExistingBetId(existingBet?.id ?? null);
        setSelectedOption(
          existingBet ? API_TO_UI_OPTION[existingBet.option] : "",
        );
      } catch {
        setExistingBetId(null);
        setSelectedOption("");
      } finally {
        setIsCheckingExistingBet(false);
      }
    };

    void loadExistingBet();
  }, [backendUser?.id, game.id]);

  const handleCreateBet = async () => {
    if (!isAuthenticated) {
      toast.error("Faça login para apostar");
      return;
    }

    if (isLoading || !backendUser?.id) {
      toast.error("Carregando seu usuário, tente novamente em instantes");
      return;
    }

    if (isPendingUser) {
      toast.error("Seu cadastro ainda está pendente de aprovação.");
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

        const cachedUserBets = userBetsCache.get(backendUser.id) ?? [];
        userBetsCache.set(
          backendUser.id,
          cachedUserBets.map((bet) =>
            bet.id === existingBetId
              ? {
                  ...bet,
                  option,
                  updatedAt: new Date().toISOString(),
                }
              : bet,
          ),
        );

        toast.success("Aposta atualizada com sucesso!");
      } else {
        const createdBet = await createBet({
          userId: backendUser.id,
          gameId: game.id,
          option,
        });

        const cachedUserBets = userBetsCache.get(backendUser.id) ?? [];
        userBetsCache.set(backendUser.id, [
          ...cachedUserBets,
          {
            id: createdBet.id,
            userId: createdBet.userId,
            gameId: createdBet.gameId,
            option: createdBet.option,
            createdAt: createdBet.createdAt,
            updatedAt: createdBet.updatedAt,
          },
        ]);
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
              ? "w-full border border-orange-500/35 bg-orange-500/12 text-orange-700 hover:bg-orange-500/18"
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
              ? `Atualize sua opção para ${game.homeTeam} x ${game.awayTeam}`
              : `Escolha sua opção para ${game.homeTeam} x ${game.awayTeam}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Opção</label>
            <Select
              value={selectedOption}
              onValueChange={(value) => setSelectedOption(value as UIBetOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{game.homeTeam}</SelectItem>
                <SelectItem value="X">Empate</SelectItem>
                <SelectItem value="2">{game.awayTeam}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateBet}
            disabled={
              loading ||
              isLoading ||
              !backendUser ||
              !selectedOption ||
              isPendingUser
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
