"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  Eraser,
  Loader2,
  Lock,
  LockOpen,
  Minus,
  Plus,
} from "lucide-react";
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

const optionalScoreInput = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || /^\d+$/.test(value.trim()), {
    message: "Use um número inteiro maior ou igual a zero.",
  });

const optionalNonNegativeNumber = z
  .number({ error: "Placar deve ser um número" })
  .min(0, "Placar não pode ser negativo")
  .optional();

const schema = z
  .object({
    gameDate: z.string().trim().min(1, "Data do jogo é obrigatória"),
    gameType: z.enum(["LEAGUE_GROUP", "KNOCKOUT"]),
    homeTeamId: z.string().trim().min(1, "Selecione o time da casa"),
    awayTeamId: z.string().trim().min(1, "Selecione o time visitante"),
    competitionId: z.string().trim().min(1, "Selecione a competição"),
    moreInfo: z.string().optional(),
    secondLegHomeScore: optionalScoreInput,
    secondLegAwayScore: optionalScoreInput,

    status: z.nativeEnum(GameStatus).optional(),

    homeScore: optionalNonNegativeNumber,
    awayScore: optionalNonNegativeNumber,
    penaltyHomeScore: optionalNonNegativeNumber,
    penaltyAwayScore: optionalNonNegativeNumber,
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Time da casa e visitante devem ser diferentes.",
    path: ["awayTeamId"],
  });

export type GameFormValues = z.infer<typeof schema>;

type GameFormProps = {
  initialData?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  loading?: boolean;
};

