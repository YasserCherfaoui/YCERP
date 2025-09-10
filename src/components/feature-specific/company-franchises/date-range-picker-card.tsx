import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

interface DateRangePickerCardProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export default function DateRangePickerCard({ dateRange, onDateRangeChange }: DateRangePickerCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Date Range
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onSelect={onDateRangeChange}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            <p>• Select a single date or date range</p>
            <p>• Insights will be calculated for the selected period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
