import { createAuthClient } from "better-auth/react";

const browserOrigin =
  typeof window !== "undefined" ? window.location.origin : undefined;

const fallbackBaseURL =
  browserOrigin ??
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: fallbackBaseURL,
});
