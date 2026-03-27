const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function ensureProtocol(url: string): string {
  if (url.startsWith("/")) {
    return url;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

function isRelativeUrl(url: string): boolean {
  return url.startsWith("/");
}

function normalizeUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return ensureProtocol(trimmed);
}

function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return LOCAL_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export function getApiBaseUrl(): string {
  const internalApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  const externalApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL_EXTERNAL);

  // On the server (RSC/SSR), prefer internal URL only when it is not localhost
  // (i.e. when running on Vercel/Railway, not on a local dev machine).
  if (typeof window === "undefined") {
    if (
      internalApiUrl &&
      !isRelativeUrl(internalApiUrl) &&
      !isLocalUrl(internalApiUrl)
    ) {
      return ensureProtocol(internalApiUrl);
    }

    if (externalApiUrl && !isRelativeUrl(externalApiUrl)) {
      return ensureProtocol(externalApiUrl);
    }

    if (internalApiUrl && !isRelativeUrl(internalApiUrl)) {
      return ensureProtocol(internalApiUrl);
    }

    throw new Error(
      "Configure NEXT_PUBLIC_API_URL (local) or NEXT_PUBLIC_API_URL_EXTERNAL (public).",
    );
  }

  const host = window.location.hostname.toLowerCase();
  const isLocalHost = LOCAL_HOSTS.has(host);

  if (!isLocalHost && externalApiUrl && !isRelativeUrl(externalApiUrl)) {
    return ensureProtocol(externalApiUrl);
  }

  if (internalApiUrl && (isLocalHost || !isRelativeUrl(internalApiUrl))) {
    return ensureProtocol(internalApiUrl);
  }

  if (externalApiUrl && (isLocalHost || !isRelativeUrl(externalApiUrl))) {
    return ensureProtocol(externalApiUrl);
  }

  throw new Error(
    "Configure NEXT_PUBLIC_API_URL (local) or NEXT_PUBLIC_API_URL_EXTERNAL (public).",
  );
}
