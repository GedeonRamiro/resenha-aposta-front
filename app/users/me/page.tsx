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

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (backendUser?.id) {
      router.replace(`/users/${backendUser.id}`);
      return;
    }

    router.replace("/users");
  }, [backendUser?.id, isAuthenticated, isLoading, router]);

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Redirecionando para suas apostas...
    </div>
  );
}
