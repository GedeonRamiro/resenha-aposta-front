export enum GameStatus {
  SCHEDULED = "SCHEDULED",
  CLOSED = "CLOSED",
  FINISHED = "FINISHED",
}

export const GAME_STATUS_LABEL: Record<GameStatus, string> = {
  [GameStatus.SCHEDULED]: "Aberto",
  [GameStatus.CLOSED]: "Fechado",
  [GameStatus.FINISHED]: "Finalizado",
};
