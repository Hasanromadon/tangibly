"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    setIsChanging(true);

    // Store the selected locale in localStorage
    localStorage.setItem("locale", newLocale);

    // Redirect to the same path but with new locale
    const segments = pathname.split("/");

    // Remove current locale from path if it exists
    if (locales.includes(segments[1] as Locale)) {
      segments.splice(1, 1);
    }

    // Add new locale to path
    const newPath = `/${newLocale}${segments.join("/")}`;

    router.push(newPath);

    // Reload to apply new locale
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className={className}>
      <Select
        value={currentLocale}
        onValueChange={(value: Locale) => handleLocaleChange(value)}
        disabled={isChanging}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{localeFlags[currentLocale]}</span>
              <span>{localeNames[currentLocale]}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map(locale => (
            <SelectItem key={locale} value={locale}>
              <div className="flex items-center gap-2">
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Compact version for headers/navbars
export function CompactLanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = () => {
    const newLocale = currentLocale === "en" ? "id" : "en";
    setIsChanging(true);

    localStorage.setItem("locale", newLocale);

    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments.splice(1, 1);
    }

    const newPath = `/${newLocale}${segments.join("/")}`;
    router.push(newPath);

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLocaleChange}
      disabled={isChanging}
      className={className}
    >
      <div className="flex items-center gap-1">
        <span>{localeFlags[currentLocale]}</span>
        <span className="text-xs">{currentLocale.toUpperCase()}</span>
      </div>
    </Button>
  );
}
