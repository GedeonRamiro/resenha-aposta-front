"use client";

import Link from "next/link";

import { useBackendUser } from "@/lib/useBackendUser";
import { Button } from "@/components/ui/button";

export function BlogAdminCreateButton() {
  const { isAdmin, isLoading } = useBackendUser();

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <Button asChild>
      <Link href="/blog/create">Novo Post</Link>
    </Button>
  );
}
