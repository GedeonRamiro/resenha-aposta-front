"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { GameForm, GameFormValues } from "../components/game-form";
import { createGame } from "@/lib/games";
import TiTleSeparator from "@/components/TiTleSeparator";

export default function CreateGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

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