function TeamSuggestionAvatar({ team }: { team: Team }) {
  const initials = team.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (team.logoUrl) {
    return (
      <span
        aria-hidden
        className="size-6 shrink-0 rounded-full border bg-cover bg-center"
        style={{ backgroundImage: `url(${team.logoUrl})` }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="size-6 shrink-0 rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground flex items-center justify-center"
    >
      {initials || "--"}
    </span>
  );
}

function sanitizeOptionalScoreText(value: string): string {
  return value.replace(/\D/g, "");
}

type ScoreStepperInputProps = {
  value: number | string | undefined;
  disabled?: boolean;
  name: string;
  onBlur: () => void;
  onChange: (value: number | string | undefined) => void;
  inputRef: React.Ref<HTMLInputElement>;
  variant: "number" | "text";
};

function ScoreStepperInput({
  value,
  disabled,
  name,
  onBlur,
  onChange,
  inputRef,
  variant,
}: ScoreStepperInputProps) {
  const currentValue =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value
        : "";

  const updateValue = (nextValue: number) => {
    if (variant === "text") {
      onChange(String(Math.max(nextValue, 0)));
      return;
    }

    onChange(Math.max(nextValue, 0));
  };

  const handleStep = (delta: number) => {
    const parsedValue = Number.parseInt(currentValue, 10);
    const safeValue =
      Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
    updateValue(safeValue + delta);
  };

  return (
    <div className="inline-flex items-stretch gap-1.5">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={currentValue}
        onChange={(event) => {
          const nextValue = sanitizeOptionalScoreText(event.target.value);

          if (variant === "text") {
            onChange(nextValue);
            return;
          }

          onChange(nextValue === "" ? undefined : Number(nextValue));
        }}
        onBlur={onBlur}
        name={name}
        ref={inputRef}
        className="h-11 w-12 rounded-lg px-1 text-center text-sm font-semibold tabular-nums"
      />

      <div className="flex flex-col overflow-hidden rounded-lg border border-input bg-background">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-5 w-5 rounded-none border-b border-input"
          aria-label="Aumentar placar"
          onClick={() => handleStep(1)}
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-5 w-5 rounded-none"
          aria-label="Diminuir placar"
          onClick={() => handleStep(-1)}
        >
          <Minus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ScorePhaseCard({
  title,
  homeLabel,
  awayLabel,
  homeField,
  awayField,
}: {
  title: string;
  homeLabel: string;
  awayLabel: string;
  homeField: React.ReactNode;
  awayField: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1.5 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            {homeLabel}
          </span>
          <div className="flex justify-center">{homeField}</div>
        </div>

        <div className="space-y-1.5 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            {awayLabel}
          </span>
          <div className="flex justify-center">{awayField}</div>
        </div>
      </div>
    </div>
  );
}

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
    resolver: zodResolver(schema),
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
  const gameType = form.watch("gameType");
  const selectedHomeTeamId = form.watch("homeTeamId");
  const selectedAwayTeamId = form.watch("awayTeamId");

  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [homeTeamQuery, setHomeTeamQuery] = useState("");
  const [awayTeamQuery, setAwayTeamQuery] = useState("");
  const [isHomeSuggestionsOpen, setIsHomeSuggestionsOpen] = useState(false);
  const [isAwaySuggestionsOpen, setIsAwaySuggestionsOpen] = useState(false);

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

  useEffect(() => {
    if (!teams.length) return;

    const initialHomeTeam = teams.find(
      (team) => team.id === selectedHomeTeamId,
    );
    const initialAwayTeam = teams.find(
      (team) => team.id === selectedAwayTeamId,
    );

    if (initialHomeTeam && !homeTeamQuery) {
      setHomeTeamQuery(initialHomeTeam.name);
    }

    if (initialAwayTeam && !awayTeamQuery) {
      setAwayTeamQuery(initialAwayTeam.name);
    }
  }, [
    teams,
    selectedHomeTeamId,
    selectedAwayTeamId,
    homeTeamQuery,
    awayTeamQuery,
  ]);

  const homeTeamSuggestions = useMemo(() => {
    const query = homeTeamQuery.trim().toLowerCase();

    return teams
      .filter((team) => team.id !== selectedAwayTeamId)
      .filter((team) => !query || team.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [teams, homeTeamQuery, selectedAwayTeamId]);

  const awayTeamSuggestions = useMemo(() => {
    const query = awayTeamQuery.trim().toLowerCase();

    return teams
      .filter((team) => team.id !== selectedHomeTeamId)
      .filter((team) => !query || team.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [teams, awayTeamQuery, selectedHomeTeamId]);

  function syncQueryToField(
    nextQuery: string,
    onChange: (value: string) => void,
    excludedTeamId?: string,
  ) {
    const normalizedQuery = nextQuery.trim().toLowerCase();

    const exactMatch = teams.find(
      (team) =>
        team.id !== excludedTeamId &&
        team.name.trim().toLowerCase() === normalizedQuery,
    );

    onChange(exactMatch?.id ?? "");
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardContent>
          Preencha os dados da partida. Em mata-mata com ida e volta, informe os
          placares da ida e da volta para cálculo correto do resultado.
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
                  <FormItem>
                    <FormLabel>
                      Time da casa (cadastro)
                      <span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Digite para buscar time"
                          disabled={isBusy}
                          value={homeTeamQuery}
                          onFocus={() => setIsHomeSuggestionsOpen(true)}
                          onBlur={() => {
                            setTimeout(() => {
                              setIsHomeSuggestionsOpen(false);
                            }, 100);
                          }}
                          onChange={(event) => {
                            const nextQuery = event.target.value;
                            setHomeTeamQuery(nextQuery);
                            syncQueryToField(
                              nextQuery,
                              field.onChange,
                              selectedAwayTeamId,
                            );
                          }}
                        />

                        {isHomeSuggestionsOpen &&
                          homeTeamSuggestions.length > 0 && (
                            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                              {homeTeamSuggestions.map((team) => (
                                <button
                                  key={team.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => {
                                    setHomeTeamQuery(team.name);
                                    field.onChange(team.id);
                                    setIsHomeSuggestionsOpen(false);
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <TeamSuggestionAvatar team={team} />
                                    <span>{team.name}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awayTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Time visitante (cadastro)
                      <span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Digite para buscar time"
                          disabled={isBusy}
                          value={awayTeamQuery}
                          onFocus={() => setIsAwaySuggestionsOpen(true)}
                          onBlur={() => {
                            setTimeout(() => {
                              setIsAwaySuggestionsOpen(false);
                            }, 100);
                          }}
                          onChange={(event) => {
                            const nextQuery = event.target.value;
                            setAwayTeamQuery(nextQuery);
                            syncQueryToField(
                              nextQuery,
                              field.onChange,
                              selectedHomeTeamId,
                            );
                          }}
                        />

                        {isAwaySuggestionsOpen &&
                          awayTeamSuggestions.length > 0 && (
                            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                              {awayTeamSuggestions.map((team) => (
                                <button
                                  key={team.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => {
                                    setAwayTeamQuery(team.name);
                                    field.onChange(team.id);
                                    setIsAwaySuggestionsOpen(false);
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <TeamSuggestionAvatar team={team} />
                                    <span>{team.name}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
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
                    onValueChange={(value) => field.onChange(value)}
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

            {gameType === "KNOCKOUT" && (
              <>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => {
                      form.setValue("secondLegHomeScore", "", {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      form.setValue("secondLegAwayScore", "", {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      form.setValue("status", GameStatus.CLOSED, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <Eraser className="mr-2 size-4" />
                    Limpar placares da volta
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => {
                      form.setValue("penaltyHomeScore", undefined, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      form.setValue("penaltyAwayScore", undefined, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      form.setValue("status", GameStatus.CLOSED, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <Eraser className="mr-2 size-4" />
                    Limpar pênaltis
                  </Button>
                </div>

                <div className="space-y-4">
                  <ScorePhaseCard
                    title="Placa ida"
                    homeLabel="Casa"
                    awayLabel="Visitante"
                    homeField={
                      <FormField
                        control={form.control}
                        name="homeScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="number"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "number"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? undefined
                                        : Number(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                    awayField={
                      <FormField
                        control={form.control}
                        name="awayScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="number"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "number"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? undefined
                                        : Number(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                  />

                  <ScorePhaseCard
                    title="Placa volta"
                    homeLabel="Casa"
                    awayLabel="Visitante"
                    homeField={
                      <FormField
                        control={form.control}
                        name="secondLegHomeScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="text"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "string"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? ""
                                        : String(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                    awayField={
                      <FormField
                        control={form.control}
                        name="secondLegAwayScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="text"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "string"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? ""
                                        : String(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                  />

                  <ScorePhaseCard
                    title="Pênaltis"
                    homeLabel="Casa"
                    awayLabel="Visitante"
                    homeField={
                      <FormField
                        control={form.control}
                        name="penaltyHomeScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="number"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "number"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? undefined
                                        : Number(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                    awayField={
                      <FormField
                        control={form.control}
                        name="penaltyAwayScore"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <ScoreStepperInput
                                value={field.value}
                                disabled={isBusy}
                                name={field.name}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                variant="number"
                                onChange={(nextValue) =>
                                  field.onChange(
                                    typeof nextValue === "number"
                                      ? nextValue
                                      : nextValue === undefined
                                        ? undefined
                                        : Number(nextValue),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    }
                  />
                </div>
              </>
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
                  {isEditing ? "Atualizando..." : "Criando..."}
                </>
              ) : isEditing ? (
                "Atualizar"
              ) : (
                "Criar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
