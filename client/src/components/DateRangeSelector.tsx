import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export type DateRangeType = "current-week" | "previous-week" | "month" | "ytd" | "custom";

interface DateRangeSelectorProps {
  onRangeChange: (type: DateRangeType, customDates?: { from: Date; to: Date }) => void;
}

export default function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [rangeType, setRangeType] = useState<DateRangeType>("current-week");
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();
  const [showCustom, setShowCustom] = useState(false);

  const handleRangeTypeChange = (value: DateRangeType) => {
    setRangeType(value);
    if (value === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onRangeChange(value);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onRangeChange("custom", { from: customFrom, to: customTo });
      setShowCustom(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select value={rangeType} onValueChange={handleRangeTypeChange}>
        <SelectTrigger className="w-full sm:w-48" data-testid="select-date-range">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current-week">Current Week</SelectItem>
          <SelectItem value="previous-week">Previous Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="ytd">Year to Date</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start" data-testid="button-from-date">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customFrom ? format(customFrom, "MMM dd, yyyy") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customFrom}
                onSelect={setCustomFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start" data-testid="button-to-date">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customTo ? format(customTo, "MMM dd, yyyy") : "To Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customTo}
                onSelect={setCustomTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleCustomApply} data-testid="button-apply-custom">
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
