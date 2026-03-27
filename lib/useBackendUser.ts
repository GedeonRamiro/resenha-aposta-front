"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { IDataUser } from "@/types/types";
import { getApiBaseUrl } from "@/lib/api-base-url";

const backendUserBySessionId = new Map<string, IDataUser>();
const BACKEND_TOKEN_KEY = "backendAuthToken";

type SyncUserResponse =
  | IDataUser
  | {
      user: IDataUser;
      token: string;
    };

export function useBackendUser() {
  const { data: sessionData, isPending } = authClient.useSession();
  const [backendUser, setBackendUser] = useState<IDataUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const session = sessionData?.session;
  const user = sessionData?.user;

  useEffect(() => {
    const apiUrl = getApiBaseUrl();

    if (!apiUrl || !session?.id || !user?.email) {
      setBackendUser(null);
      return;
    }

    const cachedUser = backendUserBySessionId.get(session.id);
    const hasBackendToken =
      typeof window !== "undefined" &&
      Boolean(window.localStorage.getItem(BACKEND_TOKEN_KEY));

    if (cachedUser && hasBackendToken) {
      setBackendUser(cachedUser);
      return;
    }

    const syncUser = async () => {
      try {
        setIsSyncing(true);

        const response = await fetch(`${apiUrl}/auth/sync-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            providerId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync current user");
        }

        const payload = (await response.json()) as SyncUserResponse;
        const syncedUser = "user" in payload ? payload.user : payload;

        if ("token" in payload && typeof window !== "undefined") {
          window.localStorage.setItem(BACKEND_TOKEN_KEY, payload.token);
        }

        backendUserBySessionId.set(session.id, syncedUser);
        setBackendUser(syncedUser);
      } catch {
        setBackendUser(null);
      } finally {
        setIsSyncing(false);
      }
    };

    void syncUser();
  }, [session?.id, user?.email, user?.id, user?.image, user?.name]);

  const role = backendUser?.role;
  const isAdmin = role === "ADMIN";
  const isModerator = role === "MODERATOR";

  return {
    backendUser,
    isLoading: isPending || isSyncing,
    isAuthenticated: Boolean(user),
    isAdmin,
    isModerator,
    canManageGames: isAdmin || isModerator,
  };
}
