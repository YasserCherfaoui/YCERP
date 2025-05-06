"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
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

export function DatePickerWithRange({
  className,
  date: externalDate,
  onSelect,
}: DatePickerWithRangeProps) {
  const [singleDateOnly, setSingleDateOnly] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(externalDate);
  const [selectedSingle, setSelectedSingle] = React.useState<Date | undefined>(undefined);

  // Sync with external date prop
  React.useEffect(() => {
    setSelectedRange(externalDate);
  }, [externalDate]);

  // Handle selection change
  const handleSelect = (value: DateRange | Date | undefined) => {
    if (singleDateOnly) {
      setSelectedSingle(value as Date | undefined);
      onSelect(
        value
          ? { from: value as Date, to: value as Date }
          : undefined
      );
    } else {
      setSelectedRange(value as DateRange | undefined);
      onSelect(value as DateRange | undefined);
    }
  };

  // Reset logic
  const handleReset = () => {
    setSelectedRange(undefined);
    setSelectedSingle(undefined);
    onSelect(undefined);
  };

  // Display logic
  const displayValue = () => {
    if (singleDateOnly) {
      return selectedSingle
        ? format(selectedSingle, "LLL dd, y")
        : <span>Pick a date</span>;
    } else {
      if (selectedRange?.from) {
        if (selectedRange.to) {
          return <>{format(selectedRange.from, "LLL dd, y")} - {format(selectedRange.to, "LLL dd, y")}</>;
        }
        return format(selectedRange.from, "LLL dd, y");
      }
      return <span>Pick a date range</span>;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <Checkbox
          id="single-date-toggle"
          checked={singleDateOnly}
          onCheckedChange={checked => setSingleDateOnly(!!checked)}
        />
        <label htmlFor="single-date-toggle" className="text-sm select-none cursor-pointer">
          Single date only
        </label>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              (!selectedRange && !selectedSingle) && "text-muted-foreground"
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
              defaultMonth={selectedSingle ?? undefined}
              selected={selectedSingle}
              onSelect={(date) => handleSelect(date)}
              numberOfMonths={2}
            />
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={(range) => handleSelect(range)}
              numberOfMonths={2}
            />
          )}
          <div className="flex justify-end p-2 border-t">
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 