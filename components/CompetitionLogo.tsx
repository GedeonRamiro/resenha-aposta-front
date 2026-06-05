"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type CompetitionLogoProps = {
  competitionName: string;
  logoUrl?: string | null;
  className?: string;
};

export function CompetitionLogo({
  competitionName,
  logoUrl,
  className,
}: CompetitionLogoProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  const safeLogoUrl = useMemo(() => {
    const trimmed = logoUrl?.trim();

    if (!trimmed || trimmed.startsWith("javascript:")) {
      return null;
    }

    return trimmed;
  }, [logoUrl]);

  if (safeLogoUrl && !hasLoadError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeLogoUrl}
        alt={`Logo da competição ${competitionName}`}
        className={cn("h-6 w-6 shrink-0  object-contain", className)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasLoadError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground",
        className,
      )}
      aria-label={`Logo padrão da competição ${competitionName}`}
    >
      <Trophy className="h-4 w-4" />
    </div>
  );
}
