/**
 * Enhanced Date Picker Components
 * Reusable date picker components with support for various date formats and configurations
 */

import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Base props for all date picker components
interface BaseDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

// Date picker variants
export type DatePickerVariant =
  | "date"
  | "datetime"
  | "time"
  | "month"
  | "year"
  | "range";

// Date range type
export interface CustomDateRange {
  from?: Date;
  to?: Date;
}

// Enhanced Date Picker Props
interface EnhancedDatePickerProps<T extends FieldValues>
  extends BaseDatePickerProps<T> {
  variant?: DatePickerVariant;
  allowClear?: boolean;
  showToday?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  format?: string;
  locale?: string;
  timezone?: string;
  showWeekNumbers?: boolean;
  calendarProps?: React.ComponentProps<typeof Calendar>;
}

// Time picker props
interface TimeSelectProps {
  date?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  use24Hour?: boolean;
  minuteStep?: number;
}

// Date range picker props
interface DateRangePickerProps<T extends FieldValues>
  extends BaseDatePickerProps<T> {
  allowClear?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  format?: string;
  presets?: Array<{
    label: string;
    value: CustomDateRange;
  }>;
}

/**
 * Utility function to format date based on variant
 */
function formatDateByVariant(
  date: Date,
  variant: DatePickerVariant,
  customFormat?: string
): string {
  if (customFormat) {
    return format(date, customFormat);
  }

  switch (variant) {
    case "date":
      return format(date, "PPP"); // January 1, 2024
    case "datetime":
      return format(date, "PPP 'at' p"); // January 1, 2024 at 2:30 PM
    case "time":
      return format(date, "p"); // 2:30 PM
    case "month":
      return format(date, "MMMM yyyy"); // January 2024
    case "year":
      return format(date, "yyyy"); // 2024
    default:
      return format(date, "PPP");
  }
}

/**
 * Utility function to parse date string
 */
function parseDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Time Select Component
 * Allows selection of hours and minutes
 */
