const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function ensureProtocol(url: string): string {
  if (!/^https?:\/\//.test(url)) {
    return LOCAL_HOSTS.has(url.split(":")[0])
      ? `http://${url}`
      : `https://${url}`;
  }
  return url;
}

function normalizeUrl(value?: string): string | undefined {
  const url = value?.trim();
  if (!url || url.startsWith("/")) return undefined;
  return ensureProtocol(url);
}

export function getApiBaseUrl(): string {
  const internalApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  const externalApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL_EXTERNAL);

  if (typeof window === "undefined") {
    return externalApiUrl ?? internalApiUrl ?? "http://localhost:8000";
  }

  const isLocalHost = LOCAL_HOSTS.has(window.location.hostname.toLowerCase());
  return (
    (isLocalHost ? internalApiUrl : externalApiUrl) ||
    internalApiUrl ||
    externalApiUrl ||
    "http://localhost:8000"
  );
}
