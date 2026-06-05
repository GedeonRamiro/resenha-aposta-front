"use client";

import { ConfirmAction } from "@/components/ConfirmAction";
import { Competition } from "@/lib/competitions";
import { useBackendUser } from "@/lib/useBackendUser";
import { CompetitionFormDialog } from "./CompetitionFormDialog";

type CompetitionAdminActionsProps = {
  competition: Competition;
  onSaved?: () => void;
};

export function CompetitionAdminActions({
  competition,
  onSaved,
}: CompetitionAdminActionsProps) {
  const { isAdmin, isLoading } = useBackendUser();

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <CompetitionFormDialog
        mode="edit"
        competition={competition}
        onSaved={onSaved}
      />
      <ConfirmAction
        id={competition.id}
        endpoint="/competitions"
        title="Excluir competição?"
        description="Essa competição será removida permanentemente."
      />
    </div>
  );
}
