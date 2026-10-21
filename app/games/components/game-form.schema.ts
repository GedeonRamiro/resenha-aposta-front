import * as z from "zod";
import { GameStatus } from "@/enums/game-status";

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

export const gameFormSchema = z
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

export type GameFormValues = z.infer<typeof gameFormSchema>;
