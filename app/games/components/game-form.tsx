"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eraser, Loader2, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GAME_STATUS_LABEL, GameStatus } from "@/enums/game-status";
import { GAME_STATUS_COLORS } from "@/enums/status-colors";
import { getTeamsSafe, Team } from "@/lib/teams";
import { Competition, getCompetitionsSafe } from "@/lib/competitions";
import { cn } from "@/lib/utils";
import { gameFormSchema, type GameFormValues } from "./game-form.schema";
import { ScorePhaseCard } from "./score-fields";
import { TeamAutocomplete } from "./team-autocomplete";

export type { GameFormValues };

type GameFormProps = {
  initialData?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  loading?: boolean;
};

const FIELD_UPDATE_OPTIONS = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const;

function getStatusIcon(status: GameStatus) {
  switch (status) {
    case GameStatus.SCHEDULED:
      return LockOpen;
    case GameStatus.CLOSED:
      return Lock;
    case GameStatus.FINISHED:
      return Check;
  }
}

export function GameForm({ initialData, onSubmit, loading }: GameFormProps) {
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    mode: "onTouched",
    defaultValues: {
      gameDate: initialData?.gameDate ?? "",
      gameType: initialData?.gameType ?? "LEAGUE_GROUP",
      homeTeamId: initialData?.homeTeamId ?? "",
      awayTeamId: initialData?.awayTeamId ?? "",
      competitionId: initialData?.competitionId ?? "",
      moreInfo: initialData?.moreInfo ?? "",
      secondLegHomeScore: initialData?.secondLegHomeScore ?? "",
      secondLegAwayScore: initialData?.secondLegAwayScore ?? "",
      status: initialData?.status ?? undefined,
      homeScore: initialData?.homeScore ?? undefined,
      awayScore: initialData?.awayScore ?? undefined,
      penaltyHomeScore: initialData?.penaltyHomeScore ?? undefined,
      penaltyAwayScore: initialData?.penaltyAwayScore ?? undefined,
    },
  });

  const isEditing = !!initialData;
  const isBusy = !!loading || form.formState.isSubmitting;
  const isKnockout = form.watch("gameType") === "KNOCKOUT";
  const selectedHomeTeamId = form.watch("homeTeamId");
  const selectedAwayTeamId = form.watch("awayTeamId");

  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [teamsData, competitionsData] = await Promise.all([
        getTeamsSafe(),
        getCompetitionsSafe(),
      ]);

      if (!mounted) return;

      setTeams(teamsData);
      setCompetitions(competitionsData);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  function clearSecondLegScores() {
    form.setValue("secondLegHomeScore", "", FIELD_UPDATE_OPTIONS);
    form.setValue("secondLegAwayScore", "", FIELD_UPDATE_OPTIONS);
  }

  function clearPenaltyScores() {
    form.setValue("penaltyHomeScore", undefined, FIELD_UPDATE_OPTIONS);
    form.setValue("penaltyAwayScore", undefined, FIELD_UPDATE_OPTIONS);
  }

  function closeGameAfter(clear: () => void) {
    clear();
    form.setValue("status", GameStatus.CLOSED, FIELD_UPDATE_OPTIONS);
  }

  useEffect(() => {
    if (isKnockout) return;

    clearSecondLegScores();
    clearPenaltyScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKnockout]);

  const submitLabel = isEditing ? "Atualizar" : "Criar";
  const busyLabel = isEditing ? "Atualizando..." : "Criando...";

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardContent>
          Preencha os dados da partida. Em mata-mata, informe ida, volta e
          pênaltis. Em Liga/Grupos, informe apenas o resultado.
        </CardContent>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeamId"
                render={({ field }) => (
                  <TeamAutocomplete
                    label="Time da casa (cadastro)"
                    teams={teams}
                    value={field.value}
                    onChange={field.onChange}
                    excludedTeamId={selectedAwayTeamId}
                    disabled={isBusy}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="awayTeamId"
                render={({ field }) => (
                  <TeamAutocomplete
                    label="Time visitante (cadastro)"
                    teams={teams}
                    value={field.value}
                    onChange={field.onChange}
                    excludedTeamId={selectedHomeTeamId}
                    disabled={isBusy}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="competitionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Competição (cadastro)
                    <span className="text-red-500"> *</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar competição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {competitions.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de jogo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isBusy}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEAGUE_GROUP">Liga/Grupos</SelectItem>
                      <SelectItem value="KNOCKOUT">Mata-mata</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isKnockout ? (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    className="w-full sm:w-auto"
                    onClick={() => closeGameAfter(clearSecondLegScores)}
                  >
                    <Eraser className="mr-2 size-4" />
                    Limpar placares da volta
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    className="w-full sm:w-auto"
                    onClick={() => closeGameAfter(clearPenaltyScores)}
                  >
                    <Eraser className="mr-2 size-4" />
                    Limpar pênaltis
                  </Button>
                </div>

                <div className="space-y-4">
                  <ScorePhaseCard
                    title="Placar ida"
                    control={form.control}
                    homeName="homeScore"
                    awayName="awayScore"
                    disabled={isBusy}
                  />
                  <ScorePhaseCard
                    title="Placar volta"
                    control={form.control}
                    homeName="secondLegHomeScore"
                    awayName="secondLegAwayScore"
                    variant="text"
                    disabled={isBusy}
                  />
                  <ScorePhaseCard
                    title="Pênaltis"
                    control={form.control}
                    homeName="penaltyHomeScore"
                    awayName="penaltyAwayScore"
                    disabled={isBusy}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <ScorePhaseCard
                  title="Resultado"
                  control={form.control}
                  homeName="homeScore"
                  awayName="awayScore"
                  disabled={isBusy}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>

                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(GameStatus).map((status) => {
                        const Icon = getStatusIcon(status);
                        const isSelected = field.value === status;

                        return (
                          <Button
                            key={status}
                            type="button"
                            variant="outline"
                            disabled={isBusy}
                            aria-pressed={isSelected}
                            onClick={() => field.onChange(status)}
                            className={cn(
                              "h-auto min-h-16 flex-col gap-2 px-3 py-3 text-center",
                              isSelected
                                ? GAME_STATUS_COLORS[status]
                                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                            <span>{GAME_STATUS_LABEL[status]}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data do Jogo <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" disabled={isBusy} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moreInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações (IA/manual em markdown)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Digite as informações do jogo em markdown..."
                      disabled={isBusy}
                      className="min-h-48 w-full rounded-md border bg-background p-3 font-mono text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {busyLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
