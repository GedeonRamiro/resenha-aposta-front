import { betterAuth } from "better-auth";

function toHost(value?: string): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function toOrigin(value?: string): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const envBetterAuthOrigin = toOrigin(process.env.BETTER_AUTH_URL);
const envNextPublicBetterAuthOrigin = toOrigin(
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
);

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://raymundo-nonhabitable-kole.ngrok-free.dev",
  "https://*.vercel.app",
  ...(vercelOrigin ? [vercelOrigin] : []),
  ...(envBetterAuthOrigin ? [envBetterAuthOrigin] : []),
  ...(envNextPublicBetterAuthOrigin ? [envNextPublicBetterAuthOrigin] : []),
  ...trustedOriginsFromEnv,
];

const allowedAuthHostsFromEnv = (process.env.BETTER_AUTH_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const vercelHost = process.env.VERCEL_URL;
const envBetterAuthHost = toHost(process.env.BETTER_AUTH_URL);
const envNextPublicBetterAuthHost = toHost(
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
);

const allowedAuthHosts = [
  "localhost:3000",
  "127.0.0.1:3000",
  "raymundo-nonhabitable-kole.ngrok-free.dev",
  "*.vercel.app",
  ...(vercelHost ? [vercelHost] : []),
  ...(envBetterAuthHost ? [envBetterAuthHost] : []),
  ...(envNextPublicBetterAuthHost ? [envNextPublicBetterAuthHost] : []),
  ...allowedAuthHostsFromEnv,
];

const fallbackBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const googleRedirectURI =
  process.env.GOOGLE_REDIRECT_URI ??
  (envBetterAuthOrigin
    ? `${envBetterAuthOrigin}/api/auth/callback/google`
    : undefined);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          ...(googleRedirectURI ? { redirectURI: googleRedirectURI } : {}),
        },
      }
    : undefined;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: {
    allowedHosts: allowedAuthHosts,
    fallback: fallbackBaseURL,
  },
  trustedOrigins,
  ...(socialProviders ? { socialProviders } : {}),
});
