const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function getApiBaseUrl(): string {
  const internalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const externalApiUrl = process.env.NEXT_PUBLIC_API_URL_EXTERNAL;

  // On the server (RSC/SSR), prefer internal URL to avoid depending on public tunnels.
  if (typeof window === "undefined") {
    if (internalApiUrl) {
      return internalApiUrl;
    }

    if (externalApiUrl) {
      return externalApiUrl;
    }

    throw new Error(
      "Configure NEXT_PUBLIC_API_URL (local) or NEXT_PUBLIC_API_URL_EXTERNAL (public).",
    );
  }

  const host = window.location.hostname.toLowerCase();
  const isLocalHost = LOCAL_HOSTS.has(host);

  if (!isLocalHost && externalApiUrl) {
    return externalApiUrl;
  }

  if (internalApiUrl) {
    return internalApiUrl;
  }

  if (externalApiUrl) {
    return externalApiUrl;
  }

  throw new Error(
    "Configure NEXT_PUBLIC_API_URL (local) or NEXT_PUBLIC_API_URL_EXTERNAL (public).",
  );
}
