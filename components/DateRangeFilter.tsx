"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDateParamToLocalDate(value: string): Date | null {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (isDateOnly) {
    const [year, month, day] = value.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);

    if (Number.isNaN(localDate.getTime())) {
      return null;
    }

    return localDate;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function toLocalStartOfDayIso(value: Date): string {
  const localStart = new Date(value);

  localStart.setHours(0, 0, 0, 0);

  return localStart.toISOString();
}

function toLocalEndExclusiveIso(value: Date): string {
  const localEndExclusive = new Date(value);

  localEndExclusive.setHours(0, 0, 0, 0);
  localEndExclusive.setDate(localEndExclusive.getDate() + 1);

  return localEndExclusive.toISOString();
}

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = React.useState<DateRange | undefined>();

  React.useEffect(() => {
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      setDate(undefined);
      return;
    }

    const from = parseDateParamToLocalDate(startDateParam);
    const endParsed = parseDateParamToLocalDate(endDateParam);

    if (!from || !endParsed) {
      setDate(undefined);
      return;
    }

    const to = new Date(endParsed);

    // When `endDate` is sent as exclusive upper bound, convert back to inclusive date for UI.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)) {
      to.setDate(to.getDate() - 1);
    }

    setDate({ from, to });
  }, [searchParams]);

  function clearFilter() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }

  function applyFilter(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("startDate", toLocalStartOfDayIso(range.from));
    params.set("endDate", toLocalEndExclusiveIso(range.to));
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }

  const hasActiveFilter = Boolean(date?.from && date?.to);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("justify-start text-left font-normal w-65")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Filtrar por data</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            locale={ptBR}
            mode="range"
            selected={date}
            onSelect={(range) => {
              setDate(range);

              if (range?.from && range?.to) {
                applyFilter(range);
                return;
              }

              if (!range?.from && !range?.to) {
                clearFilter();
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilter ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilter}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      ) : null}
    </div>
  );
}
