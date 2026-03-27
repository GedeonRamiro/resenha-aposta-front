"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmAction } from "@/components/ConfirmAction";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBackendUser } from "@/lib/useBackendUser";
import { getUserRoleLabel, updateUserRoleById, UserRole } from "@/lib/users";

type UserAdminActionsProps = {
  userId: string;
  currentRole: string;
};

const ROLES: UserRole[] = ["ADMIN", "MODERATOR", "PLAYER", "PENDING"];

export function UserAdminActions({
  userId,
  currentRole,
}: UserAdminActionsProps) {
  const router = useRouter();
  const { isAdmin, isLoading } = useBackendUser();
  const [role, setRole] = useState<UserRole>(
    ROLES.includes(currentRole as UserRole)
      ? (currentRole as UserRole)
      : "PENDING",
  );
  const [saving, setSaving] = useState(false);

  if (isLoading || !isAdmin) {
    return null;
  }

  async function handleSaveRole() {
    if (saving) return;

    try {
      setSaving(true);
      await updateUserRoleById(userId, role);
      toast.success("Perfil atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar perfil do usuário",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="md:col-span-2 rounded-md border p-4 space-y-3">
      <p className="text-sm font-semibold">Ações administrativas</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          disabled={saving}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((availableRole) => (
              <SelectItem key={availableRole} value={availableRole}>
                {getUserRoleLabel(availableRole)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSaveRole} disabled={saving}>
          {saving ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>

      <div>
        <ConfirmAction
          id={userId}
          endpoint="/users"
          title="Excluir usuário?"
          description="Esse usuário e as apostas vinculadas serão removidos permanentemente."
          successRedirectTo="/users"
        />
      </div>
    </div>
  );
}
