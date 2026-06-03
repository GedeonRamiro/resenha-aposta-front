"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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
import { getTeamsSafe, Team } from "@/lib/teams";
import { Competition, getCompetitionsSafe } from "@/lib/competitions";

const optionalLogoUrl = (message: string) =>
  z.string().url(message).or(z.literal("")).optional();

const schema = z.object({
  homeTeam: z
    .string()
    .trim()
    .min(3, "Nome do time da casa deve ter ao menos 3 caracteres"),
  awayTeam: z
    .string()
    .trim()
    .min(3, "Nome do time visitante deve ter ao menos 3 caracteres"),
  homeTeamLogo: optionalLogoUrl("URL inválida para o logo do time da casa"),
  awayTeamLogo: optionalLogoUrl("URL inválida para o logo do time visitante"),
  competition: z.string().trim().min(1, "Liga/Campeonato é obrigatório"),
  gameDate: z.string().trim().min(1, "Data do jogo é obrigatória"),
  gameType: z.enum(["LEAGUE_GROUP", "KNOCKOUT"]),
  tieId: z.string().optional(),
  homeTeamId: z.string().optional(),
  awayTeamId: z.string().optional(),
  competitionId: z.string().optional(),
  tieLegsCount: z.number().int().min(1).max(2).optional(),
  legNumber: z.number().int().min(1).max(2).optional(),
  moreInfo: z.string().optional(),

  status: z.nativeEnum(GameStatus).optional(),

  homeScore: z.number({ error: "Placar deve ser um número" }).optional(),
  awayScore: z.number({ error: "Placar deve ser um número" }).optional(),
  penaltyHomeScore: z
    .number({ error: "Pênaltis deve ser um número" })
    .optional(),
  penaltyAwayScore: z
    .number({ error: "Pênaltis deve ser um número" })
    .optional(),
});

export type GameFormValues = z.infer<typeof schema>;

type GameFormProps = {
  initialData?: Partial<GameFormValues>;
  onSubmit: (data: GameFormValues) => Promise<void>;
  loading?: boolean;
};

export function GameForm({ initialData, onSubmit, loading }: GameFormProps) {
  const form = useForm<GameFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      homeTeam: initialData?.homeTeam ?? "",
      awayTeam: initialData?.awayTeam ?? "",
      homeTeamLogo: initialData?.homeTeamLogo ?? "",
      awayTeamLogo: initialData?.awayTeamLogo ?? "",
      competition: initialData?.competition ?? "",
      gameDate: initialData?.gameDate ?? "",
      gameType: initialData?.gameType ?? "LEAGUE_GROUP",
      tieId: initialData?.tieId ?? "",
      homeTeamId: initialData?.homeTeamId ?? "",
      awayTeamId: initialData?.awayTeamId ?? "",
      competitionId: initialData?.competitionId ?? "",
      tieLegsCount: initialData?.tieLegsCount ?? 1,
      legNumber: initialData?.legNumber ?? 1,
      moreInfo: initialData?.moreInfo ?? "",
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
  const tieLegsCount = form.watch("tieLegsCount");
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

  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );

  const competitionsById = useMemo(
    () =>
      new Map(competitions.map((competition) => [competition.id, competition])),
    [competitions],
  );

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardContent>
          Preencha apenas os dados da partida. Os campos placar e status devem
          permanecer vazios e serão atualizados após a finalização do jogo.
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
                    <FormLabel>Time da casa (cadastro)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const nextValue = value === "manual" ? "" : value;
                        field.onChange(nextValue);
                        const selectedTeam = teamsById.get(nextValue);
                        if (!selectedTeam) {
                          return;
                        }

                        form.setValue("homeTeam", selectedTeam.name, {
                          shouldDirty: true,
                        });
                        form.setValue(
                          "homeTeamLogo",
                          selectedTeam.logoUrl ?? "",
                          { shouldDirty: true },
                        );
                      }}
                      value={field.value || "manual"}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
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
                name="awayTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time visitante (cadastro)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const nextValue = value === "manual" ? "" : value;
                        field.onChange(nextValue);
                        const selectedTeam = teamsById.get(nextValue);
                        if (!selectedTeam) {
                          return;
                        }

                        form.setValue("awayTeam", selectedTeam.name, {
                          shouldDirty: true,
                        });
                        form.setValue(
                          "awayTeamLogo",
                          selectedTeam.logoUrl ?? "",
                          { shouldDirty: true },
                        );
                      }}
                      value={field.value || "manual"}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
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
                name="homeTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Time da Casa <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Corinthians"
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awayTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Time Visitante <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Flamengo"
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeamLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo do Time da Casa (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awayTeamLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo do Time Visitante (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        disabled={isBusy}
                        {...field}
                      />
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
                  <FormLabel>Competição (cadastro)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const nextValue = value === "manual" ? "" : value;
                      field.onChange(nextValue);
                      const selectedCompetition =
                        competitionsById.get(nextValue);
                      if (!selectedCompetition) {
                        return;
                      }

                      form.setValue("competition", selectedCompetition.name, {
                        shouldDirty: true,
                      });
                    }}
                    value={field.value || "manual"}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar competição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
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
              name="competition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Liga/Campeonato <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Brasileirão Série A"
                      disabled={isBusy}
                      {...field}
                    />
                  </FormControl>
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

            {gameType === "KNOCKOUT" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tieId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do confronto (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Preencha para vincular à volta"
                            disabled={isBusy}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tieLegsCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de jogos</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={String(field.value ?? 1)}
                          disabled={isBusy}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Jogo único</SelectItem>
                            <SelectItem value="2">Ida e volta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {tieLegsCount === 2 && (
                  <FormField
                    control={form.control}
                    name="legNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perna do confronto</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={String(field.value ?? 1)}
                          disabled={isBusy}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Ida</SelectItem>
                            <SelectItem value="2">Volta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placar Casa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isBusy}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awayScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placar Visitante</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isBusy}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {gameType === "KNOCKOUT" && (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="penaltyHomeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pênaltis Casa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isBusy}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value),
                            )
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="penaltyAwayScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pênaltis Visitante</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isBusy}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value),
                            )
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isBusy}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.values(GameStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {
                            GAME_STATUS_LABEL[
                              status as keyof typeof GAME_STATUS_LABEL
                            ]
                          }
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
