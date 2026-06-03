"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { APP_CONFIG_UPDATED_EVENT, getConfig } from "@/lib/config";

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
        const seasons = (config.rankingSeasons ?? []).map((season) => ({
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
    <div className="flex gap-2 flex-wrap">
      {periodFilters.map((period) => {
        const filter = period;

        return (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? "default" : "outline"}
            onClick={() => handleFilterChange(period.key)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
