"use client";

import { useEffect, useState } from "react";
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

const optionalScoreInput = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || /^\d+$/.test(value.trim()), {
    message: "Use um número inteiro maior ou igual a zero.",
  });

const schema = z.object({
  gameDate: z.string().trim().min(1, "Data do jogo é obrigatória"),
  gameType: z.enum(["LEAGUE_GROUP", "KNOCKOUT"]),
  homeTeamId: z.string().trim().min(1, "Selecione o time da casa"),
  awayTeamId: z.string().trim().min(1, "Selecione o time visitante"),
  competitionId: z.string().trim().min(1, "Selecione a competição"),
  moreInfo: z.string().optional(),
  secondLegHomeScore: optionalScoreInput,
  secondLegAwayScore: optionalScoreInput,

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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value || undefined}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>
                      Time visitante (cadastro)
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
                          <SelectValue placeholder="Selecionar time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {gameType === "KNOCKOUT"
                        ? "Placar ida da casa"
                        : "Placar Casa"}
                    </FormLabel>
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
                    <FormLabel>
                      {gameType === "KNOCKOUT"
                        ? "Placar ida do visitante"
                        : "Placar Visitante"}
                    </FormLabel>
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondLegHomeScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placar volta da casa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            disabled={isBusy}
                            value={field.value ?? ""}
                            onChange={field.onChange}
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
                    name="secondLegAwayScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placar volta do visitante</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            disabled={isBusy}
                            value={field.value ?? ""}
                            onChange={field.onChange}
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
              </>
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