function TimeSelect({
  date,
  onChange,
  disabled = false,
  use24Hour = false,
  minuteStep = 15,
}: TimeSelectProps) {
  const hours = date ? date.getHours() : 0;
  const minutes = date ? date.getMinutes() : 0;

  const handleHourChange = (hourValue: string) => {
    const hour = parseInt(hourValue);
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(hour);
    onChange(newDate);
  };

  const handleMinuteChange = (minuteValue: string) => {
    const minute = parseInt(minuteValue);
    const newDate = date ? new Date(date) : new Date();
    newDate.setMinutes(minute);
    onChange(newDate);
  };

  const handleAmPmChange = (ampm: string) => {
    const newDate = date ? new Date(date) : new Date();
    const currentHours = newDate.getHours();

    if (ampm === "PM" && currentHours < 12) {
      newDate.setHours(currentHours + 12);
    } else if (ampm === "AM" && currentHours >= 12) {
      newDate.setHours(currentHours - 12);
    }

    onChange(newDate);
  };

  const displayHours = use24Hour ? hours : hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  // Generate hour options
  const hourOptions = Array.from({ length: use24Hour ? 24 : 12 }, (_, i) =>
    use24Hour ? i : i + 1
  );

  // Generate minute options based on step
  const minuteOptions = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={displayHours.toString()}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map(hour => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span>:</span>

      <Select
        value={minutes.toString()}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map(minute => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!use24Hour && (
        <Select
          value={ampm}
          onValueChange={handleAmPmChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/**
 * Enhanced Date Picker Component
 * Supports various date picker variants and configurations
 */
export function EnhancedDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  className,
  variant = "date",
  allowClear = false,
  minDate,
  maxDate,
  disabledDates,
  format: customFormat,
  showWeekNumbers = false,
  calendarProps,
}: EnhancedDatePickerProps<T>) {
  const [open, setOpen] = React.useState(false);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      if (disabledDates) {
        if (Array.isArray(disabledDates)) {
          return disabledDates.some(
            disabledDate => date.toDateString() === disabledDate.toDateString()
          );
        }
        return disabledDates(date);
      }

      return false;
    },
    [minDate, maxDate, disabledDates]
  );

  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    switch (variant) {
      case "date":
        return "Select date...";
      case "datetime":
        return "Select date and time...";
      case "time":
        return "Select time...";
      case "month":
        return "Select month...";
      case "year":
        return "Select year...";
      default:
        return "Select date...";
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedDate = parseDate(field.value);

        const handleDateSelect = (date: Date | undefined) => {
          if (variant === "time" && date && selectedDate) {
            // For time variant, preserve the original date and only update time
            const newDate = new Date(selectedDate);
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
            field.onChange(newDate.toISOString());
          } else {
            field.onChange(date ? date.toISOString() : "");
          }

          if (variant !== "datetime" && variant !== "time") {
            setOpen(false);
          }
        };

        const handleClear = () => {
          field.onChange("");
          setOpen(false);
        };

        const handleToday = () => {
          const today = new Date();
          field.onChange(today.toISOString());
          setOpen(false);
        };

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            {variant === "time" ? (
              // Time-only picker
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TimeSelect
                    date={selectedDate}
                    onChange={handleDateSelect}
                    disabled={disabled}
                    use24Hour={customFormat?.includes("HH")}
                  />
                </div>
                {allowClear && selectedDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              // Date picker with popover
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? formatDateByVariant(
                            selectedDate,
                            variant,
                            customFormat
                          )
                        : getPlaceholder()}
                      {allowClear && selectedDate && (
                        <X
                          className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            handleClear();
                          }}
                        />
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="space-y-3 p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      showWeekNumbers={showWeekNumbers}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...(calendarProps as any)}
                    />

                    {variant === "datetime" && selectedDate && (
                      <div className="border-t pt-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Time</span>
                        </div>
                        <TimeSelect
                          date={selectedDate}
                          onChange={handleDateSelect}
                          use24Hour={customFormat?.includes("HH")}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToday}
                      >
                        Today
                      </Button>
                      {allowClear && selectedDate && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClear}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * Date Range Picker Component
 * Allows selection of date ranges with presets
 */
export function DateRangePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select date range...",
  disabled = false,
  required = false,
  className,
  allowClear = true,
  minDate,
  maxDate,
  disabledDates,
  format: customFormat = "PPP",
  presets = [
    { label: "Today", value: { from: new Date(), to: new Date() } },
    {
      label: "Last 7 days",
      value: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "This month",
      value: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ],
}: DateRangePickerProps<T>) {
  const [open, setOpen] = React.useState(false);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      if (disabledDates) {
        if (Array.isArray(disabledDates)) {
          return disabledDates.some(
            disabledDate => date.toDateString() === disabledDate.toDateString()
          );
        }
        return disabledDates(date);
      }

      return false;
    },
    [minDate, maxDate, disabledDates]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const dateRange: CustomDateRange = field.value || {};

        // Convert CustomDateRange to DateRange for Calendar component
        const calendarDateRange: DateRange | undefined = dateRange.from
          ? { from: dateRange.from, to: dateRange.to }
          : undefined;

        const handleRangeSelect = (range: DateRange | undefined) => {
          const customRange: CustomDateRange = range
            ? { from: range.from, to: range.to }
            : {};
          field.onChange(customRange);
        };

        const handlePresetSelect = (preset: CustomDateRange) => {
          field.onChange(preset);
          setOpen(false);
        };

        const handleClear = () => {
          field.onChange({});
          setOpen(false);
        };

        const formatRangeDisplay = () => {
          if (dateRange.from) {
            if (dateRange.to) {
              return `${format(dateRange.from, customFormat)} - ${format(dateRange.to, customFormat)}`;
            }
            return format(dateRange.from, customFormat);
          }
          return placeholder;
        };

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatRangeDisplay()}
                    {allowClear && dateRange.from && (
                      <X
                        className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                        onClick={e => {
                          e.stopPropagation();
                          handleClear();
                        }}
                      />
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  {/* Presets */}
                  {presets.length > 0 && (
                    <div className="space-y-1 border-r p-3">
                      <div className="mb-2 text-sm font-medium">
                        Quick Select
                      </div>
                      {presets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handlePresetSelect(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Calendar */}
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      selected={calendarDateRange}
                      onSelect={handleRangeSelect}
                      disabled={isDateDisabled}
                      numberOfMonths={2}
                    />

                    <div className="mt-3 flex gap-2">
                      {allowClear && dateRange.from && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClear}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Convenience components for common use cases
export function DatePicker<T extends FieldValues>(
  props: Omit<EnhancedDatePickerProps<T>, "variant">
) {
  return <EnhancedDatePicker {...props} variant="date" />;
}

export function DateTimePicker<T extends FieldValues>(
  props: Omit<EnhancedDatePickerProps<T>, "variant">
) {
  return <EnhancedDatePicker {...props} variant="datetime" />;
}

export function TimePicker<T extends FieldValues>(
  props: Omit<EnhancedDatePickerProps<T>, "variant">
) {
  return <EnhancedDatePicker {...props} variant="time" />;
}

export function MonthPicker<T extends FieldValues>(
  props: Omit<EnhancedDatePickerProps<T>, "variant">
) {
  return <EnhancedDatePicker {...props} variant="month" />;
}

export function YearPicker<T extends FieldValues>(
  props: Omit<EnhancedDatePickerProps<T>, "variant">
) {
  return <EnhancedDatePicker {...props} variant="year" />;
}

// Export types
