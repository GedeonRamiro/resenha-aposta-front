"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "./ui/skeleton";

type News = {
  url?: string;
  title?: string;
  description?: string;
  date?: string;
  source?: string;
};

function getShortText(text?: string, limit = 100): string {
  const normalized = text?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return "Conteudo indisponivel no momento.";
  }

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trimEnd()}...`;
}

function formatNewsDate(date?: string): string {
  if (!date) {
    return "Atualizacao recente";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Atualizacao recente";
  }

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default function News() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/news", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
        setError(data?.error || "Erro desconhecido ao buscar noticias");
      }
    } catch (requestError: unknown) {
      setNews([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : String(requestError),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 7);

  return (
    <div className="rounded-[2rem] border border-emerald-700/25 bg-linear-to-br from-emerald-100 via-emerald-50/45 to-emerald-200/80 p-4 shadow-[0_28px_95px_-48px_rgba(5,150,105,0.72)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-emerald-700/25 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Noticias do futebol
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Destaques em ritmo editorial e leitura rapida.
          </h3>
        </div>

        <span className="rounded-full border border-emerald-700/30 bg-emerald-600/18 px-3 py-1 text-xs font-medium text-emerald-700">
          ge.globo.com
        </span>
      </div>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3 rounded-[1.6rem] border border-emerald-700/25 bg-background/85 p-5 shadow-[0_16px_44px_-34px_rgba(5,150,105,0.58)]">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-5/6 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-[1.4rem] border border-emerald-700/25 bg-background/85 p-4 shadow-[0_14px_36px_-30px_rgba(5,150,105,0.5)]"
              >
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && featuredNews ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <a
            href={featuredNews.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-65 flex-col justify-between rounded-[1.8rem] border border-emerald-700/28 bg-background/94 p-5 shadow-[0_18px_48px_-34px_rgba(5,150,105,0.6)] transition-colors hover:border-emerald-700/50"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Destaque
                </span>
                <span className="text-xs font-medium text-emerald-800/75">
                  {formatNewsDate(featuredNews.date)}
                </span>
              </div>

              <h2 className="max-w-xl text-2xl font-semibold leading-tight text-balance text-foreground transition-colors group-hover:text-emerald-800">
                {featuredNews.title ?? "Noticia em destaque"}
              </h2>

              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                {getShortText(featuredNews.description, 100)}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-emerald-700/12 pt-4 text-sm">
              <span className="font-medium text-emerald-700">
                {featuredNews.source ?? "Globo Esporte"}
              </span>
              <span className="text-emerald-800/75">Ler materia</span>
            </div>
          </a>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryNews.map((item, index) => (
              <a
                key={`${item.url ?? item.title ?? "news"}-${index}`}
                href={item.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.4rem] border border-emerald-700/24 bg-background/90 p-4 shadow-[0_14px_36px_-30px_rgba(5,150,105,0.44)] transition-colors hover:border-emerald-700/50"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">
                    {item.source ?? "GE"}
                  </span>
                  <span className="text-xs text-emerald-800/70">
                    {formatNewsDate(item.date)}
                  </span>
                </div>

                <h4 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-emerald-800">
                  {item.title ?? "Noticia"}
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {getShortText(item.description, 100)}
                </p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
