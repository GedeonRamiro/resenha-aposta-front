"use client";

import { useState } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateGameById } from "@/lib/games";
import { useBackendUser } from "@/lib/useBackendUser";

type GameInfoModalActionProps = {
  gameId: string;
  initialInfo?: string | null;
};

export function GameInfoModalAction({
  gameId,
  initialInfo,
}: GameInfoModalActionProps) {
  const router = useRouter();
  const { canManageGames } = useBackendUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState(initialInfo?.trim() || "");

  async function handleSave() {
    if (loading || !canManageGames) return;

    try {
      setLoading(true);
      await updateGameById(gameId, {
        moreInfo: info.trim(),
      });
      toast.success("Informações salvas com sucesso.");
      setIsEditing(false);
      setOpen(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as informações.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs opacity-85 hover:opacity-100"
        >
          +Info
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[92vw] sm:w-140">
        <SheetHeader>
          <SheetTitle>Informações do jogo</SheetTitle>
          <SheetDescription>
            {canManageGames
              ? "Edite manualmente o conteúdo em markdown."
              : "Visualização das informações do jogo."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          {isEditing ? (
            <textarea
              placeholder="Digite as informações do jogo em markdown..."
              value={info}
              onChange={(event) => setInfo(event.currentTarget.value)}
              className="min-h-80 w-full rounded-md border bg-background p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <div className="max-h-[70vh] min-h-80 overflow-y-auto rounded-md border bg-muted/30 p-4">
              {info ? (
                <p className="whitespace-pre-line text-sm leading-6">{info}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Não há informações para este jogo.
                </p>
              )}
            </div>
          )}

          {canManageGames ? (
            <Button
              type="button"
              onClick={() =>
                void (isEditing ? handleSave() : setIsEditing(true))
              }
              disabled={loading}
              className="w-full"
            >
              {isEditing ? (
                <>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? "Salvando..." : "Salvar informações"}
                </>
              ) : (
                <>
                  <Edit2 className="size-4" />
                  Editar informações
                </>
              )}
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
