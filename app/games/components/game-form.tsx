"use client";

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

const schema = z.object({
  homeTeam: z.string().min(3),
  awayTeam: z.string().min(3),
  homeTeamLogo: z.union([z.string().url(), z.literal(""), z.undefined()]),
  awayTeamLogo: z.union([z.string().url(), z.literal(""), z.undefined()]),
  competition: z.string().optional(),
  gameDate: z.string().min(1),
  betCloseAt: z.string().min(1),
  moreInfo: z.string().optional(),

  status: z.nativeEnum(GameStatus).optional(),

  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
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
    defaultValues: {
      homeTeam: initialData?.homeTeam ?? "",
      awayTeam: initialData?.awayTeam ?? "",
      homeTeamLogo: initialData?.homeTeamLogo ?? "",
      awayTeamLogo: initialData?.awayTeamLogo ?? "",
      competition: initialData?.competition ?? "",
      gameDate: initialData?.gameDate ?? "",
      betCloseAt: initialData?.betCloseAt ?? "",
      moreInfo: initialData?.moreInfo ?? "",
      status: initialData?.status ?? undefined,
      homeScore: initialData?.homeScore ?? undefined,
      awayScore: initialData?.awayScore ?? undefined,
    },
  });

  const isEditing = !!initialData;
  const isBusy = !!loading || form.formState.isSubmitting;

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
              name="competition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liga/Campeonato</FormLabel>
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
              name="betCloseAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fechamento das Apostas{" "}
                    <span className="text-red-500">*</span>
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
