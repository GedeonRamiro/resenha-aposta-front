"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { APP_CONFIG_UPDATED_EVENT, getConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface PeriodFilter {
  key: string;
  label: string;
  startDate?: string;
  endDate?: string;
}

export function PeriodFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [periodFilters, setPeriodFilters] = useState<PeriodFilter[]>([
    { key: "geral", label: "Geral" },
  ]);

  const loadPeriodFilters = useCallback(() => {
    getConfig()
      .then((config) => {
        const seasons = (config.rankingSeasons ?? [])
          .slice()
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
          .map((season) => ({
            key: season.slug,
            label: season.label,
            startDate: season.startDate,
            endDate: season.endDate,
          }));

        setPeriodFilters([{ key: "geral", label: "Geral" }, ...seasons]);
      })
      .catch(() => {
        setPeriodFilters([{ key: "geral", label: "Geral" }]);
      });
  }, []);

  useEffect(() => {
    loadPeriodFilters();
    window.addEventListener(APP_CONFIG_UPDATED_EVENT, loadPeriodFilters);

    return () => {
      window.removeEventListener(APP_CONFIG_UPDATED_EVENT, loadPeriodFilters);
    };
  }, [loadPeriodFilters]);

  const currentStart = searchParams.get("startDate") || "";
  const currentEnd = searchParams.get("endDate") || "";
  const currentPeriod = searchParams.get("period");

  const selectedPeriod = useMemo(() => {
    if (currentPeriod) {
      const byPeriod = periodFilters.find(
        (period) => period.key === currentPeriod,
      );
      if (byPeriod) return byPeriod.key;
    }

    const byDates = periodFilters.find(
      (period) =>
        (period.startDate || "") === currentStart &&
        (period.endDate || "") === currentEnd,
    );

    return byDates?.key ?? "geral";
  }, [currentEnd, currentPeriod, currentStart, periodFilters]);

  const handleFilterChange = (period: string) => {
    const selected = periodFilters.find((item) => item.key === period);
    if (!selected) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("period", period);
    params.delete("page");

    if (selected.startDate && selected.endDate) {
      params.set("startDate", selected.startDate);
      params.set("endDate", selected.endDate);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.push(`/user-scores?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Temporadas</p>
          <p className="text-xs text-muted-foreground">
            Troque o recorte do ranking sem perder a leitura da tela.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-2 shadow-sm">
          {periodFilters.map((period) => {
            const isActive = selectedPeriod === period.key;

            return (
              <Button
                key={period.key}
                type="button"
                variant="ghost"
                aria-pressed={isActive}
                onClick={() => handleFilterChange(period.key)}
                className={cn(
                  "shrink-0 h-7 rounded-full px-4 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                {period.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
