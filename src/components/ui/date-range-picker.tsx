"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
}

function isSingleDayRange(range: DateRange | undefined): boolean {
  return Boolean(range?.from && range?.to && isSameDay(range.from, range.to));
}

export function DatePickerWithRange({
  className,
  date,
  onSelect,
}: DatePickerWithRangeProps) {
  const [singleDateOnly, setSingleDateOnly] = React.useState(() =>
    isSingleDayRange(date)
  );

  const handleModeChange = (checked: boolean) => {
    setSingleDateOnly(checked);
    if (!date?.from) return;
    if (checked) {
      // Collapse any range to a single day (from)
      onSelect({ from: date.from, to: date.from });
    } else if (!date.to) {
      onSelect({ from: date.from, to: date.from });
    }
  };

  const handleSelect = (value: DateRange | Date | undefined) => {
    if (singleDateOnly) {
      const day = value as Date | undefined;
      onSelect(day ? { from: day, to: day } : undefined);
      return;
    }
    onSelect(value as DateRange | undefined);
  };

  const handleClear = () => {
    onSelect(undefined);
  };

  const selectedSingle = singleDateOnly ? date?.from : undefined;
  const hasValue = Boolean(date?.from);

  const displayValue = () => {
    if (!date?.from) {
      return <span>{singleDateOnly ? "Pick a date" : "Pick a date range"}</span>;
    }
    if (singleDateOnly || (date.to && isSameDay(date.from, date.to))) {
      return format(date.from, "LLL dd, y");
    }
    if (date.to) {
      return (
        <>
          {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
        </>
      );
    }
    return format(date.from, "LLL dd, y");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <Checkbox
          id="single-date-toggle"
          checked={singleDateOnly}
          onCheckedChange={(checked) => handleModeChange(!!checked)}
        />
        <label
          htmlFor="single-date-toggle"
          className="text-sm select-none cursor-pointer"
        >
          Single date only
        </label>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !hasValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {singleDateOnly ? (
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={selectedSingle}
              selected={selectedSingle}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          )}
          <div className="flex justify-end p-2 border-t">
            <Button size="sm" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
