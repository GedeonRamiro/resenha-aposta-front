"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Competition,
  createCompetition,
  updateCompetitionById,
} from "@/lib/competitions";
import { useBackendUser } from "@/lib/useBackendUser";

type CompetitionFormDialogProps =
  | {
      mode: "create";
      competition?: never;
      onSaved?: () => void;
    }
  | {
      mode: "edit";
      competition: Competition;
      onSaved?: () => void;
    };

export function CompetitionFormDialog(props: CompetitionFormDialogProps) {
  const { isAdmin, isLoading } = useBackendUser();
  const canManage = isAdmin;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(
    props.mode === "edit" ? props.competition.name : "",
  );
  const [logoUrl, setLogoUrl] = useState(
    props.mode === "edit" ? (props.competition.logoUrl ?? "") : "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (props.mode === "edit") {
      setName(props.competition.name);
      setLogoUrl(props.competition.logoUrl ?? "");
    }
  }, [props]);

  if (isLoading || !canManage) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedName = name.trim();
    const trimmedLogoUrl = logoUrl.trim();

    if (trimmedName.length < 2) {
      toast.error("Informe um nome de competição valido.");
      return;
    }

    try {
      setSaving(true);

      if (props.mode === "create") {
        await createCompetition({
          name: trimmedName,
          logoUrl: trimmedLogoUrl || undefined,
        });
      } else {
        await updateCompetitionById(props.competition.id, {
          name: trimmedName,
          logoUrl: trimmedLogoUrl || undefined,
        });
      }

      setOpen(false);
      if (props.mode === "create") {
        setName("");
        setLogoUrl("");
      }
      props.onSaved?.();
      toast.success(
        props.mode === "create"
          ? "Competição criada com sucesso!"
          : "Competição atualizada com sucesso!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar competição.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.mode === "create" ? (
          <Button type="button" size="sm">
            <PlusCircle className="size-4" />
            Nova competição
          </Button>
        ) : (
          <Button type="button" variant="link" className="px-0">
            <Pencil className="size-4" />
            Editar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Criar competição" : "Editar competição"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados basicos para salvar a competição.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Ex: Brasileirão Série A"
              minLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo (URL)</label>
            <Input
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.currentTarget.value)}
              placeholder="https://..."
              type="url"
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : props.mode === "create" ? (
              "Salvar competição"
            ) : (
              "Atualizar competição"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
