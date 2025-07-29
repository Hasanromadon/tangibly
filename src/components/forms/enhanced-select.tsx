/**
 * Enhanced Select Components - Fixed Version
 * Reusable select components with support for various option formats and configurations
 */

import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

// Types for different option formats
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

export type SelectOptions =
  | SelectOption[]
  | SelectGroupOption[]
  | string[]
  | Record<string, string>;

// Base props for all select components
interface BaseSelectProps<T extends FieldValues> {
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

// Enhanced Select Field Props
interface EnhancedSelectFieldProps<T extends FieldValues>
  extends BaseSelectProps<T> {
  options: SelectOptions;
  allowClear?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

/**
 * Utility function to normalize options to SelectOption format
 */
function normalizeOptions(
  options: SelectOptions
): SelectOption[] | SelectGroupOption[] {
  if (Array.isArray(options)) {
    // Handle string array
    if (typeof options[0] === "string") {
      return (options as string[]).map(option => ({
        value: option,
        label: option,
      }));
    }

    // Handle SelectOption[] or SelectGroupOption[]
    return options as SelectOption[] | SelectGroupOption[];
  }

  // Handle Record<string, string>
  return Object.entries(options as Record<string, string>).map(
    ([value, label]) => ({
      value,
      label,
    })
  );
}

/**
 * Check if options are grouped
 */
function isGroupedOptions(
  options: SelectOption[] | SelectGroupOption[]
): options is SelectGroupOption[] {
  return options.length > 0 && "options" in options[0];
}

/**
 * Enhanced Select Field Component
 * Supports various option formats, search, clear, and custom rendering
 */
export function EnhancedSelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option...",
  disabled = false,
  required = false,
  className,
  options,
  allowClear = false,
  searchable = false,
  multiple = false,
  loading = false,
  emptyMessage = "No options found",
  onSearch,
  renderOption,
}: EnhancedSelectFieldProps<T>) {
  const normalizedOptions = normalizeOptions(options);
  const isGrouped = isGroupedOptions(normalizedOptions);
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return normalizedOptions;

    if (isGrouped) {
      return (normalizedOptions as SelectGroupOption[])
        .map(group => ({
          ...group,
          options: group.options.filter(
            option =>
              option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              option.value.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(group => group.options.length > 0);
    }

    return (normalizedOptions as SelectOption[]).filter(
      option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedOptions, searchQuery, isGrouped]);

  // Handle search
  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  if (searchable) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
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
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    {field.value
                      ? (() => {
                          const selectedOption = isGrouped
                            ? (filteredOptions as SelectGroupOption[])
                                .flatMap(group => group.options)
                                .find(option => option.value === field.value)
                            : (filteredOptions as SelectOption[]).find(
                                option => option.value === field.value
                              );

                          return renderOption
                            ? renderOption(selectedOption!)
                            : selectedOption?.label;
                        })()
                      : placeholder}
                    <div className="flex items-center gap-2">
                      {allowClear && field.value && (
                        <X
                          className="h-4 w-4 opacity-50 hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            field.onChange("");
                          }}
                        />
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search options..."
                    value={searchQuery}
                    onValueChange={handleSearch}
                  />
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  {loading ? (
                    <div className="text-muted-foreground p-2 text-sm">
                      Loading...
                    </div>
                  ) : (
                    <>
                      {isGrouped ? (
                        (filteredOptions as SelectGroupOption[]).map(group => (
                          <CommandGroup key={group.label} heading={group.label}>
                            {group.options.map(option => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                onSelect={() => {
                                  field.onChange(option.value);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === option.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-1 items-center gap-2">
                                  {option.icon}
                                  <div className="flex-1">
                                    <div>{option.label}</div>
                                    {option.description && (
                                      <div className="text-muted-foreground text-xs">
                                        {option.description}
                                      </div>
                                    )}
                                  </div>
                                  {option.badge && (
                                    <Badge variant={option.badge.variant}>
                                      {option.badge.text}
                                    </Badge>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))
                      ) : (
                        <CommandGroup>
                          {(filteredOptions as SelectOption[]).map(option => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              onSelect={() => {
                                field.onChange(option.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-1 items-center gap-2">
                                {option.icon}
                                <div className="flex-1">
                                  <div>{option.label}</div>
                                  {option.description && (
                                    <div className="text-muted-foreground text-xs">
                                      {option.description}
                                    </div>
                                  )}
                                </div>
                                {option.badge && (
                                  <Badge variant={option.badge.variant}>
                                    {option.badge.text}
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Standard select
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled || loading}
          >
            <FormControl>
              <SelectTrigger className="relative">
                <SelectValue placeholder={placeholder} />
                {allowClear && field.value && (
                  <X
                    className="absolute right-8 h-4 w-4 opacity-50 hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation();
                      field.onChange("");
                    }}
                  />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loading ? (
                <div className="text-muted-foreground p-2 text-sm">
                  Loading...
                </div>
              ) : (
                <>
                  {isGrouped
                    ? (normalizedOptions as SelectGroupOption[]).map(group => (
                        <div key={group.label}>
                          <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                            {group.label}
                          </div>
                          {group.options.map(option => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                            >
                              <div className="flex w-full items-center gap-2">
                                {option.icon}
                                <div className="flex-1">
                                  <div>{option.label}</div>
                                  {option.description && (
                                    <div className="text-muted-foreground text-xs">
                                      {option.description}
                                    </div>
                                  )}
                                </div>
                                {option.badge && (
                                  <Badge variant={option.badge.variant}>
                                    {option.badge.text}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))
                    : (normalizedOptions as SelectOption[]).map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          <div className="flex w-full items-center gap-2">
                            {option.icon}
                            <div className="flex-1">
                              <div>{option.label}</div>
                              {option.description && (
                                <div className="text-muted-foreground text-xs">
                                  {option.description}
                                </div>
                              )}
                            </div>
                            {option.badge && (
                              <Badge variant={option.badge.variant}>
                                {option.badge.text}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                </>
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
