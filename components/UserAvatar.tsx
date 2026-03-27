"use client";

import { useMemo, useState } from "react";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
};

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const imageUrl = useMemo(() => {
    const trimmed = image?.trim();

    if (!trimmed) {
      return null;
    }

    // Ignore malformed or potentially unsafe URLs and use fallback avatar.
    if (trimmed.startsWith("javascript:")) {
      return null;
    }

    return trimmed;
  }, [image]);

  const [hasLoadError, setHasLoadError] = useState(false);

  if (imageUrl && !hasLoadError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`Avatar de ${name ?? "usuário"}`}
        className={cn("h-9 w-9 rounded-full border object-cover", className)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          setHasLoadError(true);
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-muted-foreground",
        className,
      )}
      aria-label={`Avatar padrão de ${name ?? "usuário"}`}
    >
      <User className="h-4 w-4" />
    </div>
  );
}
