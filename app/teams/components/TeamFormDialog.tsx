"use client";

import { useEffect, useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { createTeam, Team, updateTeamById } from "@/lib/teams";
import { useBackendUser } from "@/lib/useBackendUser";

type TeamFormDialogProps =
  | {
      mode: "create";
      team?: never;
    }
  | {
      mode: "edit";
      team: Team;
    };

export function TeamFormDialog(props: TeamFormDialogProps) {
  const router = useRouter();
  const { isAdmin, isLoading } = useBackendUser();
  const canManage = isAdmin;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(
    props.mode === "edit" ? props.team.name : "",
  );
  const [logoUrl, setLogoUrl] = useState(
    props.mode === "edit" ? (props.team.logoUrl ?? "") : "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (props.mode === "edit") {
      setName(props.team.name);
      setLogoUrl(props.team.logoUrl ?? "");
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
      toast.error("Informe um nome de time valido.");
      return;
    }

    try {
      setSaving(true);

      if (props.mode === "create") {
        await createTeam({
          name: trimmedName,
          logoUrl: trimmedLogoUrl || undefined,
        });
      } else {
        await updateTeamById(props.team.id, {
          name: trimmedName,
          logoUrl: trimmedLogoUrl || undefined,
        });
      }

      setOpen(false);
      if (props.mode === "create") {
        setName("");
        setLogoUrl("");
      }
      toast.success(
        props.mode === "create"
          ? "Time criado com sucesso!"
          : "Time atualizado com sucesso!",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar time.",
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
            Novo time
          </Button>
        ) : (
          <Button type="button" variant="link" className="px-0">
            Editar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Criar time" : "Editar time"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados basicos para salvar o time.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Ex: Corinthians"
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
              "Salvar time"
            ) : (
              "Atualizar time"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
