// Game Status Colors
export const GAME_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "text-green-600 border-green-600/30 bg-green-600/10",
  CLOSED: "text-red-600 border-red-600/30 bg-red-600/10",
  FINISHED: "text-primary border-primary/40 bg-primary/10",
};

// Bet Option Colors
export const BET_OPTION_COLORS: Record<string, string> = {
  HOME_WIN: "text-foreground/80 border-border bg-muted/50 dark:bg-muted/30",
  DRAW: "text-foreground/80 border-border bg-muted/50 dark:bg-muted/30",
  AWAY_WIN: "text-foreground/80 border-border bg-muted/50 dark:bg-muted/30",
};

export const BET_RESULT_COLORS: Record<string, string> = {
  GREEN: "text-green-700 border-green-700/30 bg-green-700/10",
  RED: "text-red-700 border-red-700/30 bg-red-700/10",
};

export const BET_RESULT_BORDER_L_COLORS: Record<string, string> = {
  GREEN: "border-l-green-600",
  RED: "border-l-red-600",
};
