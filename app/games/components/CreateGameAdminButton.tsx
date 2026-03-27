"use client";

import Link from "next/link";

import { useBackendUser } from "@/lib/useBackendUser";
import { Button } from "@/components/ui/button";

export function CreateGameAdminButton() {
  const { canManageGames, isLoading } = useBackendUser();

  if (isLoading || !canManageGames) {
    return null;
  }

  return (
    <Link href="/games/create" className="w-full sm:w-auto">
      <Button className="w-full sm:w-auto">Criar Jogo</Button>
    </Link>
  );
}
