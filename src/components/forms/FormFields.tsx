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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Base form field props following Interface Segregation Principle
interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

// Text input field component
interface TextFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "password" | "tel";
  maxLength?: number;
  autoComplete?: string;
  onValueChange?: (value: string) => void;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  type = "text",
  maxLength,
  autoComplete,
  onValueChange,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete={autoComplete}
              onChange={e => {
                field.onChange(e);
                onValueChange?.(e.target.value);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Textarea field component
interface TextareaFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  rows?: number;
  maxLength?: number;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
}: TextareaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Select field component
interface SelectFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  options: Array<{ value: string; label: string }>;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  options,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Checkbox field component
interface CheckboxFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  labelPosition?: "left" | "right";
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  labelPosition = "right",
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-y-0 space-x-3">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel
                className={labelPosition === "left" ? "order-first" : ""}
              >
                {label}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// NPWP field with auto-formatting
interface NPWPFieldProps<T extends FieldValues>
  extends Omit<BaseFormFieldProps<T>, "placeholder"> {
  formatValue?: (value: string) => string;
  placeholder?: string;
}

export function NPWPField<T extends FieldValues>({
  control,
  name,
  label = "NPWP",
  placeholder = "XX.XXX.XXX.X-XXX.XXX",
  formatValue,
  ...props
}: NPWPFieldProps<T>) {
  const handleValueChange = (value: string) => {
    if (formatValue) {
      return formatValue(value);
    }
    // Default NPWP formatting
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8)}`;
    if (numbers.length <= 12)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9, 12)}.${numbers.slice(12, 15)}`;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {props.required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type="text"
              placeholder={placeholder}
              disabled={props.disabled}
              maxLength={20}
              onChange={e => {
                const formatted = handleValueChange(e.target.value);
                field.onChange(formatted);
              }}
            />
          </FormControl>
          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Phone field with Indonesian formatting
interface PhoneFieldProps<T extends FieldValues>
  extends Omit<BaseFormFieldProps<T>, "placeholder"> {
  placeholder?: string;
}

export function PhoneField<T extends FieldValues>({
  control,
  name,
  label = "Phone Number",
  placeholder = "+62 or 08xx-xxxx-xxxx",
  ...props
}: PhoneFieldProps<T>) {
  return (
    <TextField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      type="tel"
      {...props}
    />
  );
}

// Password field with strength indicator
interface PasswordFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps<T>, "type"> {
  showStrength?: boolean;
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label = "Password",
  placeholder = "Enter your password",
  ...props
}: PasswordFieldProps<T>) {
  return (
    <TextField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      type="password"
      autoComplete="current-password"
      {...props}
    />
  );
}
