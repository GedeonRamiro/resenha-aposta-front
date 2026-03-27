"use client";

import { useState } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { updateGameById } from "@/lib/games";

type GameInfoButtonProps = {
  gameId: string;
  initialMoreInfo: string | null;
};

export function GenerateInfoButton({
  gameId,
  initialMoreInfo,
}: GameInfoButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [moreInfo, setMoreInfo] = useState(initialMoreInfo?.trim() || "");

  async function handleSave() {
    if (loading) return;

    try {
      setLoading(true);
      await updateGameById(gameId, {
        moreInfo: moreInfo.trim() || undefined,
      });
      toast.success("Informações salvas com sucesso!");
      setIsEditing(false);
      setOpen(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar as informações.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full">
          <Edit2 className="size-4" />
          +Info
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Informações do Jogo</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            <textarea
              placeholder="Digite as informações do jogo em markdown..."
              value={moreInfo}
              onChange={(e) => setMoreInfo(e.currentTarget.value)}
              className="w-full min-h-80 p-3 rounded-md border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <div className="min-h-80 max-h-[55vh] overflow-y-auto rounded-md border p-3 text-sm whitespace-pre-line bg-muted/30">
              {moreInfo ? (
                moreInfo
              ) : (
                <p className="text-muted-foreground italic">
                  Nenhuma informação adicionada ainda.
                </p>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Fechar</AlertDialogCancel>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={loading}
          >
            {isEditing ? (
              <>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Salvando..." : "Salvar"}
              </>
            ) : (
              <>
                <Edit2 className="size-4" />
                Editar
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

