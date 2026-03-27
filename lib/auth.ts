import { betterAuth } from "better-auth";

const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://raymundo-nonhabitable-kole.ngrok-free.dev",
  ...trustedOriginsFromEnv,
];

const allowedAuthHostsFromEnv = (process.env.BETTER_AUTH_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const allowedAuthHosts = [
  "localhost:3000",
  "127.0.0.1:3000",
  "raymundo-nonhabitable-kole.ngrok-free.dev",
  ...allowedAuthHostsFromEnv,
];

const fallbackBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const googleRedirectURI = process.env.GOOGLE_REDIRECT_URI;

const googleProvider = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  ...(googleRedirectURI ? { redirectURI: googleRedirectURI } : {}),
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: {
    allowedHosts: allowedAuthHosts,
    fallback: fallbackBaseURL,
  },
  trustedOrigins,
  socialProviders: {
    google: googleProvider,
  },
});
