import { betterAuth } from "better-auth";

function splitEnvList(value?: string): string[] {
  return (
    value
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) ?? []
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

const appUrl =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
const url = new URL(appUrl);
const appOrigin = url.origin;
const appHost = url.host;

const trustedOrigins = unique([
  "http://localhost:3000",
  appOrigin,
  ...splitEnvList(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
]);

const allowedAuthHosts = unique([
  "localhost:3000",
  appHost,
  ...splitEnvList(process.env.BETTER_AUTH_ALLOWED_HOSTS),
]);

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET não definido");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectURI =
  process.env.GOOGLE_REDIRECT_URI ?? `${appOrigin}/api/auth/callback/google`;

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          redirectURI: googleRedirectURI,
        },
      }
    : undefined;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: { allowedHosts: allowedAuthHosts, fallback: appOrigin },
  trustedOrigins,
  socialProviders,
});
