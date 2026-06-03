"use client";

import { ConfirmAction } from "@/components/ConfirmAction";
import { useBackendUser } from "@/lib/useBackendUser";
import { Team } from "@/lib/teams";
import { TeamFormDialog } from "./TeamFormDialog";

type TeamAdminActionsProps = {
  team: Team;
};

export function TeamAdminActions({ team }: TeamAdminActionsProps) {
  const { isAdmin, isModerator, isLoading } = useBackendUser();

  if (isLoading || (!isAdmin && !isModerator)) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <TeamFormDialog mode="edit" team={team} />
      <ConfirmAction
        id={team.id}
        endpoint="/teams"
        title="Excluir time?"
        description="Esse time será removido permanentemente."
      />
    </div>
  );
}
