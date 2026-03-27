"use client";

import Link from "next/link";

import { ConfirmAction } from "@/components/ConfirmAction";
import { Button } from "@/components/ui/button";
import { useBackendUser } from "@/lib/useBackendUser";

type UserBetActionsProps = {
  betId: string;
  betUserId: string;
  gameStatus: string;
};

function getMarketStatusLabel(status: string): string {
  if (status === "SCHEDULED") {
    return "Mercado aberto";
  }

  if (status === "FINISHED") {
    return "Mercado finalizado";
  }

  return "Mercado fechado";
}

export function UserBetActions({
  betId,
  betUserId,
  gameStatus,
}: UserBetActionsProps) {
  const { backendUser, isAdmin, isLoading } = useBackendUser();

  if (isLoading) {
    return <span className="text-xs text-muted-foreground">Carregando...</span>;
  }

  const isOwner = backendUser?.id === betUserId;
  const isMarketOpen = gameStatus === "SCHEDULED";

  const canEdit = isOwner && isMarketOpen;
  const canDelete = isAdmin;

  if (!canEdit && !canDelete) {
    return (
      <span className="text-xs text-muted-foreground">
        {getMarketStatusLabel(gameStatus)}
      </span>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      {canEdit ? (
        <Button asChild size="sm" variant="outline">
          <Link href={`/bets/${betId}`}>Editar</Link>
        </Button>
      ) : null}

      {canDelete ? (
        <ConfirmAction
          id={betId}
          endpoint="/bets"
          title="Excluir aposta?"
          description="Essa aposta será removida permanentemente."
        />
      ) : null}
    </div>
  );
}
