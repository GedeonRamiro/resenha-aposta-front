// DateRangePicker component using shadcn/ui Calendar
// This is a simple range picker for filtering by start and end date

"use client";

import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={2}
      />
    </div>
  );
}
