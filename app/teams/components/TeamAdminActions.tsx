"use client";

import { ConfirmAction } from "@/components/ConfirmAction";
import { useBackendUser } from "@/lib/useBackendUser";
import { Team } from "@/lib/teams";
import { TeamFormDialog } from "./TeamFormDialog";

type TeamAdminActionsProps = {
  team: Team;
  onSaved?: () => void;
};

export function TeamAdminActions({ team, onSaved }: TeamAdminActionsProps) {
  const { isAdmin, isLoading } = useBackendUser();

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <TeamFormDialog mode="edit" team={team} onSaved={onSaved} />
      <ConfirmAction
        id={team.id}
        endpoint="/teams"
        title="Excluir time?"
        description="Esse time será removido permanentemente."
      />
    </div>
  );
}
