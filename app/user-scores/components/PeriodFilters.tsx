"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PeriodKey = "geral" | "abril" | "maio";

interface PeriodFilter {
  label: string;
  startDate?: string;
  endDate?: string;
}

const PERIOD_FILTERS: Record<PeriodKey, PeriodFilter> = {
  geral: { label: "Geral" },
  abril: {
    label: "Abril",
    startDate: "2026-04-03",
    endDate: "2026-04-26",
  },
  maio: {
    label: "Maio",
    startDate: "2026-05-01",
    endDate: "2026-05-25",
  },
};

export function PeriodFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStart = searchParams.get("startDate") || "";
  const currentEnd = searchParams.get("endDate") || "";
  const currentPeriod = searchParams.get("period") as PeriodKey | null;

  const selectedPeriod: PeriodKey | undefined = (() => {
    if (currentPeriod && currentPeriod in PERIOD_FILTERS) {
      return currentPeriod;
    }

    const fromDates = (Object.keys(PERIOD_FILTERS) as PeriodKey[]).find(
      (key) =>
        (PERIOD_FILTERS[key].startDate || "") === currentStart &&
        (PERIOD_FILTERS[key].endDate || "") === currentEnd,
    );

    return fromDates;
  })();

  const handleFilterChange = (period: PeriodKey) => {
    const selected = PERIOD_FILTERS[period];
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
      {(Object.keys(PERIOD_FILTERS) as PeriodKey[]).map((period) => {
        const filter = PERIOD_FILTERS[period];

        return (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => handleFilterChange(period)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
