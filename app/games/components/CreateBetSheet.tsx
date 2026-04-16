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
import { createBet, getBetsByUser, type UserBetSummary } from "@/lib/bets";
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
      } catch {
        setExistingBetId(null);
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

    if (existingBetId) {
      router.push(`/bets/${existingBetId}`);
      return;
    }

    if (!selectedOption) {
      toast.error("Selecione uma opção");
      return;
    }

    const option = UI_TO_API_OPTION[selectedOption];

    setLoading(true);
    try {
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
          option: createdBet.option as typeof option,
          createdAt: createdBet.createdAt,
          updatedAt: createdBet.updatedAt,
        },
      ]);
      setExistingBetId(createdBet.id);

      toast.success("Aposta criada com sucesso!");
      setOpen(false);
      setSelectedOption("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar aposta",
      );
    } finally {
      setLoading(false);
    }
  };

  if (existingBetId) {
    return (
      <Button
        variant="secondary"
        className="w-full border border-orange-500/35 bg-orange-500/12 text-orange-700 hover:bg-orange-500/18"
        disabled={isLoading || isCheckingExistingBet}
        onClick={() => router.push(`/bets/${existingBetId}`)}
      >
        <Pencil className="size-4" />
        {isCheckingExistingBet ? "Verificando..." : "Editar Aposta"}
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full " disabled={isCheckingExistingBet}>
          {isCheckingExistingBet ? "Verificando..." : "Fazer Aposta"}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Fazer Aposta</SheetTitle>
          <SheetDescription>
            Escolha sua opção para {game.homeTeam} x {game.awayTeam}
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
            {loading ? "Criando..." : "Confirmar Aposta"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
