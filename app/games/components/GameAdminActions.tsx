"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ConfirmAction";
import { useBackendUser } from "@/lib/useBackendUser";

type GameAdminActionsProps = {
  gameId: string;
  showDelete?: boolean;
};

export function GameAdminActions({
  gameId,
  showDelete = true,
}: GameAdminActionsProps) {
  const { canManageGames, isLoading } = useBackendUser();

  if (isLoading || !canManageGames) {
    return null;
  }

  return (
    <>
      <Link href={`/games/${gameId}/edit`}>
        <Button variant="link">Editar</Button>
      </Link>
      {showDelete ? (
        <ConfirmAction
          id={gameId}
          endpoint="/games"
          title="Excluir jogo?"
          description="Esse jogo será removido permanentemente."
        />
      ) : null}
    </>
  );
}
