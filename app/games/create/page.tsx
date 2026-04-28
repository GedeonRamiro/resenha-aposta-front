"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { GameForm, GameFormValues } from "../components/game-form";
import { createGame } from "@/lib/games";
import TiTleSeparator from "@/components/TiTleSeparator";
import { useBackendUser } from "@/lib/useBackendUser";

export default function CreateGameForm() {
  const router = useRouter();
  const { canManageGames, isLoading } = useBackendUser();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!canManageGames) router.replace("/games");
  }, [canManageGames, isLoading, router]);

  if (isLoading || !canManageGames) return null;

  async function onSubmit(data: GameFormValues) {
    if (submittingRef.current || loading) return;

    try {
      submittingRef.current = true;
      setLoading(true);
      await createGame(data);
      router.push("/games");
      toast.success("Jogo criado com sucesso!");
    } catch {
      toast.error("Erro ao criar jogo");

      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <>
      <TiTleSeparator title="Cadastrar Jogo" />
      <div className="flex justify-center mt-2">
        <GameForm onSubmit={onSubmit} loading={loading} />
      </div>
    </>
  );
}
