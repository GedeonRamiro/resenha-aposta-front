"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type News = {
  url: string;
  title: string;
  description: string;
};

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
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
        setError(data?.error || "Erro desconhecido ao buscar notícias");
      }
    } catch (error: unknown) {
      setNews([]);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="grid gap-4">
      {loading && (
        <div className="space-y-3 p-4 border rounded-lg">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {!loading &&
        !error &&
        news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            className="border p-4 rounded"
          >
            <h2 className="font-bold text-primary">{item.title}</h2>
            <p>{item.description}</p>
          </a>
        ))}
    </div>
  );
}
