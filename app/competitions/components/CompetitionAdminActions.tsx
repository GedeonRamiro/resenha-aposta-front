"use client";

import { ConfirmAction } from "@/components/ConfirmAction";
import { Competition } from "@/lib/competitions";
import { useBackendUser } from "@/lib/useBackendUser";
import { CompetitionFormDialog } from "./CompetitionFormDialog";

type CompetitionAdminActionsProps = {
  competition: Competition;
};

export function CompetitionAdminActions({
  competition,
}: CompetitionAdminActionsProps) {
  const { isAdmin, isModerator, isLoading } = useBackendUser();

  if (isLoading || (!isAdmin && !isModerator)) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <CompetitionFormDialog mode="edit" competition={competition} />
      <ConfirmAction
        id={competition.id}
        endpoint="/competitions"
        title="Excluir competição?"
        description="Essa competição será removida permanentemente."
      />
    </div>
  );
}
