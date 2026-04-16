"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BET_OPTION_LABEL } from "@/enums/bet-option";
import { GAME_STATUS_LABEL } from "@/enums/game-status";
import { IDataBet } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import {
  BET_OPTION_COLORS,
  BET_RESULT_COLORS,
  GAME_STATUS_COLORS,
} from "@/enums/status-colors";
import {
  ApiBetOption,
  getBetById,
  getBetOptionText as getBetOptionDisplayText,
  getBetResultLabel,
  updateBetById,
} from "@/lib/bets";
import { formatDateTimeBR } from "@/lib/date-time";

type BetOptionKey = keyof typeof BET_OPTION_LABEL;

const BET_OPTIONS = Object.keys(BET_OPTION_LABEL) as BetOptionKey[];

function getBetOptionText(option: ApiBetOption, bet: IDataBet): string {
  return getBetOptionDisplayText(option, bet.game);
}

export default function EditBetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const betId = params?.id;

  const [bet, setBet] = useState<IDataBet | null>(null);
  const [option, setOption] = useState<ApiBetOption | "">("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isMarketOpen = bet?.game.status === "SCHEDULED";
  const betResult = bet ? getBetResultLabel(bet) : null;

  useEffect(() => {
    async function fetchBet() {
      if (!betId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBetById(betId);
        setBet(data);
        setOption(data.option as ApiBetOption);
      } catch {
        toast.error("Erro ao carregar aposta");
      } finally {
        setLoading(false);
      }
    }

    fetchBet();
  }, [betId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bet || submitting) return;
    if (!isMarketOpen) {
      toast.error("Mercado fechado. Não é possível editar essa aposta.");
      return;
    }

    if (!option) {
      toast.error("Selecione uma opção de aposta.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: { option: ApiBetOption } = {
        option,
      };

      await updateBetById(bet.id, payload);

      toast.success("Aposta atualizada com sucesso!");
      router.push(`/users/${bet.userId}`);
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar aposta");
      setSubmitting(false);
    }
  }

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Apostas", href: "/bets" },
          { label: `Editar aposta` },
        ]}
      />
      <TiTleSeparator title="Editar Aposta" />

      <div className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da aposta</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Carregando aposta...
              </p>
            ) : !bet ? (
              <p className="text-sm text-red-600">Aposta não encontrada.</p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Detalhes do jogo
                  </label>
                  <div className="rounded-lg border border-primary/50 bg-primary/9 p-3 text-sm space-y-1 mt-2">
                    <p>
                      <span className="font-semibold">Competição:</span>{" "}
                      {bet.game?.competition}
                    </p>
                    <p>
                      <span className="font-semibold">Partida:</span>{" "}
                      {bet.game.homeTeam} x {bet.game.awayTeam}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {GAME_STATUS_LABEL[
                        bet.game.status as keyof typeof GAME_STATUS_LABEL
                      ] ?? bet.game.status}
                    </p>
                    <p>
                      <span className="font-semibold">Data do jogo:</span>{" "}
                      {formatDateTimeBR(bet.game.gameDate)}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Fechamento das apostas:
                      </span>{" "}
                      {formatDateTimeBR(bet.game.betCloseAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Aposta:</span>{" "}
                      <Badge
                        variant="outline"
                        className={BET_OPTION_COLORS[bet.option] ?? ""}
                      >
                        {getBetOptionText(bet.option as ApiBetOption, bet)}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-semibold">Status do jogo:</span>{" "}
                      <Badge
                        variant="outline"
                        className={GAME_STATUS_COLORS[bet.game.status] ?? ""}
                      >
                        {GAME_STATUS_LABEL[
                          bet.game.status as keyof typeof GAME_STATUS_LABEL
                        ] ?? bet.game.status}
                      </Badge>
                    </p>
                    {betResult ? (
                      <p>
                        <span className="font-semibold">Resultado:</span>{" "}
                        <Badge
                          variant="outline"
                          className={BET_RESULT_COLORS[betResult] ?? ""}
                        >
                          {betResult}
                        </Badge>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Opção da aposta</label>
                  <Select
                    value={option}
                    onValueChange={(value) => setOption(value as ApiBetOption)}
                    disabled={!isMarketOpen || submitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      {BET_OPTIONS.map((betOption) => (
                        <SelectItem key={betOption} value={betOption}>
                          {getBetOptionText(betOption as ApiBetOption, bet)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isMarketOpen ? (
                  <p className="text-sm text-muted-foreground">
                    Mercado fechado. Apenas apostas com jogo aberto podem ser
                    editadas.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isMarketOpen || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
