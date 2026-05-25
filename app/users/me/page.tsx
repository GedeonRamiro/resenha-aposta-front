"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useBackendUser } from "@/lib/useBackendUser";

export default function MyUserRedirectPage() {
  const router = useRouter();
  const { backendUser, isAuthenticated, isLoading } = useBackendUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (backendUser?.id) {
      router.replace(`/users/${backendUser.id}`);
      return;
    }
  }, [backendUser?.id, isLoading, router]);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Carregando suas informações...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Faça login para visualizar suas apostas.
      </div>
    );
  }

  if (!backendUser?.id) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Preparando o seu perfil...
      </div>
    );
  }

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Redirecionando para suas apostas...
    </div>
  );
}
